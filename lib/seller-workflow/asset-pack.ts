import { generatePlatformCopy } from '../copy/platform-copy'
import type { Platform } from '../export/platform-adapter'
import { getPlatformSpec } from '../export/platform-adapter'
import { getPhase1Preset } from './presets'
import type { Phase1Category, Phase1Preset } from './types'

type AssetMimeType = 'image/jpeg' | 'image/png'
type CopyMimeType = 'text/plain' | 'text/markdown' | 'application/json'
type Phase1ZipEntryPath =
  | 'assets/taobao-main.jpg'
  | 'assets/xiaohongshu-cover.jpg'
  | 'assets/douyin-vertical.jpg'
  | 'copy/taobao-listing.md'
  | 'copy/xiaohongshu-post.md'
  | 'copy/douyin-script.md'
  | 'strategy/strategy-summary.json'
  | 'manifest/asset-pack-manifest.json'
  | 'model/model.glb'

export const PHASE1_ASSET_PACK_ENTRY_ORDER: Phase1ZipEntryPath[] = [
  'assets/taobao-main.jpg',
  'assets/xiaohongshu-cover.jpg',
  'assets/douyin-vertical.jpg',
  'copy/taobao-listing.md',
  'copy/xiaohongshu-post.md',
  'copy/douyin-script.md',
  'strategy/strategy-summary.json',
  'manifest/asset-pack-manifest.json',
  'model/model.glb',
]

const PLATFORM_ASSET_FILENAMES: Record<Platform, Phase1ZipEntryPath> = {
  taobao: 'assets/taobao-main.jpg',
  xiaohongshu: 'assets/xiaohongshu-cover.jpg',
  douyin: 'assets/douyin-vertical.jpg',
}

const PLATFORM_COPY_FILENAMES: Record<Platform, Phase1ZipEntryPath> = {
  taobao: 'copy/taobao-listing.md',
  xiaohongshu: 'copy/xiaohongshu-post.md',
  douyin: 'copy/douyin-script.md',
}

export const PHASE1_ASSET_PACK_FILE_NAMES = {
  taobaoAsset: 'assets/taobao-main.jpg',
  xiaohongshuAsset: 'assets/xiaohongshu-cover.jpg',
  douyinAsset: 'assets/douyin-vertical.jpg',
  taobaoCopy: 'copy/taobao-listing.md',
  xiaohongshuCopy: 'copy/xiaohongshu-post.md',
  douyinCopy: 'copy/douyin-script.md',
  strategy: 'strategy/strategy-summary.json',
  manifest: 'manifest/asset-pack-manifest.json',
  model: 'model/model.glb',
} as const

export interface AssetPackManifest {
  filename: 'manifest/asset-pack-manifest.json'
  model: { downloadUrl: string; filename: 'model/model.glb' }
  assets: Array<{
    platform: Platform
    filename: Phase1ZipEntryPath
    previewUrl: string
    downloadUrl: string
    mimeType: AssetMimeType
    width: number
    height: number
  }>
  copyFiles: Array<{
    filename: Phase1ZipEntryPath
    content: string
    mimeType: CopyMimeType
  }>
  strategyFile: {
    filename: 'strategy/strategy-summary.json'
    content: string
    mimeType: 'application/json'
  }
}

export interface Phase1AssetPackCopy {
  taobao: { title: string; bullets: string[] }
  xiaohongshu: { title: string; content: string; tags: string[] }
  douyin: { hook: string; script: string; tags: string[] }
}

export interface Phase1AssetPackStrategy {
  recommendedPlatform: Platform
  heroAngle: string
  styleDirection: string
  featureFocus: string[]
  materialFocus: string[]
  marketingHook: string
  reasoningSummary: string
}

export interface Phase1PublishingPrepVariant {
  id: 'v1' | 'v2' | 'v3'
  title: string
  content: string
  tags: string[]
}

export interface Phase1PublishingCoverSuggestion {
  theme: string
  shotType: string
  visualCue: string
  overlayText: string
}

export interface Phase1PublishingPrepPlatform {
  platform: Platform
  recommendedVariantId: Phase1PublishingPrepVariant['id']
  coverSuggestion: Phase1PublishingCoverSuggestion
  variants: Phase1PublishingPrepVariant[]
}

export interface Phase1PublishingPrep {
  generatedAt: string
  platforms: Phase1PublishingPrepPlatform[]
}

export interface Phase1AssetPackSnapshot {
  version: 1
  copy: Phase1AssetPackCopy
  strategy: Phase1AssetPackStrategy
  manifest: AssetPackManifest
  publishingPrep?: Phase1PublishingPrep
}

export interface Phase1AssetPack {
  presetKey: Phase1Preset['key']
  modelDownloadUrl: string
  manifest: AssetPackManifest
  snapshot: Phase1AssetPackSnapshot
  strategy: Phase1AssetPackStrategy
  platformAssets: Array<{
    platform: Platform
    width: number
    height: number
    label: string
    filename: Phase1ZipEntryPath
    previewUrl: string
    downloadUrl: string
    mimeType: AssetMimeType
  }>
  copy: Phase1AssetPackCopy
}

export interface Phase1AssetPackZipEntry {
  path: Phase1ZipEntryPath
  mimeType: AssetMimeType | CopyMimeType | 'model/gltf-binary'
  kind: 'remote' | 'text' | 'json'
  downloadUrl?: string
  content?: string
}

export interface BuildPhase1AssetPackInput {
  modelId: string
  category: Phase1Category
  presetKey: Phase1Preset['key']
  thumbnailUrl: string
  modelDownloadUrl: string
  assetPackSnapshot?: Phase1AssetPackSnapshot
}

export interface MaterializePhase1AssetPackSnapshotInput {
  modelId: string
  category: 'bags'
  presetKey: 'bag-studio-phase1'
  productDescription: string
  analysisSummary: {
    subcategory?: string
    materials?: string[]
    keyFeatures?: string[]
  }
  sourceImageUrl: string
  modelDownloadUrl: string
}

export function buildPhase1AssetPack(
  input: BuildPhase1AssetPackInput
): Phase1AssetPack {
  const preset = getPhase1Preset(input.category)
  if (preset.key !== input.presetKey) {
    throw new Error(
      `Preset mismatch: expected ${preset.key}, got ${input.presetKey}`
    )
  }

  if (!input.assetPackSnapshot) {
    throw new Error('assetPackSnapshot is required for buildPhase1AssetPack')
  }

  const snapshotCore = input.assetPackSnapshot

  const manifest = snapshotCore.manifest

  const platformAssets = manifest.assets.map((asset) => {
    const spec = getPlatformSpec(asset.platform)
    return {
      platform: asset.platform,
      width: asset.width,
      height: asset.height,
      label: spec.name,
      filename: asset.filename,
      previewUrl: asset.previewUrl,
      downloadUrl: asset.downloadUrl,
      mimeType: asset.mimeType
    }
  })

  return {
    presetKey: input.presetKey,
    modelDownloadUrl: input.modelDownloadUrl,
    manifest,
    snapshot: snapshotCore,
    strategy: snapshotCore.strategy,
    platformAssets,
    copy: snapshotCore.copy
  }
}

export async function materializePhase1AssetPackSnapshot(
  input: MaterializePhase1AssetPackSnapshotInput
): Promise<Phase1AssetPackSnapshot> {
  const preset = getPhase1Preset(input.category)
  if (preset.key !== input.presetKey) {
    throw new Error(
      `Preset mismatch: expected ${preset.key}, got ${input.presetKey}`
    )
  }

  const keywords = dedupe(
    [...(input.analysisSummary.materials || []), ...(input.analysisSummary.keyFeatures || [])]
      .map((item) => item.trim())
      .filter(Boolean)
  )

  const copyResults = await Promise.all(
    preset.targetPlatforms.map(async (platform) => {
      const result = await generatePlatformCopy({
        productDescription: input.productDescription,
        platform,
        style: getPreferredStyle(platform),
        productAnalysis: {
          category: input.category,
          subcategory: input.analysisSummary.subcategory,
          keywords,
          style: input.analysisSummary.materials
        }
      })

      return [platform, result] as const
    })
  )

  const copyMap = Object.fromEntries(copyResults) as Record<
    Platform,
    Awaited<ReturnType<typeof generatePlatformCopy>>
  >

  const copy: Phase1AssetPackCopy = {
    taobao: {
      title: copyMap.taobao.title,
      bullets: toTaobaoBullets(copyMap.taobao.content, copyMap.taobao.tags)
    },
    xiaohongshu: {
      title: copyMap.xiaohongshu.title,
      content: copyMap.xiaohongshu.content,
      tags: normalizeTags(copyMap.xiaohongshu.tags)
    },
    douyin: {
      hook: toDouyinHook(copyMap.douyin.title, copyMap.douyin.content),
      script: copyMap.douyin.content,
      tags: normalizeTags(copyMap.douyin.tags)
    }
  }

  const strategy = buildDeterministicStrategy({
    category: input.category,
    subcategory: input.analysisSummary.subcategory,
    materials: input.analysisSummary.materials,
    keyFeatures: input.analysisSummary.keyFeatures
  })
  const publishingPrep = buildPhase1PublishingPrep({ copy, strategy })

  const manifest = buildPhase1AssetPackManifest({
    modelId: input.modelId,
    modelDownloadUrl: input.modelDownloadUrl,
    thumbnailUrl: input.sourceImageUrl,
    preset,
    copy,
    strategy
  })

  return {
    version: 1,
    copy,
    strategy,
    manifest,
    publishingPrep
  }
}

export function buildPhase1PublishingPrep(input: {
  copy: Phase1AssetPackCopy
  strategy: Phase1AssetPackStrategy
  nowIso?: string
}): Phase1PublishingPrep {
  const generatedAt = (() => {
    if (input.nowIso) {
      const parsed = new Date(input.nowIso)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }
    return new Date().toISOString()
  })()

  const taobaoVariants: Phase1PublishingPrepVariant[] = [
    {
      id: 'v1',
      title: `${input.copy.taobao.title}｜转化版`,
      content: input.copy.taobao.bullets.join('；'),
      tags: inferTaobaoTags(input.copy, input.strategy),
    },
    {
      id: 'v2',
      title: `${input.copy.taobao.title}｜场景版`,
      content: `围绕${input.strategy.heroAngle}呈现上身场景，重点强化${input.strategy.marketingHook}。`,
      tags: inferTaobaoTags(input.copy, input.strategy),
    },
    {
      id: 'v3',
      title: `${input.copy.taobao.title}｜参数版`,
      content: `卖点拆解：${input.strategy.featureFocus.join(' / ')}；材质重点：${input.strategy.materialFocus.join(' / ')}。`,
      tags: inferTaobaoTags(input.copy, input.strategy),
    },
  ]

  const xiaohongshuVariants: Phase1PublishingPrepVariant[] = [
    {
      id: 'v1',
      title: `${input.copy.xiaohongshu.title}｜转化版`,
      content: input.copy.xiaohongshu.content,
      tags: normalizeTags(input.copy.xiaohongshu.tags),
    },
    {
      id: 'v2',
      title: `${input.copy.xiaohongshu.title}｜场景版`,
      content: `从${input.strategy.heroAngle}切入，结合${input.strategy.styleDirection}，突出真实通勤体验。`,
      tags: normalizeTags(input.copy.xiaohongshu.tags),
    },
    {
      id: 'v3',
      title: `${input.copy.xiaohongshu.title}｜参数版`,
      content: `重点说明${input.strategy.featureFocus.join(' / ')}，并补充${input.strategy.materialFocus.join(' / ')}质感细节。`,
      tags: normalizeTags(input.copy.xiaohongshu.tags),
    },
  ]

  const douyinVariants: Phase1PublishingPrepVariant[] = [
    {
      id: 'v1',
      title: `${input.copy.douyin.hook}｜转化版`,
      content: input.copy.douyin.script,
      tags: normalizeTags(input.copy.douyin.tags),
    },
    {
      id: 'v2',
      title: `${input.copy.douyin.hook}｜场景版`,
      content: `开场 3 秒先给场景冲突，再承接${input.strategy.marketingHook}。`,
      tags: normalizeTags(input.copy.douyin.tags),
    },
    {
      id: 'v3',
      title: `${input.copy.douyin.hook}｜参数版`,
      content: `卖点节奏：${input.strategy.featureFocus.join('、')}；结尾补充${input.strategy.materialFocus.join('、')}。`,
      tags: normalizeTags(input.copy.douyin.tags),
    },
  ]

  return {
    generatedAt,
    platforms: [
      {
        platform: 'taobao',
        recommendedVariantId: 'v1',
        coverSuggestion: {
          theme: '简洁通勤 · 转化主图',
          shotType: '正面三分构图',
          visualCue: '白底干净布光，保留包型比例与五金高光',
          overlayText: input.copy.taobao.title,
        },
        variants: taobaoVariants,
      },
      {
        platform: 'xiaohongshu',
        recommendedVariantId: input.strategy.recommendedPlatform === 'xiaohongshu' ? 'v2' : 'v1',
        coverSuggestion: {
          theme: '场景种草 · 通勤封面',
          shotType: '半身穿搭构图',
          visualCue: '人物与包同框，强调上身比例和材质细节',
          overlayText: input.copy.xiaohongshu.title,
        },
        variants: xiaohongshuVariants,
      },
      {
        platform: 'douyin',
        recommendedVariantId: input.strategy.recommendedPlatform === 'douyin' ? 'v3' : 'v1',
        coverSuggestion: {
          theme: '开场抓眼 · 短视频封面',
          shotType: '近景+手持动态',
          visualCue: '前景标题+中景包体，突出 3 秒识别',
          overlayText: input.copy.douyin.hook,
        },
        variants: douyinVariants,
      },
    ],
  }
}

export function buildPhase1AssetPackManifest(input: {
  modelId: string
  modelDownloadUrl: string
  thumbnailUrl: string
  preset: Phase1Preset
  copy: Phase1AssetPackCopy
  strategy: Phase1AssetPackStrategy
}): AssetPackManifest {
  const assets = input.preset.targetPlatforms.map((platform) => {
    const spec = getPlatformSpec(platform)
    const mimeType: AssetMimeType =
      spec.format === 'png' ? 'image/png' : 'image/jpeg'
    return {
      platform,
      filename: PLATFORM_ASSET_FILENAMES[platform],
      previewUrl: input.thumbnailUrl,
      downloadUrl: `/api/models/${input.modelId}/asset-pack-assets/${platform}`,
      mimeType,
      width: spec.width,
      height: spec.height
    }
  })

  return {
    filename: 'manifest/asset-pack-manifest.json',
    model: {
      downloadUrl: input.modelDownloadUrl,
      filename: 'model/model.glb'
    },
    assets,
    copyFiles: [
      {
        filename: PLATFORM_COPY_FILENAMES.taobao,
        content: serializeTaobaoCopy(input.copy.taobao),
        mimeType: 'text/markdown'
      },
      {
        filename: PLATFORM_COPY_FILENAMES.xiaohongshu,
        content: serializeXiaohongshuCopy(input.copy.xiaohongshu),
        mimeType: 'text/markdown'
      },
      {
        filename: PLATFORM_COPY_FILENAMES.douyin,
        content: serializeDouyinCopy(input.copy.douyin),
        mimeType: 'text/markdown'
      }
    ],
    strategyFile: {
      filename: 'strategy/strategy-summary.json',
      content: JSON.stringify(input.strategy, null, 2),
      mimeType: 'application/json'
    }
  }
}

export function buildPhase1AssetPackZipEntries(
  snapshot: Phase1AssetPackSnapshot
): Phase1AssetPackZipEntry[] {
  return [
    ...snapshot.manifest.assets.map((asset) => ({
      path: asset.filename,
      mimeType: asset.mimeType,
      kind: 'remote' as const,
      downloadUrl: asset.downloadUrl,
    })),
    ...snapshot.manifest.copyFiles.map((file) => ({
      path: file.filename,
      mimeType: file.mimeType,
      kind: 'text' as const,
      content: file.content,
    })),
    {
      path: snapshot.manifest.strategyFile.filename,
      mimeType: snapshot.manifest.strategyFile.mimeType,
      kind: 'json' as const,
      content: snapshot.manifest.strategyFile.content,
    },
    {
      path: snapshot.manifest.filename,
      mimeType: 'application/json' as const,
      kind: 'json' as const,
      content: JSON.stringify(snapshot.manifest, null, 2),
    },
    {
      path: snapshot.manifest.model.filename,
      mimeType: 'model/gltf-binary' as const,
      kind: 'remote' as const,
      downloadUrl: snapshot.manifest.model.downloadUrl,
    },
  ]
}

function getPreferredStyle(platform: Platform): 'casual' | 'professional' | 'trendy' {
  switch (platform) {
    case 'taobao':
      return 'professional'
    case 'xiaohongshu':
      return 'trendy'
    case 'douyin':
      return 'casual'
  }
}

function toTaobaoBullets(content: string, tags: string[]): string[] {
  const candidates = content
    .split(/\n|。|；|;|!|！/)
    .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
    .filter((line) => line.length >= 8)

  const bullets = dedupe(candidates).slice(0, 4)
  if (bullets.length > 0) {
    return bullets
  }

  if (tags.length > 0) {
    return tags.slice(0, 3)
  }

  return ['核心卖点突出', '材质细节清晰', '适配多场景使用']
}

function toDouyinHook(title: string, content: string): string {
  const firstSentence = content
    .split(/\n|。|!|！|\?|？/)
    .map((line) => line.trim())
    .find(Boolean)

  if (firstSentence && firstSentence.length >= 8) {
    return firstSentence.slice(0, 28)
  }

  return title
}

function normalizeTags(tags: string[]): string[] {
  return dedupe(
    tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
  )
}

function buildDeterministicStrategy(input: {
  category: Phase1Category
  subcategory?: string
  materials?: string[]
  keyFeatures?: string[]
}): Phase1AssetPackStrategy {
  const materials = dedupe((input.materials || []).map((item) => item.trim()).filter(Boolean))
  const features = dedupe((input.keyFeatures || []).map((item) => item.trim()).filter(Boolean))
  const subcategory = input.subcategory?.trim() || '通勤包'

  let recommendedPlatform: Platform = 'xiaohongshu'
  if (features.length >= 3) {
    recommendedPlatform = 'taobao'
  } else if (materials.length === 0) {
    recommendedPlatform = 'douyin'
  }

  return {
    recommendedPlatform,
    heroAngle: `${subcategory}场景主图，突出包型比例与上身质感`,
    styleDirection:
      materials.length > 0
        ? `${materials[0]}质感 + 干净布光 + 高级通勤氛围`
        : '干净布光 + 简洁陈列 + 通勤高级感',
    featureFocus: features.length > 0 ? features.slice(0, 4) : ['容量', '分区', '耐用五金'],
    materialFocus: materials.length > 0 ? materials.slice(0, 3) : ['皮质'],
    marketingHook:
      features.length > 0
        ? `突出“${features[0]}”的即时价值感，强化转化`
        : '突出上身气质提升与高频通勤场景价值',
    reasoningSummary: `基于${input.category}/${subcategory}的素材，优先强调质感与实用卖点，保证三平台叙事一致并保留各平台转化语境。`
  }
}

function serializeTaobaoCopy(copy: Phase1AssetPackCopy['taobao']): string {
  const bulletText = copy.bullets.map((item) => `- ${item}`).join('\n')
  return `# ${copy.title}\n\n${bulletText}\n`
}

function serializeXiaohongshuCopy(copy: Phase1AssetPackCopy['xiaohongshu']): string {
  const tags = copy.tags.join(' ')
  return `# ${copy.title}\n\n${copy.content}\n\n${tags}\n`
}

function serializeDouyinCopy(copy: Phase1AssetPackCopy['douyin']): string {
  const tags = copy.tags.join(' ')
  return `# Hook\n${copy.hook}\n\n# Script\n${copy.script}\n\n${tags}\n`
}

function inferTaobaoTags(
  copy: Phase1AssetPackCopy,
  strategy: Phase1AssetPackStrategy
): string[] {
  const featureTags = strategy.featureFocus.map((feature) => `#${feature}`)
  return normalizeTags([
    ...copy.xiaohongshu.tags,
    ...copy.douyin.tags,
    ...featureTags,
    '#电商上新',
  ]).slice(0, 6)
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values))
}
