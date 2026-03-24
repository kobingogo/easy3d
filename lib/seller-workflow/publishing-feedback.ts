import type { Platform } from '../export/platform-adapter'

export type PublishingFeedbackAction =
  | 'copy'
  | 'publish_result'
  | 'set_next_recommendation'

export interface PublishingResultPayload {
  impressions?: number
  clicks?: number
  conversions?: number
  notes?: string
}

export interface PublishingFeedbackVariantState {
  copyCount: number
  lastCopiedAt?: string
  publishResult?: PublishingResultPayload & {
    submittedAt: string
  }
}

export interface PublishingRecommendationAuditItem {
  platform: Platform
  variantId: string
  appliedAt: string
  appliedBy: string
}

export interface PublishingFeedbackState {
  version: 1
  updatedAt: string
  nextRecommendationByPlatform?: Partial<Record<Platform, string>>
  recommendationAuditTrail?: PublishingRecommendationAuditItem[]
  byPlatform: Partial<
    Record<
      Platform,
      {
        byVariant: Record<string, PublishingFeedbackVariantState>
      }
    >
  >
}

export interface ApplyPublishingFeedbackInput {
  platform: Platform
  variantId: string
  action: PublishingFeedbackAction
  publishResult?: PublishingResultPayload
  appliedBy?: string
  nowIso?: string
}

export function isPublishingPlatform(value: string): value is Platform {
  return value === 'taobao' || value === 'xiaohongshu' || value === 'douyin'
}

export function normalizePublishingVariantId(value: string): string {
  return value.trim().toLowerCase()
}

export function applyPublishingFeedbackToMetadata(
  metadata: unknown,
  input: ApplyPublishingFeedbackInput
): { metadata: Record<string, unknown>; feedback: PublishingFeedbackState } {
  const nowIso = input.nowIso || new Date().toISOString()
  const baseMetadata =
    metadata && typeof metadata === 'object'
      ? { ...(metadata as Record<string, unknown>) }
      : {}

  const current = asPublishingFeedbackState(baseMetadata.publishingFeedback)
  const byPlatform = { ...(current?.byPlatform || {}) }
  const nextRecommendationByPlatform = {
    ...(current?.nextRecommendationByPlatform || {}),
  }
  const recommendationAuditTrail = [
    ...(current?.recommendationAuditTrail || []),
  ]
  const platformState = byPlatform[input.platform] || { byVariant: {} }
  const byVariant = { ...platformState.byVariant }
  const existingVariant = byVariant[input.variantId]
  const variantState: PublishingFeedbackVariantState = existingVariant
    ? { ...existingVariant }
    : { copyCount: 0 }

  if (input.action === 'copy') {
    variantState.copyCount += 1
    variantState.lastCopiedAt = nowIso
  } else if (input.action === 'publish_result') {
    variantState.publishResult = normalizePublishingResultPayload(
      input.publishResult,
      nowIso
    )
  } else {
    nextRecommendationByPlatform[input.platform] = input.variantId
    recommendationAuditTrail.push({
      platform: input.platform,
      variantId: input.variantId,
      appliedAt: nowIso,
      appliedBy: normalizeAppliedBy(input.appliedBy),
    })
  }

  byVariant[input.variantId] = variantState
  byPlatform[input.platform] = { byVariant }

  const feedback: PublishingFeedbackState = {
    version: 1,
    updatedAt: nowIso,
    nextRecommendationByPlatform,
    recommendationAuditTrail: recommendationAuditTrail.slice(-30),
    byPlatform,
  }

  baseMetadata.publishingFeedback = feedback
  return { metadata: baseMetadata, feedback }
}

function asPublishingFeedbackState(value: unknown): PublishingFeedbackState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<PublishingFeedbackState>
  if (candidate.version !== 1) {
    return null
  }

  return {
    version: 1,
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : new Date(0).toISOString(),
    nextRecommendationByPlatform: normalizeRecommendationByPlatform(
      candidate.nextRecommendationByPlatform
    ),
    recommendationAuditTrail: normalizeRecommendationAuditTrail(
      candidate.recommendationAuditTrail
    ),
    byPlatform: normalizeByPlatform(candidate.byPlatform),
  }
}

function normalizeRecommendationByPlatform(
  value: PublishingFeedbackState['nextRecommendationByPlatform'] | undefined
): PublishingFeedbackState['nextRecommendationByPlatform'] {
  if (!value) {
    return {}
  }

  const output: PublishingFeedbackState['nextRecommendationByPlatform'] = {}
  for (const platform of ['taobao', 'xiaohongshu', 'douyin'] as const) {
    const variantId = value[platform]
    if (typeof variantId === 'string' && variantId.trim()) {
      output[platform] = variantId.trim().toLowerCase()
    }
  }

  return output
}

function normalizeRecommendationAuditTrail(
  value: PublishingFeedbackState['recommendationAuditTrail'] | undefined
): PublishingFeedbackState['recommendationAuditTrail'] {
  if (!Array.isArray(value)) {
    return []
  }

  const output: PublishingRecommendationAuditItem[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }
    if (!isPublishingPlatform(item.platform)) {
      continue
    }

    const variantId = normalizePublishingVariantId(item.variantId || '')
    if (!variantId) {
      continue
    }

    output.push({
      platform: item.platform,
      variantId,
      appliedAt:
        typeof item.appliedAt === 'string' && item.appliedAt
          ? item.appliedAt
          : new Date(0).toISOString(),
      appliedBy: normalizeAppliedBy(item.appliedBy),
    })
  }

  return output.slice(-30)
}

function normalizeByPlatform(
  value: PublishingFeedbackState['byPlatform'] | undefined
): PublishingFeedbackState['byPlatform'] {
  if (!value) {
    return {}
  }

  const output: PublishingFeedbackState['byPlatform'] = {}
  for (const platform of ['taobao', 'xiaohongshu', 'douyin'] as const) {
    const platformState = value[platform]
    if (!platformState || typeof platformState !== 'object') {
      continue
    }

    const byVariant: Record<string, PublishingFeedbackVariantState> = {}
    const variants = platformState.byVariant || {}
    for (const [variantId, variantState] of Object.entries(variants)) {
      if (!variantState || typeof variantState !== 'object') {
        continue
      }

      const copyCount =
        typeof variantState.copyCount === 'number' && Number.isFinite(variantState.copyCount)
          ? Math.max(0, Math.trunc(variantState.copyCount))
          : 0

      const normalizedVariant: PublishingFeedbackVariantState = {
        copyCount,
      }

      if (typeof variantState.lastCopiedAt === 'string') {
        normalizedVariant.lastCopiedAt = variantState.lastCopiedAt
      }
      if (variantState.publishResult && typeof variantState.publishResult === 'object') {
        const submittedAt =
          typeof variantState.publishResult.submittedAt === 'string'
            ? variantState.publishResult.submittedAt
            : new Date(0).toISOString()
        normalizedVariant.publishResult = normalizePublishingResultPayload(
          variantState.publishResult,
          submittedAt
        )
      }

      byVariant[variantId] = normalizedVariant
    }

    output[platform] = { byVariant }
  }

  return output
}

function normalizePublishingResultPayload(
  value: PublishingResultPayload | undefined,
  submittedAt: string
): PublishingResultPayload & { submittedAt: string } {
  return {
    impressions: normalizeMetric(value?.impressions),
    clicks: normalizeMetric(value?.clicks),
    conversions: normalizeMetric(value?.conversions),
    notes: value?.notes?.trim() || undefined,
    submittedAt,
  }
}

function normalizeMetric(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined
  }
  return Math.trunc(value)
}

function normalizeAppliedBy(value: string | undefined): string {
  const normalized = value?.trim()
  if (!normalized) {
    return 'user:unknown'
  }
  return normalized.slice(0, 120)
}
