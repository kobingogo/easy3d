import assert from 'node:assert/strict';
import {
  buildPhase1AssetPackManifest,
  buildPhase1AssetPack,
  PHASE1_ASSET_PACK_ENTRY_ORDER,
  type Phase1AssetPackSnapshot,
} from '../lib/seller-workflow/asset-pack';
import { getPhase1Preset } from '../lib/seller-workflow/presets';

async function main() {
  const modelId = 'model_abc123';
  const snapshotFixture: Phase1AssetPackSnapshot = {
    version: 1 as const,
    copy: {
      taobao: {
        title: '棕色皮质女包｜通勤百搭款',
        bullets: ['皮质细腻有光泽', '轻量包型久背不累', '分区收纳通勤更高效'],
      },
      xiaohongshu: {
        title: '棕色皮质女包开箱｜通勤氛围感拉满',
        content:
          '这只棕色皮质女包真的很适合通勤，容量够用、上身显气质，搭配衬衫和风衣都很自然。',
        tags: ['#包包分享', '#通勤穿搭', '#今日份穿搭'],
      },
      douyin: {
        hook: '通勤包怎么选才不踩雷？',
        script:
          '开场三秒先看质感，这只棕色皮质女包上身就很提气场，容量和分区都很实用，日常通勤直接省心。',
        tags: ['#包包推荐', '#通勤好物', '#日常穿搭'],
      },
    },
    strategy: {
      recommendedPlatform: 'taobao' as const,
      heroAngle: '通勤场景主图，突出包型比例',
      styleDirection: '皮质质感 + 干净布光',
      featureFocus: ['容量', '分区', '轻量包体'],
      materialFocus: ['皮质'],
      marketingHook: '强调高频通勤场景价值',
      reasoningSummary: '以通勤转化为目标，统一三平台叙事。',
    },
    manifest: {
      filename: 'manifest/asset-pack-manifest.json',
      model: {
        downloadUrl: 'https://fixture.example.com/model.glb',
        filename: 'model/model.glb',
      },
      assets: [
        {
          platform: 'taobao',
          filename: 'assets/taobao-main.jpg',
          previewUrl: 'https://fixture.example.com/preview.jpg',
          downloadUrl: '/api/models/model_abc123/asset-pack-assets/taobao',
          mimeType: 'image/jpeg',
          width: 800,
          height: 800,
        },
        {
          platform: 'xiaohongshu',
          filename: 'assets/xiaohongshu-cover.jpg',
          previewUrl: 'https://fixture.example.com/preview.jpg',
          downloadUrl: '/api/models/model_abc123/asset-pack-assets/xiaohongshu',
          mimeType: 'image/jpeg',
          width: 1242,
          height: 1660,
        },
        {
          platform: 'douyin',
          filename: 'assets/douyin-vertical.jpg',
          previewUrl: 'https://fixture.example.com/preview.jpg',
          downloadUrl: '/api/models/model_abc123/asset-pack-assets/douyin',
          mimeType: 'image/jpeg',
          width: 1080,
          height: 1920,
        },
      ],
      copyFiles: [
        {
          filename: 'copy/taobao-listing.md',
          content: '# fixture taobao',
          mimeType: 'text/markdown',
        },
        {
          filename: 'copy/xiaohongshu-post.md',
          content: '# fixture xiaohongshu',
          mimeType: 'text/markdown',
        },
        {
          filename: 'copy/douyin-script.md',
          content: '# fixture douyin',
          mimeType: 'text/markdown',
        },
      ],
      strategyFile: {
        filename: 'strategy/strategy-summary.json',
        content: '{"from":"fixture"}',
        mimeType: 'application/json',
      },
    },
  };

  assert.throws(
    () =>
      buildPhase1AssetPack({
        modelId,
        category: 'bags',
        presetKey: 'bag-studio-phase1',
        thumbnailUrl: 'https://example.com/bag.jpg',
        modelDownloadUrl: 'https://example.com/model.glb',
      }),
    /assetPackSnapshot is required/,
    'buildPhase1AssetPack should reject missing assetPackSnapshot'
  );

  const pack = buildPhase1AssetPack({
    modelId,
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    thumbnailUrl: 'https://example.com/bag.jpg',
    modelDownloadUrl: 'https://example.com/model.glb',
    assetPackSnapshot: snapshotFixture,
  });

  assert.equal(pack.platformAssets.length, 3, 'expected 3 platform assets');
  assert.ok(pack.copy.xiaohongshu.title, 'missing xiaohongshu title');
  assert.ok(pack.modelDownloadUrl, 'missing original model download url');
  assert.ok(pack.platformAssets[0]?.filename, 'missing platform asset filename');
  assert.ok(pack.platformAssets[0]?.downloadUrl, 'missing platform asset download url');
  assert.equal(
    pack.manifest.filename,
    'manifest/asset-pack-manifest.json',
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
    snapshotFixture.manifest.model.downloadUrl,
    'manifest model download url mismatch'
  );
  assert.deepEqual(
    pack.manifest,
    snapshotFixture.manifest,
    'manifest should come from persisted snapshot contract'
  );
  assert.deepEqual(
    pack.snapshot,
    snapshotFixture,
    'pack.snapshot should preserve the canonical snapshot shape'
  );

  const generatedManifest = buildPhase1AssetPackManifest({
    modelId,
    modelDownloadUrl: 'https://fixture.example.com/model.glb',
    thumbnailUrl: 'https://fixture.example.com/preview.jpg',
    preset: getPhase1Preset('bags'),
    copy: snapshotFixture.copy,
    strategy: snapshotFixture.strategy,
  });

  assert.deepEqual(PHASE1_ASSET_PACK_ENTRY_ORDER, [
    'assets/taobao-main.jpg',
    'assets/xiaohongshu-cover.jpg',
    'assets/douyin-vertical.jpg',
    'copy/taobao-listing.md',
    'copy/xiaohongshu-post.md',
    'copy/douyin-script.md',
    'strategy/strategy-summary.json',
    'manifest/asset-pack-manifest.json',
    'model/model.glb',
  ]);
  assert.equal(generatedManifest.filename, 'manifest/asset-pack-manifest.json');
  assert.equal(generatedManifest.model.filename, 'model/model.glb');
  assert.deepEqual(
    generatedManifest.assets.map((asset) => asset.filename),
    PHASE1_ASSET_PACK_ENTRY_ORDER.slice(0, 3)
  );
  assert.deepEqual(
    generatedManifest.copyFiles.map((file) => file.filename),
    PHASE1_ASSET_PACK_ENTRY_ORDER.slice(3, 6)
  );
  assert.equal(
    generatedManifest.strategyFile.filename,
    'strategy/strategy-summary.json'
  );

  console.log('[test-phase1-asset-pack] PASS');
}

main().catch((error) => {
  console.error('[test-phase1-asset-pack] FAIL', error);
  process.exit(1);
});
