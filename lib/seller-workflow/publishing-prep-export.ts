import { zipSync } from 'fflate'
import type {
  Phase1AssetPackSnapshot,
  Phase1PublishingPrep,
  Phase1PublishingPrepPlatform,
  Phase1PublishingPrepVariant,
} from './asset-pack'

export const PHASE1_PUBLISHING_PACK_ZIP_FILE_NAME = 'phase1-publishing-pack.zip'

export const PHASE1_PUBLISHING_PACK_ENTRY_ORDER = [
  'publishing/README.md',
  'publishing/recommended-playbook.md',
  'publishing/taobao-variants.md',
  'publishing/xiaohongshu-variants.md',
  'publishing/douyin-variants.md',
  'publishing/cover-suggestions.md',
  'publishing/recommendation-audit.md',
  'publishing/publishing-prep.json',
] as const

type PublishingPlatform = Phase1PublishingPrepPlatform['platform']

interface PublishingFeedbackExportLike {
  nextRecommendationByPlatform?: Partial<Record<PublishingPlatform, string>>
  recommendationAuditTrail?: Array<{
    platform: PublishingPlatform
    variantId: string
    appliedAt?: string
    appliedBy?: string
  }>
}

interface CreatePhase1PublishingPrepExportZipBytesInput {
  snapshot: Phase1AssetPackSnapshot
  publishingFeedback?: PublishingFeedbackExportLike | null
}

const textEncoder = new TextEncoder()

export function createPhase1PublishingPrepExportZipBytes(
  input: CreatePhase1PublishingPrepExportZipBytesInput
): Uint8Array {
  const prep = input.snapshot.publishingPrep
  const feedback = input.publishingFeedback
  if (!prep || !Array.isArray(prep.platforms) || prep.platforms.length === 0) {
    throw new Error('Publishing prep is not ready')
  }

  const entries: Record<string, Uint8Array> = {}
  addTextEntry(entries, 'publishing/README.md', buildReadme())
  addTextEntry(
    entries,
    'publishing/recommended-playbook.md',
    buildRecommendedPlaybook(prep, feedback)
  )
  addTextEntry(
    entries,
    'publishing/taobao-variants.md',
    buildPlatformVariants(prep, 'taobao', feedback)
  )
  addTextEntry(
    entries,
    'publishing/xiaohongshu-variants.md',
    buildPlatformVariants(prep, 'xiaohongshu', feedback)
  )
  addTextEntry(
    entries,
    'publishing/douyin-variants.md',
    buildPlatformVariants(prep, 'douyin', feedback)
  )
  addTextEntry(entries, 'publishing/cover-suggestions.md', buildCoverSuggestions(prep))
  addTextEntry(
    entries,
    'publishing/recommendation-audit.md',
    buildRecommendationAudit(feedback)
  )
  addTextEntry(
    entries,
    'publishing/publishing-prep.json',
    JSON.stringify(buildPublishingPrepExportPayload(prep, feedback), null, 2)
  )

  return zipSync(entries, { level: 6 })
}

function addTextEntry(
  entries: Record<string, Uint8Array>,
  filename: string,
  content: string
) {
  entries[filename] = textEncoder.encode(content)
}

function buildReadme(): string {
  return [
    '# 发布包导出',
    '',
    '该 ZIP 用于直接复用到电商上新与内容发布流程，包含：',
    '- 三个平台的候选文案（每个平台 3 个版本）',
    '- 推荐优先发布版本（Recommended Playbook）',
    '- 封面建议（主题、镜头、视觉提示、封面字）',
    '- 原始结构化 JSON（便于后续自动化或二次处理）',
    '',
    '建议用法：先发推荐版本，再根据数据反馈做 A/B 微调。',
    '',
  ].join('\n')
}

function buildRecommendedPlaybook(
  prep: Phase1PublishingPrep,
  feedback?: PublishingFeedbackExportLike | null
): string {
  const lines = ['# Recommended Playbook', '']

  for (const platform of prep.platforms) {
    const resolvedRecommendedVariantId = resolveRecommendedVariantId(
      platform,
      feedback
    )
    const latestAudit = getLatestRecommendationAudit(platform.platform, feedback)
    const hasAppliedOverride =
      resolvedRecommendedVariantId !== platform.recommendedVariantId
    const recommended =
      platform.variants.find(
        (variant) => variant.id === resolvedRecommendedVariantId
      ) || platform.variants[0]

    lines.push(`## ${platformName(platform.platform)}`)
    lines.push(`- 当前下一轮推荐: ${resolvedRecommendedVariantId}`)
    if (hasAppliedOverride) {
      lines.push(`- 默认推荐版本: ${platform.recommendedVariantId}`)
    }
    lines.push(`- 标题: ${recommended?.title || 'N/A'}`)
    lines.push(
      `- 封面建议: ${platform.coverSuggestion.theme} / ${platform.coverSuggestion.shotType}`
    )
    lines.push(
      `- 封面字: ${platform.coverSuggestion.overlayText}`
    )
    lines.push(
      `- 标签: ${recommended ? renderTags(recommended.tags) : '#待补充'}`
    )
    if (hasAppliedOverride && latestAudit) {
      lines.push(
        `- 应用记录: ${latestAudit.appliedAt} / ${latestAudit.appliedBy || 'user:unknown'}`
      )
    }
    lines.push('')
  }

  return lines.join('\n')
}

function buildPlatformVariants(
  prep: Phase1PublishingPrep,
  platform: 'taobao' | 'xiaohongshu' | 'douyin',
  feedback?: PublishingFeedbackExportLike | null
): string {
  const group = prep.platforms.find((item) => item.platform === platform)
  if (!group) {
    return `# ${platformName(platform)} 发布候选\n\n暂无数据\n`
  }

  const resolvedRecommendedVariantId = resolveRecommendedVariantId(group, feedback)
  const lines = [`# ${platformName(platform)} 发布候选`, '']
  lines.push(`当前下一轮推荐: ${resolvedRecommendedVariantId}`)
  if (resolvedRecommendedVariantId !== group.recommendedVariantId) {
    lines.push(`默认推荐版本: ${group.recommendedVariantId}`)
  }
  lines.push('')

  for (const variant of group.variants) {
    lines.push(renderVariant(variant, variant.id === resolvedRecommendedVariantId))
    lines.push('')
  }

  return lines.join('\n')
}

function renderVariant(
  variant: Phase1PublishingPrepVariant,
  isCurrentRecommended: boolean
): string {
  return [
    `## ${variant.id.toUpperCase()} - ${variant.title}${isCurrentRecommended ? '（当前推荐）' : ''}`,
    '',
    variant.content,
    '',
    `标签: ${renderTags(variant.tags)}`,
  ].join('\n')
}

function buildCoverSuggestions(prep: Phase1PublishingPrep): string {
  const lines = ['# 封面建议', '']

  for (const platform of prep.platforms) {
    lines.push(`## ${platformName(platform.platform)}`)
    lines.push(`- 主题: ${platform.coverSuggestion.theme}`)
    lines.push(`- 镜头类型: ${platform.coverSuggestion.shotType}`)
    lines.push(`- 视觉提示: ${platform.coverSuggestion.visualCue}`)
    lines.push(`- 封面字: ${platform.coverSuggestion.overlayText}`)
    lines.push('')
  }

  return lines.join('\n')
}

function buildRecommendationAudit(
  feedback?: PublishingFeedbackExportLike | null
): string {
  const trail = normalizeRecommendationAuditTrail(
    feedback?.recommendationAuditTrail || []
  )
  const lines = ['# Recommendation Audit', '']

  if (trail.length === 0) {
    lines.push('暂无“下一轮推荐”应用记录。')
    lines.push('')
    return lines.join('\n')
  }

  lines.push('| 时间 | 平台 | 版本 | 操作人 |')
  lines.push('| --- | --- | --- | --- |')
  for (const item of trail) {
    lines.push(
      `| ${item.appliedAt} | ${platformName(item.platform)} | ${item.variantId.toUpperCase()} | ${item.appliedBy || 'user:unknown'} |`
    )
  }
  lines.push('')
  return lines.join('\n')
}

function buildPublishingPrepExportPayload(
  prep: Phase1PublishingPrep,
  feedback?: PublishingFeedbackExportLike | null
) {
  const recommendationState = {
    nextRecommendationByPlatform: normalizeNextRecommendationByPlatform(
      feedback?.nextRecommendationByPlatform
    ),
    recommendationAuditTrail: normalizeRecommendationAuditTrail(
      feedback?.recommendationAuditTrail || []
    ),
  }

  return {
    ...prep,
    platforms: prep.platforms.map((platform) => ({
      ...platform,
      defaultRecommendedVariantId: platform.recommendedVariantId,
      recommendedVariantId: resolveRecommendedVariantId(platform, feedback),
    })),
    recommendationState,
  }
}

function renderTags(tags: string[]): string {
  return tags.join(' ')
}

function platformName(platform: Phase1PublishingPrepPlatform['platform']): string {
  if (platform === 'taobao') {
    return '淘宝'
  }
  if (platform === 'xiaohongshu') {
    return '小红书'
  }
  return '抖音'
}

function resolveRecommendedVariantId(
  platform: Phase1PublishingPrepPlatform,
  feedback?: PublishingFeedbackExportLike | null
): string {
  const override = normalizeVariantId(
    feedback?.nextRecommendationByPlatform?.[platform.platform]
  )
  if (override && platform.variants.some((variant) => variant.id === override)) {
    return override
  }
  return platform.recommendedVariantId
}

function normalizeVariantId(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return undefined
  }
  return normalized
}

function normalizeNextRecommendationByPlatform(
  value: PublishingFeedbackExportLike['nextRecommendationByPlatform'] | undefined
): Partial<Record<PublishingPlatform, string>> {
  const output: Partial<Record<PublishingPlatform, string>> = {}
  if (!value) {
    return output
  }

  for (const platform of ['taobao', 'xiaohongshu', 'douyin'] as const) {
    const variantId = normalizeVariantId(value[platform])
    if (variantId) {
      output[platform] = variantId
    }
  }

  return output
}

function normalizeRecommendationAuditTrail(
  value: NonNullable<PublishingFeedbackExportLike['recommendationAuditTrail']>
) {
  const output: Array<{
    platform: PublishingPlatform
    variantId: string
    appliedAt: string
    appliedBy?: string
  }> = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }
    if (!isPublishingPlatform(item.platform)) {
      continue
    }

    const variantId = normalizeVariantId(item.variantId)
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

function getLatestRecommendationAudit(
  platform: PublishingPlatform,
  feedback?: PublishingFeedbackExportLike | null
) {
  const trail = normalizeRecommendationAuditTrail(
    feedback?.recommendationAuditTrail || []
  )
  for (let index = trail.length - 1; index >= 0; index -= 1) {
    if (trail[index].platform === platform) {
      return trail[index]
    }
  }
  return null
}

function isPublishingPlatform(value: string): value is PublishingPlatform {
  return value === 'taobao' || value === 'xiaohongshu' || value === 'douyin'
}

function normalizeAppliedBy(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  if (!normalized) {
    return undefined
  }
  return normalized.slice(0, 120)
}
