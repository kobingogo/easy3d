import assert from 'node:assert/strict'

import { buildPhase1PublishingPrep } from '../lib/seller-workflow/asset-pack'

function main() {
  const prep = buildPhase1PublishingPrep({
    copy: {
      taobao: {
        title: '轻通勤真皮托特包',
        bullets: ['容量够用', '分区合理', '五金耐磨'],
      },
      xiaohongshu: {
        title: '通勤托特包开箱',
        content: '上身显气质，容量和分区都很实用，适合日常通勤。',
        tags: ['#包包分享', '#通勤穿搭', '#今日份穿搭'],
      },
      douyin: {
        hook: '通勤包怎么选？',
        script: '这只托特包容量够用，通勤背一整天也不会累。',
        tags: ['#包包推荐', '#通勤好物', '#日常穿搭'],
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
    nowIso: '2026-03-24T09:00:00.000Z',
  })

  const platforms = ['taobao', 'xiaohongshu', 'douyin'] as const
  assert.equal(prep.platforms.length, 3)

  for (const platform of platforms) {
    const group = prep.platforms.find((item) => item.platform === platform)
    assert.ok(group, `missing platform prep for ${platform}`)
    assert.equal(group?.variants.length, 3, `${platform} should include 3 variants`)
    assert.ok(group?.recommendedVariantId, `${platform} should have recommended variant id`)
    assert.ok(group?.coverSuggestion.theme, `${platform} should include cover theme`)
    for (const variant of group?.variants || []) {
      assert.ok(variant.id, `${platform} variant id missing`)
      assert.ok(variant.title, `${platform} variant title missing`)
      assert.ok(variant.content, `${platform} variant content missing`)
      assert.ok(variant.tags.length > 0, `${platform} variant tags missing`)
      assert.ok(
        variant.tags.every((tag) => tag.startsWith('#')),
        `${platform} variant tags should be hashtag-prefixed`
      )
    }
  }

  assert.equal(prep.generatedAt, '2026-03-24T09:00:00.000Z')
  console.log('[test-phase3a-publishing-prep] PASS')
}

main()
