import { NextRequest, NextResponse } from 'next/server'
import { getTaskStatus, isTripoConfigured, type TripoTaskStatus } from '@/lib/tripo'
import { createClient } from '@/lib/supabase/server'
import {
  materializePhase1AssetPackSnapshot,
  type Phase1AssetPackSnapshot,
} from '@/lib/seller-workflow/asset-pack'
import {
  buildPhase1ModelMetadata,
  type Phase1ModelMetadata,
} from '@/lib/seller-workflow/model-metadata'

interface ModelRow {
  id: string
  status: string
  metadata: unknown
  model_3d_url: string | null
  thumbnail_url: string | null
  original_image_url: string | null
  updated_at: string
}

interface StatusResponseInput {
  status: TripoTaskStatus
  modelId: string | null
}

function asPhase1ModelMetadata(metadata: unknown): Phase1ModelMetadata | null {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const candidate = metadata as Partial<Phase1ModelMetadata>
  if (candidate.workflowType !== 'seller_asset_pack_phase1') {
    return null
  }
  if (candidate.category !== 'bags' || candidate.presetKey !== 'bag-studio-phase1') {
    return null
  }
  if (candidate.uploadMode !== 'single' && candidate.uploadMode !== 'multiview') {
    return null
  }

  return candidate as Phase1ModelMetadata
}

function hasSnapshotReady(metadata: Phase1ModelMetadata): boolean {
  return Boolean(metadata.assetPackPreviewReady && metadata.assetPackSnapshot)
}

function shouldMaterializeSnapshot(
  metadata: Phase1ModelMetadata | null
): metadata is Phase1ModelMetadata {
  if (!metadata) {
    return false
  }
  if (metadata.assetPackSnapshotStatus === 'materializing') {
    return false
  }
  return !hasSnapshotReady(metadata)
}

function buildMaterializingMetadata(metadata: Phase1ModelMetadata): Phase1ModelMetadata {
  return buildPhase1ModelMetadata({
    category: metadata.category,
    presetKey: metadata.presetKey,
    uploadMode: metadata.uploadMode,
    unlockStatus: metadata.unlockStatus,
    analysisSummary: metadata.analysisSummary,
    assetPackPreviewReady: false,
    assetPackSnapshotStatus: 'materializing',
  })
}

function buildSnapshotReadyMetadata(
  metadata: Phase1ModelMetadata,
  snapshot: Phase1AssetPackSnapshot
): Phase1ModelMetadata {
  return buildPhase1ModelMetadata({
    category: metadata.category,
    presetKey: metadata.presetKey,
    uploadMode: metadata.uploadMode,
    unlockStatus: metadata.unlockStatus,
    analysisSummary: metadata.analysisSummary,
    assetPackPreviewReady: true,
    assetPackSnapshotStatus: 'idle',
    assetPackSnapshot: snapshot,
  })
}

function buildSnapshotIdleMetadata(metadata: Phase1ModelMetadata): Phase1ModelMetadata {
  return buildPhase1ModelMetadata({
    category: metadata.category,
    presetKey: metadata.presetKey,
    uploadMode: metadata.uploadMode,
    unlockStatus: metadata.unlockStatus,
    analysisSummary: metadata.analysisSummary,
    assetPackPreviewReady: false,
    assetPackSnapshotStatus: 'idle',
  })
}

function buildMaterializationProductDescription(
  metadata: Phase1ModelMetadata
): string {
  const summary = metadata.analysisSummary
  const parts = [
    `category=${metadata.category}`,
    summary.subcategory ? `subcategory=${summary.subcategory}` : '',
    summary.materials && summary.materials.length > 0
      ? `materials=${summary.materials.join('/')}`
      : '',
    summary.keyFeatures && summary.keyFeatures.length > 0
      ? `features=${summary.keyFeatures.join('/')}`
      : '',
  ].filter(Boolean)

  return parts.join('; ')
}

function buildStatusResponse(input: StatusResponseInput) {
  const modelUrl =
    input.status.data.output?.pbr_model || input.status.data.result?.pbr_model?.url
  const thumbnailUrl =
    input.status.data.output?.rendered_image ||
    input.status.data.result?.rendered_image?.url

  return {
    success: true,
    taskId: input.status.data.task_id,
    modelId: input.modelId,
    status: input.status.data.status,
    progress: input.status.data.progress,
    modelUrl,
    thumbnailUrl,
    error: input.status.data.error?.message,
  }
}

async function fetchModelByTaskId(supabase: any, taskId: string): Promise<ModelRow | null> {
  const { data, error } = await supabase
    .from('models')
    .select(
      'id,status,metadata,model_3d_url,thumbnail_url,original_image_url,updated_at'
    )
    .eq('trip_task_id', taskId)
    .maybeSingle()

  if (error) {
    console.error('[tripo/status] Failed to fetch model by task id:', error)
    return null
  }

  return data as ModelRow | null
}

async function fetchModelById(supabase: any, modelId: string): Promise<ModelRow | null> {
  const { data, error } = await supabase
    .from('models')
    .select(
      'id,status,metadata,model_3d_url,thumbnail_url,original_image_url,updated_at'
    )
    .eq('id', modelId)
    .maybeSingle()

  if (error) {
    console.error('[tripo/status] Failed to fetch model by id:', error)
    return null
  }

  return data as ModelRow | null
}

async function tryAcquireSnapshotLock(input: {
  supabase: any
  model: ModelRow
  metadata: Phase1ModelMetadata
}): Promise<boolean> {
  const lockMetadata = buildMaterializingMetadata(input.metadata)

  const { data, error } = await input.supabase
    .from('models')
    .update({ metadata: lockMetadata })
    .eq('id', input.model.id)
    .eq('updated_at', input.model.updated_at)
    .eq('metadata->>assetPackSnapshotStatus', 'idle')
    .select('id')

  if (error) {
    console.error('[tripo/status] Failed to acquire snapshot lock:', error)
    return false
  }

  return Array.isArray(data) && data.length > 0
}

async function materializeSnapshotIfNeeded(input: {
  supabase: any
  model: ModelRow
  modelDownloadUrl: string
  sourceImageUrl: string
}) {
  const metadata = asPhase1ModelMetadata(input.model.metadata)
  if (!shouldMaterializeSnapshot(metadata)) {
    return
  }

  const lockAcquired = await tryAcquireSnapshotLock({
    supabase: input.supabase,
    model: input.model,
    metadata,
  })
  if (!lockAcquired) {
    return
  }

  try {
    const snapshot = await materializePhase1AssetPackSnapshot({
      modelId: input.model.id,
      category: metadata.category,
      presetKey: metadata.presetKey,
      productDescription: buildMaterializationProductDescription(metadata),
      analysisSummary: metadata.analysisSummary,
      sourceImageUrl: input.sourceImageUrl,
      modelDownloadUrl: input.modelDownloadUrl,
    })

    await input.supabase
      .from('models')
      .update({
        metadata: buildSnapshotReadyMetadata(metadata, snapshot),
      })
      .eq('id', input.model.id)
  } catch (error) {
    console.error('[tripo/status] Snapshot materialization failed:', error)
    await input.supabase
      .from('models')
      .update({
        metadata: buildSnapshotIdleMetadata(metadata),
      })
      .eq('id', input.model.id)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    if (!isTripoConfigured()) {
      return NextResponse.json({ error: 'Tripo API Key not configured' }, { status: 500 })
    }

    const status = await getTaskStatus(taskId)
    const modelUrl =
      status.data.output?.pbr_model || status.data.result?.pbr_model?.url || null
    const thumbnailUrl =
      status.data.output?.rendered_image ||
      status.data.result?.rendered_image?.url ||
      null

    const supabase = await createClient()
    const model = await fetchModelByTaskId(supabase, taskId)
    const modelId = model?.id ?? null

    if (model) {
      if (status.data.status === 'success') {
        const modelDownloadUrl = modelUrl || model.model_3d_url
        const sourceImageUrl =
          thumbnailUrl || model.thumbnail_url || model.original_image_url

        await supabase
          .from('models')
          .update({
            model_3d_url: modelDownloadUrl,
            thumbnail_url: sourceImageUrl,
            status: 'completed',
          })
          .eq('id', model.id)

        if (modelDownloadUrl && sourceImageUrl) {
          const latestModel = await fetchModelById(supabase, model.id)
          if (latestModel) {
            await materializeSnapshotIfNeeded({
              supabase,
              model: latestModel,
              modelDownloadUrl,
              sourceImageUrl,
            })
          }
        }
      } else if (status.data.status === 'failed') {
        await supabase
          .from('models')
          .update({
            status: 'failed',
          })
          .eq('id', model.id)
      }
    }

    return NextResponse.json(
      buildStatusResponse({
        status,
        modelId,
      })
    )
  } catch (error: any) {
    console.error('Tripo status API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get task status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

;(GET as typeof GET & {
  __testables?: {
    shouldMaterializeSnapshot: typeof shouldMaterializeSnapshot
    buildMaterializationProductDescription: typeof buildMaterializationProductDescription
  }
}).__testables = {
  shouldMaterializeSnapshot,
  buildMaterializationProductDescription,
}
