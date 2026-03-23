import assert from 'node:assert/strict';
import { buildPhase1AssetPack } from '../lib/seller-workflow/asset-pack';

async function main() {
  const modelId = 'model_abc123';

  const pack = await buildPhase1AssetPack({
    modelId,
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    titleSeed: '棕色皮质女包',
    thumbnailUrl: 'https://example.com/bag.jpg',
    modelDownloadUrl: 'https://example.com/model.glb',
  });

  assert.equal(pack.platformAssets.length, 3, 'expected 3 platform assets');
  assert.ok(pack.copy.xiaohongshu.title, 'missing xiaohongshu title');
  assert.ok(pack.modelDownloadUrl, 'missing original model download url');
  assert.ok(pack.platformAssets[0]?.filename, 'missing platform asset filename');
  assert.ok(pack.platformAssets[0]?.downloadUrl, 'missing platform asset download url');
  assert.equal(
    pack.manifest.filename,
    'asset-pack-manifest.json',
    'missing asset-pack manifest'
  );

  for (const asset of pack.platformAssets) {
    assert.equal(
      asset.downloadUrl,
      `/api/models/${modelId}/asset-pack-assets/${asset.platform}`,
      `unexpected per-model download url for ${asset.platform}`
    );
  }

  assert.equal(
    pack.manifest.assets.length,
    3,
    'manifest must include the 3 platform assets'
  );
  assert.equal(
    pack.manifest.model.downloadUrl,
    'https://example.com/model.glb',
    'manifest model download url mismatch'
  );

  console.log('[test-phase1-asset-pack] PASS');
}

main().catch((error) => {
  console.error('[test-phase1-asset-pack] FAIL', error);
  process.exit(1);
});
