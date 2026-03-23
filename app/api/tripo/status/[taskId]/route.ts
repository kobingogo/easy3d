import { NextRequest, NextResponse } from 'next/server'
import { getTaskStatus, isTripoConfigured, type TripoTaskStatus } from '@/lib/tripo'
import { createClient } from '@/lib/supabase/server'
import {
  materializePhase1AssetPackSnapshot,
  type Phase1AssetPackSnapshot,
} from '@/lib/seller-workflow/asset-pack'
import { type Phase1ModelMetadata } from '@/lib/seller-workflow/model-metadata'

type RouteLocalPhase1Metadata = Phase1ModelMetadata & {
  materializationFailedAt?: string
  materializationError?: string
}

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

type TripoStatusRouteTestOverrides = {
  createClient?: typeof createClient
  getTaskStatus?: typeof getTaskStatus
  isTripoConfigured?: typeof isTripoConfigured
  materializePhase1AssetPackSnapshot?: typeof materializePhase1AssetPackSnapshot
  nowIso?: () => string
}

const testOverrides: TripoStatusRouteTestOverrides = {}

function asRouteLocalPhase1Metadata(
  metadata: unknown
): RouteLocalPhase1Metadata | null {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const candidate = metadata as Partial<RouteLocalPhase1Metadata>
  if (candidate.workflowType !== 'seller_asset_pack_phase1') {
    return null
  }
  if (candidate.category !== 'bags' || candidate.presetKey !== 'bag-studio-phase1') {
    return null
  }
  if (candidate.uploadMode !== 'single' && candidate.uploadMode !== 'multiview') {
    return null
  }

  const local: RouteLocalPhase1Metadata = {
    ...(candidate as RouteLocalPhase1Metadata),
  }
  if (typeof candidate.materializationFailedAt !== 'string') {
    delete local.materializationFailedAt
  }
  if (typeof candidate.materializationError !== 'string') {
    delete local.materializationError
  }

  return local
}

function sanitizeMetadata<T extends Record<string, unknown>>(input: T): T {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      output[key] = value
    }
  }
  return output as T
}

function hasSnapshotReady(metadata: RouteLocalPhase1Metadata): boolean {
  return Boolean(metadata.assetPackPreviewReady && metadata.assetPackSnapshot)
}

function shouldMaterializeSnapshot(
  metadata: RouteLocalPhase1Metadata | null
): metadata is RouteLocalPhase1Metadata {
  if (!metadata) {
    return false
  }
  if (metadata.assetPackSnapshotStatus === 'materializing') {
    return false
  }
  if (metadata.materializationFailedAt) {
    return false
  }
  return !hasSnapshotReady(metadata)
}

function buildMaterializingMetadata(
  metadata: RouteLocalPhase1Metadata
): RouteLocalPhase1Metadata {
  return sanitizeMetadata({
    ...metadata,
    assetPackPreviewReady: false,
    assetPackSnapshotStatus: 'materializing' as const,
  }) as RouteLocalPhase1Metadata
}

function buildSnapshotReadyMergedMetadata(
  latestMetadata: RouteLocalPhase1Metadata,
  snapshot: Phase1AssetPackSnapshot
): RouteLocalPhase1Metadata {
  return sanitizeMetadata({
    ...latestMetadata,
    assetPackPreviewReady: true,
    assetPackSnapshotStatus: 'idle' as const,
    assetPackSnapshot: snapshot,
    materializationFailedAt: undefined,
    materializationError: undefined,
  }) as RouteLocalPhase1Metadata
}

function buildMaterializationFailureMetadata(
  latestMetadata: RouteLocalPhase1Metadata,
  errorMessage: string,
  failedAt: string
): RouteLocalPhase1Metadata {
  return sanitizeMetadata({
    ...latestMetadata,
    assetPackSnapshotStatus: 'idle' as const,
    materializationFailedAt: failedAt,
    materializationError: errorMessage,
  }) as RouteLocalPhase1Metadata
}

function buildMaterializationProductDescription(
  metadata: RouteLocalPhase1Metadata
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
    throw new Error(`Failed to fetch model by task id: ${error.message || error}`)
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
    throw new Error(`Failed to fetch model by id: ${error.message || error}`)
  }

  return data as ModelRow | null
}

async function updateModelWithGuards(input: {
  supabase: any
  modelId: string
  payload: Record<string, unknown>
  expectedUpdatedAt?: string
  expectedSnapshotStatus?: 'idle' | 'materializing'
}) {
  let query = input.supabase.from('models').update(input.payload).eq('id', input.modelId)
  if (input.expectedUpdatedAt) {
    query = query.eq('updated_at', input.expectedUpdatedAt)
  }
  if (input.expectedSnapshotStatus) {
    query = query.eq(
      'metadata->>assetPackSnapshotStatus',
      input.expectedSnapshotStatus
    )
  }

  const { data, error } = await query.select('id')
  if (error) {
    return { ok: false, error }
  }

  return { ok: Array.isArray(data) && data.length > 0, error: null }
}

async function requireModelUpdate(input: {
  supabase: any
  modelId: string
  payload: Record<string, unknown>
  expectedUpdatedAt?: string
  expectedSnapshotStatus?: 'idle' | 'materializing'
  failureMessage: string
}) {
  const result = await updateModelWithGuards({
    supabase: input.supabase,
    modelId: input.modelId,
    payload: input.payload,
    expectedUpdatedAt: input.expectedUpdatedAt,
    expectedSnapshotStatus: input.expectedSnapshotStatus,
  })

  if (!result.ok) {
    const reason = result.error?.message || 'no rows updated'
    throw new Error(`${input.failureMessage}: ${reason}`)
  }
}

async function tryAcquireSnapshotLock(input: {
  supabase: any
  model: ModelRow
  metadata: RouteLocalPhase1Metadata
}) {
  const lockMetadata = buildMaterializingMetadata(input.metadata)

  const result = await updateModelWithGuards({
    supabase: input.supabase,
    modelId: input.model.id,
    payload: { metadata: lockMetadata },
    expectedUpdatedAt: input.model.updated_at,
    expectedSnapshotStatus: 'idle',
  })

  if (result.error) {
    throw new Error(
      `Failed to acquire snapshot lock: ${result.error.message || result.error}`
    )
  }

  return result.ok
}

async function persistSnapshotWithMerge(input: {
  supabase: any
  modelId: string
  snapshot: Phase1AssetPackSnapshot
}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latestModel = await fetchModelById(input.supabase, input.modelId)
    if (!latestModel) {
      return false
    }

    const latestMetadata = asRouteLocalPhase1Metadata(latestModel.metadata)
    if (!latestMetadata || hasSnapshotReady(latestMetadata)) {
      return true
    }

    const mergedMetadata = buildSnapshotReadyMergedMetadata(
      latestMetadata,
      input.snapshot
    )

    const result = await updateModelWithGuards({
      supabase: input.supabase,
      modelId: input.modelId,
      payload: { metadata: mergedMetadata },
      expectedUpdatedAt: latestModel.updated_at,
      expectedSnapshotStatus: 'materializing',
    })

    if (result.ok) {
      return true
    }
    if (result.error) {
      throw new Error(
        `Failed to persist materialized snapshot: ${
          result.error.message || result.error
        }`
      )
    }
  }

  return false
}

async function persistMaterializationFailure(input: {
  supabase: any
  modelId: string
  errorMessage: string
}) {
  const nowIso = testOverrides.nowIso?.() ?? new Date().toISOString()

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latestModel = await fetchModelById(input.supabase, input.modelId)
    if (!latestModel) {
      return false
    }

    const latestMetadata = asRouteLocalPhase1Metadata(latestModel.metadata)
    if (!latestMetadata || latestMetadata.materializationFailedAt || hasSnapshotReady(latestMetadata)) {
      return true
    }

    const failureMetadata = buildMaterializationFailureMetadata(
      latestMetadata,
      input.errorMessage,
      nowIso
    )

    const result = await updateModelWithGuards({
      supabase: input.supabase,
      modelId: input.modelId,
      payload: { metadata: failureMetadata },
      expectedUpdatedAt: latestModel.updated_at,
      expectedSnapshotStatus: 'materializing',
    })

    if (result.ok) {
      return true
    }
    if (result.error) {
      throw new Error(
        `Failed to persist materialization failure: ${
          result.error.message || result.error
        }`
      )
    }
  }

  return false
}

async function materializeSnapshotIfNeeded(input: {
  supabase: any
  model: ModelRow
  modelDownloadUrl: string
  sourceImageUrl: string
}) {
  const metadata = asRouteLocalPhase1Metadata(input.model.metadata)
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

  const materializeImpl =
    testOverrides.materializePhase1AssetPackSnapshot ??
    materializePhase1AssetPackSnapshot

  try {
    const snapshot = await materializeImpl({
      modelId: input.model.id,
      category: metadata.category,
      presetKey: metadata.presetKey,
      productDescription: buildMaterializationProductDescription(metadata),
      analysisSummary: metadata.analysisSummary,
      sourceImageUrl: input.sourceImageUrl,
      modelDownloadUrl: input.modelDownloadUrl,
    })

    const persisted = await persistSnapshotWithMerge({
      supabase: input.supabase,
      modelId: input.model.id,
      snapshot,
    })
    if (!persisted) {
      throw new Error('Failed to persist materialized snapshot')
    }
  } catch (error: any) {
    const persistedFailure = await persistMaterializationFailure({
      supabase: input.supabase,
      modelId: input.model.id,
      errorMessage: error?.message || 'snapshot materialization failed',
    })

    if (!persistedFailure) {
      throw new Error('Failed to persist materialization failure state')
    }
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const isTripoConfiguredImpl =
      testOverrides.isTripoConfigured ?? isTripoConfigured
    if (!isTripoConfiguredImpl()) {
      return NextResponse.json({ error: 'Tripo API Key not configured' }, { status: 500 })
    }

    const getTaskStatusImpl = testOverrides.getTaskStatus ?? getTaskStatus
    const status = await getTaskStatusImpl(taskId)
    const modelUrl =
      status.data.output?.pbr_model || status.data.result?.pbr_model?.url || null
    const thumbnailUrl =
      status.data.output?.rendered_image ||
      status.data.result?.rendered_image?.url ||
      null

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()
    const model = await fetchModelByTaskId(supabase, taskId)
    const modelId = model?.id ?? null

    if (model) {
      if (status.data.status === 'success') {
        const modelDownloadUrl = modelUrl || model.model_3d_url
        const sourceImageUrl =
          thumbnailUrl || model.thumbnail_url || model.original_image_url

        await requireModelUpdate({
          supabase,
          modelId: model.id,
          payload: {
            model_3d_url: modelDownloadUrl,
            thumbnail_url: sourceImageUrl,
            status: 'completed',
          },
          failureMessage: 'Failed to persist completed model status',
        })

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
        await requireModelUpdate({
          supabase,
          modelId: model.id,
          payload: {
            status: 'failed',
          },
          failureMessage: 'Failed to persist failed model status',
        })
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
    setTestOverrides: (overrides: TripoStatusRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  shouldMaterializeSnapshot,
  buildMaterializationProductDescription,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof TripoStatusRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}
