import { zipSync } from 'fflate'
import type { Platform } from '../export/platform-adapter'
import {
  PHASE1_ASSET_PACK_FILE_NAMES,
  type AssetPackManifest,
  type Phase1AssetPackSnapshot,
} from './asset-pack'

export const PHASE1_ASSET_PACK_ZIP_FILE_NAME = 'phase1-asset-pack.zip'

export const PHASE1_ASSET_PACK_ZIP_ENTRY_ORDER = [
  PHASE1_ASSET_PACK_FILE_NAMES.taobaoAsset,
  PHASE1_ASSET_PACK_FILE_NAMES.xiaohongshuAsset,
  PHASE1_ASSET_PACK_FILE_NAMES.douyinAsset,
  PHASE1_ASSET_PACK_FILE_NAMES.taobaoCopy,
  PHASE1_ASSET_PACK_FILE_NAMES.xiaohongshuCopy,
  PHASE1_ASSET_PACK_FILE_NAMES.douyinCopy,
  PHASE1_ASSET_PACK_FILE_NAMES.strategy,
  PHASE1_ASSET_PACK_FILE_NAMES.manifest,
  PHASE1_ASSET_PACK_FILE_NAMES.model,
] as const

export interface Phase1AssetPackZipSource {
  kind: 'asset' | 'copy' | 'strategy' | 'manifest' | 'model'
  filename: string
  url: string
  mimeType: string
  platform?: Platform
}

export interface CreatePhase1AssetPackZipBytesInput {
  snapshot: Phase1AssetPackSnapshot
  loadBinary: (source: Phase1AssetPackZipSource) => Promise<Uint8Array>
}

const textEncoder = new TextEncoder()

export async function createPhase1AssetPackZipBytes(
  input: CreatePhase1AssetPackZipBytesInput
): Promise<Uint8Array> {
  const entries: Record<string, Uint8Array> = {}

  await addAssetEntries(entries, input.snapshot, input.loadBinary)
  addTextEntry(
    entries,
    PHASE1_ASSET_PACK_FILE_NAMES.taobaoCopy,
    readCopyContent(input.snapshot.manifest, PHASE1_ASSET_PACK_FILE_NAMES.taobaoCopy)
  )
  addTextEntry(
    entries,
    PHASE1_ASSET_PACK_FILE_NAMES.xiaohongshuCopy,
    readCopyContent(input.snapshot.manifest, PHASE1_ASSET_PACK_FILE_NAMES.xiaohongshuCopy)
  )
  addTextEntry(
    entries,
    PHASE1_ASSET_PACK_FILE_NAMES.douyinCopy,
    readCopyContent(input.snapshot.manifest, PHASE1_ASSET_PACK_FILE_NAMES.douyinCopy)
  )
  addTextEntry(
    entries,
    PHASE1_ASSET_PACK_FILE_NAMES.strategy,
    input.snapshot.manifest.strategyFile.content
  )
  addTextEntry(
    entries,
    PHASE1_ASSET_PACK_FILE_NAMES.manifest,
    JSON.stringify(input.snapshot.manifest, null, 2)
  )
  entries[PHASE1_ASSET_PACK_FILE_NAMES.model] = await input.loadBinary({
    kind: 'model',
    filename: PHASE1_ASSET_PACK_FILE_NAMES.model,
    url: input.snapshot.manifest.model.downloadUrl,
    mimeType: 'model/gltf-binary',
  })

  return zipSync(entries, { level: 6 })
}

async function addAssetEntries(
  entries: Record<string, Uint8Array>,
  snapshot: Phase1AssetPackSnapshot,
  loadBinary: (source: Phase1AssetPackZipSource) => Promise<Uint8Array>
) {
  for (const platform of ['taobao', 'xiaohongshu', 'douyin'] as const) {
    const asset = snapshot.manifest.assets.find(
      (item) => item.platform === platform
    )
    if (!asset) {
      throw new Error(`Missing asset snapshot for platform: ${platform}`)
    }

    entries[asset.filename] = await loadBinary({
      kind: 'asset',
      filename: asset.filename,
      url: asset.downloadUrl,
      mimeType: asset.mimeType,
      platform,
    })
  }
}

function readCopyContent(
  manifest: AssetPackManifest,
  filename: string
): string {
  const file = manifest.copyFiles.find((item) => item.filename === filename)
  if (!file) {
    throw new Error(`Missing copy file in snapshot: ${filename}`)
  }

  return file.content
}

function addTextEntry(
  entries: Record<string, Uint8Array>,
  filename: string,
  content: string
) {
  entries[filename] = textEncoder.encode(content)
}
