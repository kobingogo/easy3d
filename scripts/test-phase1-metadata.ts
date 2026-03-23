import assert from 'node:assert/strict'
import { buildPhase1ModelMetadata } from '../lib/seller-workflow/model-metadata'
import type { Phase1AssetPackSnapshot } from '../lib/seller-workflow/asset-pack'

async function main() {
  const snapshotFixture: Phase1AssetPackSnapshot = {
    version: 1,
    copy: {
      taobao: { title: 't', bullets: ['b1'] },
      xiaohongshu: { title: 'x', content: 'c', tags: ['#x'] },
      douyin: { hook: 'h', script: 's', tags: ['#d'] },
    },
    strategy: {
      recommendedPlatform: 'taobao',
      heroAngle: 'hero',
      styleDirection: 'style',
      featureFocus: ['f1'],
      materialFocus: ['m1'],
      marketingHook: 'hook',
      reasoningSummary: 'summary',
    },
    manifest: {
      filename: 'manifest/asset-pack-manifest.json',
      model: {
        downloadUrl: 'https://example.com/model.glb',
        filename: 'model/model.glb',
      },
      assets: [
        {
          platform: 'taobao',
          filename: 'assets/taobao-main.jpg',
          previewUrl: 'https://example.com/preview.jpg',
          downloadUrl: '/api/models/model_001/asset-pack-assets/taobao',
          mimeType: 'image/jpeg',
          width: 800,
          height: 800,
        },
      ],
      copyFiles: [
        {
          filename: 'copy/taobao-listing.md',
          content: '# t',
          mimeType: 'text/markdown',
        },
      ],
      strategyFile: {
        filename: 'strategy/strategy-summary.json',
        content: '{"ok":true}',
        mimeType: 'application/json',
      },
    },
  }

  const metadata = buildPhase1ModelMetadata({
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'single',
    analysisSummary: {
      subcategory: 'shoulder-bag',
      materials: ['leather'],
      keyFeatures: ['zipper-pocket'],
    },
  })

  assert.equal(metadata.workflowType, 'seller_asset_pack_phase1')
  assert.equal(metadata.category, 'bags')
  assert.equal(metadata.presetKey, 'bag-studio-phase1')
  assert.equal(metadata.unlockStatus, 'preview_only')
  assert.equal(metadata.assetPackPreviewReady, false)
  assert.equal(metadata.uploadMode, 'single')
  assert.equal(metadata.assetPackSnapshotStatus, 'idle')
  assert.deepEqual(metadata.analysisSummary, {
    subcategory: 'shoulder-bag',
    materials: ['leather'],
    keyFeatures: ['zipper-pocket'],
  })

  const materializing = buildPhase1ModelMetadata({
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'multiview',
    assetPackSnapshotStatus: 'materializing',
  })

  assert.equal(materializing.uploadMode, 'multiview')
  assert.equal(materializing.assetPackSnapshotStatus, 'materializing')
  assert.deepEqual(materializing.analysisSummary, {})

  const withSnapshotDefaultPreview = buildPhase1ModelMetadata({
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'single',
    assetPackSnapshot: snapshotFixture,
  })

  assert.equal(
    withSnapshotDefaultPreview.assetPackPreviewReady,
    false,
    'assetPackPreviewReady must stay false by default even when snapshot exists'
  )

  const explicitPreviewReady = buildPhase1ModelMetadata({
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'single',
    assetPackSnapshot: snapshotFixture,
    assetPackPreviewReady: true,
  })
  assert.equal(explicitPreviewReady.assetPackPreviewReady, true)

  assert.throws(
    () =>
      buildPhase1ModelMetadata({
        category: 'bags',
        presetKey: 'bag-studio-phase1',
        uploadMode: 'single',
        assetPackPreviewReady: true,
      }),
    /assetPackSnapshot is required when assetPackPreviewReady is true/
  )

  assert.throws(
    () =>
      buildPhase1ModelMetadata({
        category: 'bags',
        presetKey: 'bag-studio-phase1',
        uploadMode: 'single',
        assetPackSnapshotStatus: 'materializing',
        assetPackSnapshot: snapshotFixture,
      }),
    /assetPackSnapshotStatus=materializing cannot include assetPackSnapshot/
  )

  assert.throws(
    () =>
      buildPhase1ModelMetadata({
        category: 'bags',
        presetKey: 'bag-studio-phase1',
        uploadMode: 'single',
        assetPackSnapshotStatus: 'materializing',
        assetPackPreviewReady: true,
      }),
    /assetPackSnapshotStatus=materializing cannot be preview ready/
  )

  console.log('[test-phase1-metadata] PASS')
}

main().catch((error) => {
  console.error('[test-phase1-metadata] FAIL', error)
  process.exit(1)
})
