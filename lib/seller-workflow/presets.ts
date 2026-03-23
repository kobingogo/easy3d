import type { Phase1Category, Phase1Preset } from './types'

export const PHASE1_BAG_PRESET: Phase1Preset = {
  key: 'bag-studio-phase1',
  category: 'bags',
  label: '包袋高级感素材包',
  description: '白底电商主图 + 小红书封面 + 抖音竖图 + 平台文案',
  copyTone: 'premium',
  targetPlatforms: ['taobao', 'xiaohongshu', 'douyin'],
}

export function getPhase1Preset(category: Phase1Category): Phase1Preset {
  switch (category) {
    case 'bags':
      return PHASE1_BAG_PRESET
  }

  throw new Error(`Unsupported Phase1 category: ${category}`)
}

export function isPhase1CategorySupported(
  category: string
): category is Phase1Category {
  return category === 'bags'
}
