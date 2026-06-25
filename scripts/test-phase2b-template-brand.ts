import assert from 'node:assert/strict'
import {
  normalizeBrandProfilePayload,
  normalizeTemplatePayload,
  PHASE2B_SUPPORTED_CATEGORY,
  toBrandProfileSummary,
  toWorkflowTemplateSummary,
} from '../lib/seller-workflow/phase2b-template-brand'

async function main() {
  const brandPayload = normalizeBrandProfilePayload({
    name: '通勤包品牌语气',
    category: PHASE2B_SUPPORTED_CATEGORY,
    toneProfile: { notes: '克制、高级感' },
    visualRules: { notes: '白底优先，五金清晰' },
  })

  assert.equal(brandPayload.name, '通勤包品牌语气')
  assert.equal(brandPayload.category, PHASE2B_SUPPORTED_CATEGORY)
  assert.deepEqual(brandPayload.toneProfile, { notes: '克制、高级感' })

  assert.throws(
    () =>
      normalizeBrandProfilePayload({
        name: '',
      }),
    /不能为空/
  )

  const templatePayload = normalizeTemplatePayload({
    name: '包袋电商模板',
    category: PHASE2B_SUPPORTED_CATEGORY,
    brandProfileId: 'profile_001',
    templatePayload: { notes: '电商主图优先' },
    isDefault: true,
  })

  assert.equal(templatePayload.name, '包袋电商模板')
  assert.equal(templatePayload.isDefault, true)
  assert.equal(templatePayload.brandProfileId, 'profile_001')

  const brandSummary = toBrandProfileSummary({
    id: 'bp_1',
    name: '品牌资产 A',
    category: PHASE2B_SUPPORTED_CATEGORY,
    tone_profile: null,
    visual_rules: null,
    created_at: '2026-03-25T00:00:00.000Z',
    updated_at: '2026-03-25T00:00:00.000Z',
  })
  assert.deepEqual(brandSummary.toneProfile, {})
  assert.deepEqual(brandSummary.visualRules, {})

  const templateSummary = toWorkflowTemplateSummary({
    id: 'tpl_1',
    name: '模板 A',
    category: PHASE2B_SUPPORTED_CATEGORY,
    brand_profile_id: null,
    template_payload: null,
    is_default: false,
    created_at: '2026-03-25T00:00:00.000Z',
    updated_at: '2026-03-25T00:00:00.000Z',
  })
  assert.deepEqual(templateSummary.templatePayload, {})
  assert.equal(templateSummary.brandProfileId, null)

  console.log('[test-phase2b-template-brand] PASS')
}

main().catch((error) => {
  console.error('[test-phase2b-template-brand] FAIL', error)
  process.exit(1)
})
