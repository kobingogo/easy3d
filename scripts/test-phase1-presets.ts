import assert from 'node:assert/strict';
import {
  PHASE1_BAG_PRESET,
  getPhase1Preset,
  isPhase1CategorySupported,
} from '../lib/seller-workflow/presets';

const supportedCategory = 'bags';
const unsupportedCategory = 'shoes';
const runtimeInvalidCategory = 'shoes' as unknown as Parameters<typeof getPhase1Preset>[0];

assert.equal(isPhase1CategorySupported(supportedCategory), true);
assert.equal(isPhase1CategorySupported(unsupportedCategory), false);

if (isPhase1CategorySupported(supportedCategory)) {
  assert.equal(getPhase1Preset(supportedCategory), PHASE1_BAG_PRESET);
}

assert.deepEqual(getPhase1Preset(supportedCategory), PHASE1_BAG_PRESET);

assert.throws(() => {
  getPhase1Preset(runtimeInvalidCategory);
}, /Unsupported Phase1 category: shoes/);

assert.deepEqual(PHASE1_BAG_PRESET, {
  key: 'bag-studio-phase1',
  category: 'bags',
  label: '包袋高级感素材包',
  description: '白底电商主图 + 小红书封面 + 抖音竖图 + 平台文案',
  copyTone: 'premium',
  targetPlatforms: ['taobao', 'xiaohongshu', 'douyin'],
});
