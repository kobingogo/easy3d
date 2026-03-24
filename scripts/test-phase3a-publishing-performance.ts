import assert from 'node:assert/strict'
import { buildPublishingPerformanceSummary } from '../lib/seller-workflow/publishing-performance'

function main() {
  const summary = buildPublishingPerformanceSummary({
    publishingPrep: {
      platforms: [
        {
          platform: 'taobao',
          recommendedVariantId: 'v1',
          variants: [
            { id: 'v1', title: '淘宝转化版' },
            { id: 'v2', title: '淘宝场景版' },
            { id: 'v3', title: '淘宝参数版' },
          ],
        },
        {
          platform: 'xiaohongshu',
          recommendedVariantId: 'v2',
          variants: [
            { id: 'v1', title: '小红书转化版' },
            { id: 'v2', title: '小红书场景版' },
            { id: 'v3', title: '小红书参数版' },
          ],
        },
      ],
    },
    publishingFeedback: {
      nextRecommendationByPlatform: {
        taobao: 'v3',
      },
      byPlatform: {
        taobao: {
          byVariant: {
            v1: {
              copyCount: 3,
              publishResult: {
                impressions: 1200,
                clicks: 120,
                conversions: 8,
              },
            },
            v2: {
              copyCount: 1,
              publishResult: {
                impressions: 980,
                clicks: 140,
                conversions: 11,
              },
            },
          },
        },
        xiaohongshu: {
          byVariant: {
            v2: {
              copyCount: 5,
            },
          },
        },
      },
    },
  })

  assert.equal(summary.platforms.length, 2)
  assert.equal(summary.hasAnyData, true)

  const taobao = summary.platforms.find((item) => item.platform === 'taobao')
  assert.ok(taobao)
  assert.equal(taobao?.recommendedVariantId, 'v3')
  assert.equal(taobao?.bestVariantId, 'v2')
  assert.equal(taobao?.bestBy, 'conversion')

  const taobaoV2 = taobao?.variants.find((item) => item.variantId === 'v2')
  assert.ok(taobaoV2)
  assert.equal(taobaoV2?.conversions, 11)
  assert.equal(taobaoV2?.clicks, 140)
  assert.equal(taobaoV2?.impressions, 980)
  assert.equal(typeof taobaoV2?.ctr, 'number')
  assert.equal(typeof taobaoV2?.cvr, 'number')

  const xiaohongshu = summary.platforms.find(
    (item) => item.platform === 'xiaohongshu'
  )
  assert.ok(xiaohongshu)
  assert.equal(xiaohongshu?.bestVariantId, 'v2')
  assert.equal(xiaohongshu?.bestBy, 'copy')

  console.log('[test-phase3a-publishing-performance] PASS')
}

main()
