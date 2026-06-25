import type { Json } from '@/lib/supabase/types'

export const PHASE2B_SUPPORTED_CATEGORY = 'bags' as const
export type Phase2BSellerCategory = typeof PHASE2B_SUPPORTED_CATEGORY

export interface BrandProfileSummary {
  id: string
  name: string
  category: Phase2BSellerCategory
  toneProfile: Json
  visualRules: Json
  createdAt: string
  updatedAt: string
}

export interface WorkflowTemplateSummary {
  id: string
  name: string
  category: Phase2BSellerCategory
  brandProfileId: string | null
  templatePayload: Json
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface NormalizeBrandProfilePayloadResult {
  name: string
  category: Phase2BSellerCategory
  toneProfile: Json
  visualRules: Json
}

export interface NormalizeTemplatePayloadResult {
  name: string
  category: Phase2BSellerCategory
  brandProfileId: string | null
  templatePayload: Json
  isDefault: boolean
}

function normalizeName(value: unknown, field: string): string {
  const name = typeof value === 'string' ? value.trim() : ''
  if (!name) {
    throw new Error(`${field} 不能为空`)
  }
  if (name.length > 80) {
    throw new Error(`${field} 不能超过 80 字`)
  }
  return name
}

function normalizeCategory(value: unknown): Phase2BSellerCategory {
  if (!value) {
    return PHASE2B_SUPPORTED_CATEGORY
  }
  if (value === PHASE2B_SUPPORTED_CATEGORY) {
    return value
  }
  throw new Error(`暂不支持该品类，仅支持 ${PHASE2B_SUPPORTED_CATEGORY}`)
}

function toJsonObject(value: unknown): Json {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Json
}

function normalizeUuid(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  return trimmed
}

export function normalizeBrandProfilePayload(
  payload: unknown
): NormalizeBrandProfilePayloadResult {
  const data =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}

  return {
    name: normalizeName(data.name, '品牌资产名称'),
    category: normalizeCategory(data.category),
    toneProfile: toJsonObject(data.toneProfile),
    visualRules: toJsonObject(data.visualRules),
  }
}

export function normalizeTemplatePayload(
  payload: unknown
): NormalizeTemplatePayloadResult {
  const data =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}

  return {
    name: normalizeName(data.name, '模板名称'),
    category: normalizeCategory(data.category),
    brandProfileId: normalizeUuid(data.brandProfileId),
    templatePayload: toJsonObject(data.templatePayload),
    isDefault: data.isDefault === true,
  }
}

export function toBrandProfileSummary(row: {
  id: string
  name: string
  category: Phase2BSellerCategory
  tone_profile: Json | null
  visual_rules: Json | null
  created_at: string
  updated_at: string
}): BrandProfileSummary {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    toneProfile: row.tone_profile || {},
    visualRules: row.visual_rules || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toWorkflowTemplateSummary(row: {
  id: string
  name: string
  category: Phase2BSellerCategory
  brand_profile_id: string | null
  template_payload: Json | null
  is_default: boolean
  created_at: string
  updated_at: string
}): WorkflowTemplateSummary {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brandProfileId: row.brand_profile_id,
    templatePayload: row.template_payload || {},
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
