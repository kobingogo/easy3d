'use client'

import { strToU8, zipSync } from 'fflate'
import { adaptImageForPlatform, type Platform } from '../export/platform-adapter'
import {
  buildPhase1AssetPackZipEntries,
  PHASE1_ASSET_PACK_ENTRY_ORDER,
  type Phase1AssetPackSnapshot,
} from './asset-pack'

interface DownloadPhase1AssetPackZipInput {
  modelId: string
  snapshot: Phase1AssetPackSnapshot
}

function resolveModelDownloadUrl(downloadUrl: string) {
  if (!/^https?:\/\//.test(downloadUrl)) {
    return downloadUrl
  }

  try {
    const parsedUrl = new URL(downloadUrl)
    if (parsedUrl.hostname.includes('tripo3d.com') || parsedUrl.hostname.includes('tripo-data')) {
      return `/api/proxy/model?url=${encodeURIComponent(downloadUrl)}`
    }
  } catch {
    return downloadUrl
  }

  return downloadUrl
}

async function fetchBinary(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`下载素材失败: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (bytes.byteLength === 0) {
    throw new Error('下载素材失败: 空文件')
  }

  return bytes
}

async function buildPlatformAssetBytes(url: string, platform: Platform) {
  const sourceBytes = await fetchBinary(url)
  const sourceBlob = new Blob([sourceBytes], { type: 'image/jpeg' })
  const sourceObjectUrl = URL.createObjectURL(sourceBlob)

  try {
    const adapted = await adaptImageForPlatform(sourceObjectUrl, platform)
    try {
      return await fetchBinary(adapted.url)
    } finally {
      URL.revokeObjectURL(adapted.url)
    }
  } finally {
    URL.revokeObjectURL(sourceObjectUrl)
  }
}

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function downloadPhase1AssetPackZip(input: DownloadPhase1AssetPackZipInput) {
  const entries = buildPhase1AssetPackZipEntries(input.snapshot)
  const assetLookup = Object.fromEntries(
    input.snapshot.manifest.assets.map((asset) => [asset.filename, asset.platform] as const)
  )

  const zipPayload: Record<string, Uint8Array> = {}

  for (const path of PHASE1_ASSET_PACK_ENTRY_ORDER) {
    const entry = entries.find((item) => item.path === path)
    if (!entry) {
      throw new Error(`素材包缺少文件: ${path}`)
    }

    if (entry.kind === 'text' || entry.kind === 'json') {
      zipPayload[path] = strToU8(entry.content || '')
      continue
    }

    if (!entry.downloadUrl) {
      throw new Error(`素材包缺少下载链接: ${path}`)
    }

    if (path === 'model/model.glb') {
      zipPayload[path] = await fetchBinary(resolveModelDownloadUrl(entry.downloadUrl))
      continue
    }

    const platform = assetLookup[path]
    if (!platform) {
      throw new Error(`素材包平台映射缺失: ${path}`)
    }

    zipPayload[path] = await buildPlatformAssetBytes(entry.downloadUrl, platform)
  }

  const zipped = zipSync(zipPayload, { level: 6 })
  triggerDownload(zipped, `easy3d-phase1-${input.modelId}.zip`)
}
