import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  normalizeBrandProfilePayload,
  PHASE2B_SUPPORTED_CATEGORY,
  toBrandProfileSummary,
  type Phase2BSellerCategory,
} from '@/lib/seller-workflow/phase2b-template-brand'
import type { Json } from '@/lib/supabase/types'

interface BrandProfileRow {
  id: string
  name: string
  category: Phase2BSellerCategory
  tone_profile: Json | null
  visual_rules: Json | null
  created_at: string
  updated_at: string
}

type BrandProfilesRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: BrandProfilesRouteTestOverrides = {}

function resolveValidationStatus(message: string) {
  if (message.includes('不能为空') || message.includes('不支持') || message.includes('超过')) {
    return 400
  }
  return 400
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeBrandProfilePayload(await request.json())
    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        name: payload.name,
        category: payload.category,
        tone_profile: payload.toneProfile,
        visual_rules: payload.visualRules,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '创建品牌资产失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        profile: toBrandProfileSummary(data as BrandProfileRow),
      },
      { status: 201 }
    )
  } catch (error: any) {
    const message = error?.message || '品牌资产参数无效'
    return NextResponse.json({ error: message }, { status: resolveValidationStatus(message) })
  }
}

export async function GET(request: NextRequest) {
  try {
    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '20') || 20, 1), 100)
    const category =
      searchParams.get('category') === PHASE2B_SUPPORTED_CATEGORY
        ? PHASE2B_SUPPORTED_CATEGORY
        : PHASE2B_SUPPORTED_CATEGORY

    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('category', category)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: '读取品牌资产失败' }, { status: 500 })
    }

    const rows = (data || []) as BrandProfileRow[]
    return NextResponse.json({
      profiles: rows.map(toBrandProfileSummary),
    })
  } catch (error) {
    console.error('Brand profiles GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(POST as typeof POST & {
  __testables?: {
    setTestOverrides: (overrides: BrandProfilesRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<keyof BrandProfilesRouteTestOverrides>) {
      delete testOverrides[key]
    }
  },
}

;(GET as typeof GET & { __testables?: (typeof POST & { __testables?: any })['__testables'] }).__testables =
  (POST as typeof POST & { __testables?: any }).__testables
