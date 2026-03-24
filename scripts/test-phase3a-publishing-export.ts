import assert from 'node:assert/strict'
import { unzipSync } from 'fflate'

import {
  createPhase1PublishingPrepExportZipBytes,
  PHASE1_PUBLISHING_PACK_ENTRY_ORDER,
} from '../lib/seller-workflow/publishing-prep-export'
import type { Phase1AssetPackSnapshot } from '../lib/seller-workflow/asset-pack'

const textDecoder = new TextDecoder()

function decode(bytes: Uint8Array) {
  return textDecoder.decode(bytes)
}

function fixtureSnapshot(): Phase1AssetPackSnapshot {
  return {
    version: 1,
    copy: {
      taobao: {
        title: '轻通勤真皮托特包',
        bullets: ['容量够用', '分区合理', '五金耐磨'],
      },
      xiaohongshu: {
        title: '通勤托特包开箱',
        content: '上身显气质，容量和分区都很实用，适合日常通勤。',
        tags: ['#包包分享', '#通勤穿搭'],
      },
      douyin: {
        hook: '通勤包怎么选？',
        script: '这只托特包容量够用，通勤背一整天也不会累。',
        tags: ['#包包推荐', '#通勤好物'],
      },
    },
    strategy: {
      recommendedPlatform: 'xiaohongshu',
      heroAngle: '半身通勤场景',
      styleDirection: '简洁通勤',
      featureFocus: ['容量', '分区', '轻量包体'],
      materialFocus: ['头层牛皮'],
      marketingHook: '强调上身质感与通勤效率',
      reasoningSummary: '优先打小红书种草，再导入淘宝承接转化。',
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
    publishingPrep: {
      generatedAt: '2026-03-24T10:00:00.000Z',
      platforms: [
        {
          platform: 'taobao',
          recommendedVariantId: 'v1',
          coverSuggestion: {
            theme: '简洁通勤 · 转化主图',
            shotType: '正面三分构图',
            visualCue: '白底干净布光，保留包型与五金高光',
            overlayText: '轻通勤真皮托特包｜主图首屏',
          },
          variants: [
            {
              id: 'v1',
              title: '轻通勤真皮托特包｜转化版',
              content: '容量够用；分区合理；五金耐磨',
              tags: ['#电商上新', '#通勤包'],
            },
            {
              id: 'v2',
              title: '轻通勤真皮托特包｜场景版',
              content: '上身显气质，适合日常通勤。',
              tags: ['#真实场景', '#通勤包'],
            },
            {
              id: 'v3',
              title: '轻通勤真皮托特包｜参数版',
              content: '信息结构：容量 / 分区 / 轻量包体。',
              tags: ['#参数清晰', '#通勤包'],
            },
          ],
        },
        {
          platform: 'xiaohongshu',
          recommendedVariantId: 'v2',
          coverSuggestion: {
            theme: '简洁通勤 · 种草封面',
            shotType: '半身穿搭场景',
            visualCue: '人物与包同框，强调上身比例与质感',
            overlayText: '通勤托特包开箱｜今日通勤',
          },
          variants: [
            {
              id: 'v1',
              title: '通勤托特包开箱｜转化版',
              content: '上身显气质，容量和分区都很实用。',
              tags: ['#包包分享', '#通勤穿搭'],
            },
            {
              id: 'v2',
              title: '通勤托特包开箱｜场景版',
              content: '围绕通勤场景讲清楚上身效果与容量体验。',
              tags: ['#包包分享', '#真实场景'],
            },
            {
              id: 'v3',
              title: '通勤托特包开箱｜参数版',
              content: '卖点拆解：容量、分区、轻量包体。',
              tags: ['#卖点拆解', '#通勤穿搭'],
            },
          ],
        },
        {
          platform: 'douyin',
          recommendedVariantId: 'v3',
          coverSuggestion: {
            theme: '简洁通勤 · 短视频封面',
            shotType: '近景+手持动态',
            visualCue: '前景标题+中景包体，强化开场3秒识别',
            overlayText: '通勤包怎么选？｜开场抓眼',
          },
          variants: [
            {
              id: 'v1',
              title: '通勤包怎么选？｜转化版',
              content: '这只托特包容量够用，背一整天也不会累。',
              tags: ['#包包推荐', '#通勤好物'],
            },
            {
              id: 'v2',
              title: '通勤包怎么选？｜场景版',
              content: '通勤早高峰快速取物，分区很顺手。',
              tags: ['#真实场景', '#日常穿搭'],
            },
            {
              id: 'v3',
              title: '通勤包怎么选？｜参数版',
              content: '卖点拆解：容量、分区、轻量包体。',
              tags: ['#卖点拆解', '#日常穿搭'],
            },
          ],
        },
      ],
    },
  }
}

function main() {
  const bytes = createPhase1PublishingPrepExportZipBytes({
    snapshot: fixtureSnapshot(),
    publishingFeedback: {
      nextRecommendationByPlatform: {
        taobao: 'v2',
      },
      recommendationAuditTrail: [
        {
          platform: 'taobao',
          variantId: 'v2',
          appliedAt: '2026-03-24T12:00:00.000Z',
          appliedBy: 'ops:test-runner',
        },
      ],
    },
  })
  const unzipped = unzipSync(bytes)

  assert.deepEqual(
    Object.keys(unzipped),
    Array.from(PHASE1_PUBLISHING_PACK_ENTRY_ORDER),
    'publishing pack entry order should be deterministic'
  )

  assert.match(decode(unzipped['publishing/README.md']), /发布包导出/)
  assert.match(decode(unzipped['publishing/recommended-playbook.md']), /小红书/)
  assert.match(decode(unzipped['publishing/taobao-variants.md']), /转化版/)
  assert.match(decode(unzipped['publishing/taobao-variants.md']), /当前下一轮推荐: v2/)
  assert.match(decode(unzipped['publishing/taobao-variants.md']), /默认推荐版本: v1/)
  assert.match(decode(unzipped['publishing/xiaohongshu-variants.md']), /场景版/)
  assert.match(decode(unzipped['publishing/douyin-variants.md']), /参数版/)
  assert.match(decode(unzipped['publishing/cover-suggestions.md']), /封面建议/)
  assert.match(decode(unzipped['publishing/recommendation-audit.md']), /ops:test-runner/)
  assert.match(decode(unzipped['publishing/publishing-prep.json']), /generatedAt/)
  assert.match(
    decode(unzipped['publishing/publishing-prep.json']),
    /"defaultRecommendedVariantId": "v1"/
  )
  assert.match(
    decode(unzipped['publishing/publishing-prep.json']),
    /"recommendedVariantId": "v2"/
  )

  console.log('[test-phase3a-publishing-export] PASS')
}

main()
