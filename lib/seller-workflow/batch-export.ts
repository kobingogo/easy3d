import { strToU8, zipSync } from 'fflate'
import type { Json } from '@/lib/supabase/types'

type Phase1AssetPackSnapshotLike = {
  manifest?: unknown
  copy?: {
    taobao?: { title?: string; bullets?: string[] }
    xiaohongshu?: { title?: string; content?: string; tags?: string[] }
    douyin?: { hook?: string; script?: string; tags?: string[] }
  }
  strategy?: unknown
}

export interface BatchExportItemInput {
  batchItemId: string
  modelId: string
  sourceImageUrl: string
  attemptCount: number
  status: string
  model3dUrl: string | null
  thumbnailUrl: string | null
  metadata: Json | null
}

export interface BuildBatchExportZipInput {
  batchId: string
  batchName: string
  items: BatchExportItemInput[]
}

export interface BuildBatchExportZipResult {
  filename: string
  bytes: Uint8Array
  exportedCount: number
  skippedCount: number
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function asSnapshot(metadata: Json | null): Phase1AssetPackSnapshotLike | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const snapshot = (metadata as Record<string, unknown>).assetPackSnapshot
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return null
  }

  return snapshot as Phase1AssetPackSnapshotLike
}

function isUnlocked(metadata: Json | null) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return false
  }
  return (metadata as Record<string, unknown>).unlockStatus === 'unlocked'
}

function buildFolderName(index: number, modelId: string) {
  return `batch-items/${String(index + 1).padStart(2, '0')}-${modelId}`
}

function serializeMarkdownList(values: string[] | undefined) {
  if (!values || values.length === 0) {
    return '-'
  }
  return values.map((value) => `- ${value}`).join('\n')
}

export function buildBatchExportZip(
  input: BuildBatchExportZipInput
): BuildBatchExportZipResult {
  const timestamp = new Date().toISOString().slice(0, 10)
  const safeName = slugify(input.batchName) || 'batch'
  const filename = `easy3d-phase2a-${safeName}-${timestamp}.zip`

  const exportableItems = input.items.filter(
    (item) => item.status === 'completed' && isUnlocked(item.metadata)
  )
  const skippedCount = Math.max(input.items.length - exportableItems.length, 0)

  const files: Record<string, Uint8Array> = {}
  const manifestItems: Array<{
    batchItemId: string
    modelId: string
    sourceImageUrl: string
    model3dUrl: string | null
    thumbnailUrl: string | null
    attemptCount: number
  }> = []

  exportableItems.forEach((item, index) => {
    const folder = buildFolderName(index, item.modelId)
    const snapshot = asSnapshot(item.metadata)

    manifestItems.push({
      batchItemId: item.batchItemId,
      modelId: item.modelId,
      sourceImageUrl: item.sourceImageUrl,
      model3dUrl: item.model3dUrl,
      thumbnailUrl: item.thumbnailUrl,
      attemptCount: item.attemptCount,
    })

    files[`${folder}/item-summary.json`] = strToU8(
      JSON.stringify(
        {
          batchItemId: item.batchItemId,
          modelId: item.modelId,
          sourceImageUrl: item.sourceImageUrl,
          model3dUrl: item.model3dUrl,
          thumbnailUrl: item.thumbnailUrl,
          attemptCount: item.attemptCount,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      )
    )

    if (item.model3dUrl) {
      files[`${folder}/links/model-url.txt`] = strToU8(item.model3dUrl)
    }
    if (item.thumbnailUrl) {
      files[`${folder}/links/thumbnail-url.txt`] = strToU8(item.thumbnailUrl)
    }
    files[`${folder}/links/source-image-url.txt`] = strToU8(item.sourceImageUrl)

    if (!snapshot) {
      return
    }

    if (snapshot.manifest) {
      files[`${folder}/manifest/asset-pack-manifest.json`] = strToU8(
        JSON.stringify(snapshot.manifest, null, 2)
      )
    }

    if (snapshot.strategy) {
      files[`${folder}/strategy/strategy-summary.json`] = strToU8(
        JSON.stringify(snapshot.strategy, null, 2)
      )
    }

    if (snapshot.copy?.taobao) {
      files[`${folder}/copy/taobao-listing.md`] = strToU8(
        `# ${snapshot.copy.taobao.title || 'Taobao Listing'}\n\n${serializeMarkdownList(
          snapshot.copy.taobao.bullets
        )}\n`
      )
    }

    if (snapshot.copy?.xiaohongshu) {
      const tags = (snapshot.copy.xiaohongshu.tags || []).join(' ')
      files[`${folder}/copy/xiaohongshu-post.md`] = strToU8(
        `# ${snapshot.copy.xiaohongshu.title || 'Xiaohongshu'}\n\n${
          snapshot.copy.xiaohongshu.content || ''
        }\n\n${tags}\n`
      )
    }

    if (snapshot.copy?.douyin) {
      const tags = (snapshot.copy.douyin.tags || []).join(' ')
      files[`${folder}/copy/douyin-script.md`] = strToU8(
        `# ${snapshot.copy.douyin.hook || 'Douyin Hook'}\n\n${
          snapshot.copy.douyin.script || ''
        }\n\n${tags}\n`
      )
    }
  })

  files['batch-manifest.json'] = strToU8(
    JSON.stringify(
      {
        batchId: input.batchId,
        batchName: input.batchName,
        exportedCount: exportableItems.length,
        skippedCount,
        generatedAt: new Date().toISOString(),
        items: manifestItems,
      },
      null,
      2
    )
  )

  return {
    filename,
    bytes: zipSync(files, { level: 6 }),
    exportedCount: exportableItems.length,
    skippedCount,
  }
}
