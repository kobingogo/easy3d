import type { Phase1AssetPackSnapshot } from './asset-pack'
import type { Phase1Category, Phase1Preset, UnlockStatus } from './types'

export type Phase1WorkflowType = 'seller_asset_pack_phase1'
export type Phase1UploadMode = 'single' | 'multiview'
export type Phase1AssetPackSnapshotStatus = 'idle' | 'materializing'

export interface Phase1AnalysisSummary {
  subcategory?: string
  materials?: string[]
  keyFeatures?: string[]
}

export interface Phase1ModelMetadata {
  workflowType: Phase1WorkflowType
  category: Phase1Category
  presetKey: Phase1Preset['key']
  uploadMode: Phase1UploadMode
  workflowTemplateId?: string
  brandProfileId?: string | null
  unlockStatus: UnlockStatus
  analysisSummary: Phase1AnalysisSummary
  assetPackPreviewReady: boolean
  assetPackSnapshotStatus: Phase1AssetPackSnapshotStatus
  assetPackSnapshot?: Phase1AssetPackSnapshot
}

export interface BuildPhase1ModelMetadataInput {
  category: Phase1Category
  presetKey: Phase1Preset['key']
  uploadMode: Phase1UploadMode
  workflowTemplateId?: string
  brandProfileId?: string | null
  analysisSummary?: Phase1AnalysisSummary
  unlockStatus?: UnlockStatus
  assetPackPreviewReady?: boolean
  assetPackSnapshotStatus?: Phase1AssetPackSnapshotStatus
  assetPackSnapshot?: Phase1AssetPackSnapshot
}

export function buildPhase1ModelMetadata(
  input: BuildPhase1ModelMetadataInput
): Phase1ModelMetadata {
  const assetPackPreviewReady = input.assetPackPreviewReady ?? false
  const assetPackSnapshotStatus = input.assetPackSnapshotStatus ?? 'idle'
  const assetPackSnapshot = input.assetPackSnapshot

  if (assetPackSnapshotStatus === 'materializing' && assetPackPreviewReady) {
    throw new Error(
      'assetPackSnapshotStatus=materializing cannot be preview ready'
    )
  }

  if (assetPackSnapshotStatus === 'materializing' && assetPackSnapshot) {
    throw new Error(
      'assetPackSnapshotStatus=materializing cannot include assetPackSnapshot'
    )
  }

  if (assetPackPreviewReady && !assetPackSnapshot) {
    throw new Error(
      'assetPackSnapshot is required when assetPackPreviewReady is true'
    )
  }

  return {
    workflowType: 'seller_asset_pack_phase1',
    category: input.category,
    presetKey: input.presetKey,
    uploadMode: input.uploadMode,
    ...(input.workflowTemplateId ? { workflowTemplateId: input.workflowTemplateId } : {}),
    ...(typeof input.brandProfileId !== 'undefined' ? { brandProfileId: input.brandProfileId } : {}),
    unlockStatus: input.unlockStatus ?? 'preview_only',
    analysisSummary: normalizeAnalysisSummary(input.analysisSummary),
    assetPackPreviewReady,
    assetPackSnapshotStatus,
    assetPackSnapshot,
  }
}

function normalizeAnalysisSummary(
  summary: Phase1AnalysisSummary | undefined
): Phase1AnalysisSummary {
  if (!summary) {
    return {}
  }

  const normalized = {
    subcategory: summary.subcategory?.trim() || undefined,
    materials: normalizeList(summary.materials),
    keyFeatures: normalizeList(summary.keyFeatures),
  }

  return stripUndefined(normalized)
}

function normalizeList(list: string[] | undefined): string[] | undefined {
  if (!list) {
    return undefined
  }

  const values = Array.from(
    new Set(
      list
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )

  return values.length > 0 ? values : undefined
}

function stripUndefined<T extends Record<string, unknown>>(
  value: T
): T {
  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      output[key] = item
    }
  }
  return output as T
}
