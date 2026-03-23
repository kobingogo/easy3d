import { generatePlatformCopy } from '../copy/platform-copy'
import type { Platform } from '../export/platform-adapter'
import { getPlatformSpec } from '../export/platform-adapter'
import { getPhase1Preset } from './presets'
import type { Phase1Category, Phase1Preset } from './types'

type AssetMimeType = 'image/jpeg' | 'image/png'

export interface AssetPackManifest {
  filename: 'asset-pack-manifest.json'
  model: { downloadUrl: string; filename: 'model.glb' }
  assets: Array<{
    platform: Platform
    filename: string
    previewUrl: string
    downloadUrl: string
    mimeType: AssetMimeType
    width: number
    height: number
  }>
  copyFiles: Array<{
    filename: string
    content: string
    mimeType: 'text/plain' | 'text/markdown' | 'application/json'
  }>
  strategyFile: {
    filename: 'strategy-summary.json'
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

export interface Phase1AssetPackSnapshot {
  version: 1
  copy: Phase1AssetPackCopy
  strategy: Phase1AssetPackStrategy
  manifest: AssetPackManifest
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
    filename: string
    previewUrl: string
    downloadUrl: string
    mimeType: AssetMimeType
  }>
  copy: Phase1AssetPackCopy
}

export interface BuildPhase1AssetPackInput {
  modelId: string
  category: Phase1Category
  presetKey: Phase1Preset['key']
  thumbnailUrl: string
  modelDownloadUrl: string
  titleSeed?: string
  assetPackSnapshot?: {
    version: 1
    copy: Phase1AssetPackCopy
    strategy: Phase1AssetPackStrategy
  }
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

  const snapshotCore =
    input.assetPackSnapshot ??
    createDeterministicSnapshot({
      category: input.category,
      titleSeed: input.titleSeed
    })

  const manifest = buildManifest({
    modelId: input.modelId,
    modelDownloadUrl: input.modelDownloadUrl,
    thumbnailUrl: input.thumbnailUrl,
    preset,
    copy: snapshotCore.copy,
    strategy: snapshotCore.strategy
  })

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
    snapshot: {
      version: 1,
      copy: snapshotCore.copy,
      strategy: snapshotCore.strategy,
      manifest
    },
    strategy: snapshotCore.strategy,
    platformAssets,
    copy: snapshotCore.copy
  }
}

export async function materializePhase1AssetPackSnapshot(
  input: MaterializePhase1AssetPackSnapshotInput
): Promise<{
  copy: Phase1AssetPack['copy']
  strategy: Phase1AssetPack['strategy']
  manifest: AssetPackManifest
}> {
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

  const pack = buildPhase1AssetPack({
    modelId: input.modelId,
    category: input.category,
    presetKey: input.presetKey,
    thumbnailUrl: input.sourceImageUrl,
    modelDownloadUrl: input.modelDownloadUrl,
    assetPackSnapshot: {
      version: 1,
      copy,
      strategy
    }
  })

  return {
    copy,
    strategy,
    manifest: pack.manifest
  }
}

function buildManifest(input: {
  modelId: string
  modelDownloadUrl: string
  thumbnailUrl: string
  preset: Phase1Preset
  copy: Phase1AssetPackCopy
  strategy: Phase1AssetPackStrategy
}): AssetPackManifest {
  const assets = input.preset.targetPlatforms.map((platform) => {
    const spec = getPlatformSpec(platform)
    const extension = spec.format === 'png' ? 'png' : 'jpg'
    const mimeType: AssetMimeType =
      spec.format === 'png' ? 'image/png' : 'image/jpeg'
    return {
      platform,
      filename: `${platform}-${spec.width}x${spec.height}.${extension}`,
      previewUrl: input.thumbnailUrl,
      downloadUrl: `/api/models/${input.modelId}/asset-pack-assets/${platform}`,
      mimeType,
      width: spec.width,
      height: spec.height
    }
  })

  return {
    filename: 'asset-pack-manifest.json',
    model: {
      downloadUrl: input.modelDownloadUrl,
      filename: 'model.glb'
    },
    assets,
    copyFiles: [
      {
        filename: 'taobao-copy.md',
        content: serializeTaobaoCopy(input.copy.taobao),
        mimeType: 'text/markdown'
      },
      {
        filename: 'xiaohongshu-copy.md',
        content: serializeXiaohongshuCopy(input.copy.xiaohongshu),
        mimeType: 'text/markdown'
      },
      {
        filename: 'douyin-copy.md',
        content: serializeDouyinCopy(input.copy.douyin),
        mimeType: 'text/markdown'
      }
    ],
    strategyFile: {
      filename: 'strategy-summary.json',
      content: JSON.stringify(input.strategy, null, 2),
      mimeType: 'application/json'
    }
  }
}

function createDeterministicSnapshot(input: {
  category: Phase1Category
  titleSeed?: string
}): { version: 1; copy: Phase1AssetPackCopy; strategy: Phase1AssetPackStrategy } {
  const seed = input.titleSeed?.trim() || '包袋新品'

  const copy: Phase1AssetPackCopy = {
    taobao: {
      title: `${seed}｜轻奢通勤百搭手提包`,
      bullets: ['高级皮质触感，质感细腻', '轻量包体设计，久背不累', '多分区收纳，通勤出行更有序']
    },
    xiaohongshu: {
      title: `${seed}开箱｜通勤氛围感直接拉满`,
      content:
        '通勤出门总想要一只兼顾颜值和容量的包，这款真的把精致感拿捏住了。日常搭配衬衫、针织或风衣都很顺，拍照也很出片。上手很轻，分区清晰，卡片、口红、耳机都能快速找到，通勤和周末出行都好用。',
      tags: ['#包包分享', '#通勤穿搭', '#质感好物', '#今日份穿搭']
    },
    douyin: {
      hook: `${seed}上身到底有多显贵？`,
      script:
        '3秒告诉你这只包为什么值得入手：第一眼是高级皮质质感，第二眼是利落包型，上身立刻提气场。它的收纳分区很实用，日常通勤所需都能装下，轻便不压肩，搭配通勤装和休闲装都不违和。',
      tags: ['#包包推荐', '#通勤好物', '#日常穿搭']
    }
  }

  const strategy = buildDeterministicStrategy({
    category: input.category,
    subcategory: '通勤包',
    materials: ['皮质'],
    keyFeatures: ['多分区收纳', '轻量包体', '百搭包型']
  })

  return { version: 1, copy, strategy }
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

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values))
}
