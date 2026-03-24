import type { Platform } from '../export/platform-adapter'

interface PublishingPrepVariantLike {
  id: string
  title: string
}

interface PublishingPrepPlatformLike {
  platform: Platform
  recommendedVariantId: string
  variants: PublishingPrepVariantLike[]
}

interface PublishingPrepLike {
  platforms?: PublishingPrepPlatformLike[]
}

interface PublishingFeedbackVariantLike {
  copyCount?: number
  publishResult?: {
    impressions?: number
    clicks?: number
    conversions?: number
  }
}

interface PublishingFeedbackLike {
  nextRecommendationByPlatform?: Partial<Record<Platform, string>>
  byPlatform?: Partial<
    Record<
      Platform,
      {
        byVariant?: Record<string, PublishingFeedbackVariantLike>
      }
    >
  >
}

export interface PublishingVariantPerformance {
  variantId: string
  title: string
  isRecommended: boolean
  copyCount: number
  impressions: number
  clicks: number
  conversions: number
  ctr?: number
  cvr?: number
}

export interface PublishingPlatformPerformance {
  platform: Platform
  recommendedVariantId: string
  bestVariantId: string
  bestBy: 'conversion' | 'click' | 'copy' | 'none'
  variants: PublishingVariantPerformance[]
}

export interface PublishingPerformanceSummary {
  platforms: PublishingPlatformPerformance[]
  hasAnyData: boolean
}

export function buildPublishingPerformanceSummary(input: {
  publishingPrep?: PublishingPrepLike | null
  publishingFeedback?: PublishingFeedbackLike | null
}): PublishingPerformanceSummary {
  const prepPlatforms = input.publishingPrep?.platforms || []

  const platforms = prepPlatforms.map((group) => {
    const resolvedRecommendedVariantId =
      input.publishingFeedback?.nextRecommendationByPlatform?.[group.platform] ||
      group.recommendedVariantId

    const variants: Array<PublishingVariantPerformance & { _score: number }> =
      group.variants.map((variant) => {
        const feedback =
          input.publishingFeedback?.byPlatform?.[group.platform]?.byVariant?.[
            variant.id
          ]
        const impressions = toMetric(feedback?.publishResult?.impressions)
        const clicks = toMetric(feedback?.publishResult?.clicks)
        const conversions = toMetric(feedback?.publishResult?.conversions)
        const copyCount = toMetric(feedback?.copyCount)

        const ctr = impressions > 0 ? clicks / impressions : undefined
        const cvr = clicks > 0 ? conversions / clicks : undefined

        return {
          variantId: variant.id,
          title: variant.title,
          isRecommended: variant.id === resolvedRecommendedVariantId,
          copyCount,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          _score: computeVariantScore({ conversions, clicks, copyCount }),
        }
      })

    variants.sort((a, b) => b._score - a._score)

    const best = pickBestVariant(variants)
    return {
      platform: group.platform,
      recommendedVariantId: resolvedRecommendedVariantId,
      bestVariantId: best.variantId,
      bestBy: best.bestBy,
      variants: variants.map(({ _score, ...rest }) => rest),
    }
  })

  return {
    platforms,
    hasAnyData: platforms.some((platform) =>
      platform.variants.some(
        (variant) =>
          variant.copyCount > 0 ||
          variant.impressions > 0 ||
          variant.clicks > 0 ||
          variant.conversions > 0
      )
    ),
  }
}

function toMetric(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 0
  }
  return Math.trunc(value)
}

function computeVariantScore(input: {
  conversions: number
  clicks: number
  copyCount: number
}): number {
  return input.conversions * 1_000_000 + input.clicks * 1_000 + input.copyCount
}

function pickBestVariant(
  variants: Array<PublishingVariantPerformance & { _score: number }>
): { variantId: string; bestBy: PublishingPlatformPerformance['bestBy'] } {
  const fallback = variants[0]
  if (!fallback) {
    return { variantId: 'v1', bestBy: 'none' }
  }

  if (fallback.conversions > 0) {
    return { variantId: fallback.variantId, bestBy: 'conversion' }
  }
  if (fallback.clicks > 0) {
    return { variantId: fallback.variantId, bestBy: 'click' }
  }
  if (fallback.copyCount > 0) {
    return { variantId: fallback.variantId, bestBy: 'copy' }
  }
  return { variantId: fallback.variantId, bestBy: 'none' }
}
