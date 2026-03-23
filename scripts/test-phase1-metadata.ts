import assert from 'node:assert/strict'
import { buildPhase1ModelMetadata } from '../lib/seller-workflow/model-metadata'

async function main() {
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

  console.log('[test-phase1-metadata] PASS')
}

main().catch((error) => {
  console.error('[test-phase1-metadata] FAIL', error)
  process.exit(1)
})
