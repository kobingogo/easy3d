import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  normalizeTemplatePayload,
  PHASE2B_SUPPORTED_CATEGORY,
  toWorkflowTemplateSummary,
  type Phase2BSellerCategory,
} from '@/lib/seller-workflow/phase2b-template-brand'
import type { Json } from '@/lib/supabase/types'

interface WorkflowTemplateRow {
  id: string
  name: string
  category: Phase2BSellerCategory
  brand_profile_id: string | null
  template_payload: Json | null
  is_default: boolean
  created_at: string
  updated_at: string
}

type WorkflowTemplatesRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: WorkflowTemplatesRouteTestOverrides = {}

function resolveValidationStatus(message: string) {
  if (message.includes('不能为空') || message.includes('不支持') || message.includes('超过')) {
    return 400
  }
  return 400
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeTemplatePayload(await request.json())
    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    if (payload.brandProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('brand_profiles')
        .select('id,category')
        .eq('id', payload.brandProfileId)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: '关联品牌资产不存在' }, { status: 400 })
      }

      if (profile.category !== payload.category) {
        return NextResponse.json({ error: '模板品类与品牌资产品类不一致' }, { status: 400 })
      }
    }

    if (payload.isDefault) {
      const { error: resetError } = await supabase
        .from('workflow_templates')
        .update({ is_default: false })
        .eq('category', payload.category)

      if (resetError) {
        return NextResponse.json({ error: '默认模板状态重置失败' }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({
        name: payload.name,
        category: payload.category,
        brand_profile_id: payload.brandProfileId,
        template_payload: payload.templatePayload,
        is_default: payload.isDefault,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '创建工作流模板失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        template: toWorkflowTemplateSummary(data as WorkflowTemplateRow),
      },
      { status: 201 }
    )
  } catch (error: any) {
    const message = error?.message || '模板参数无效'
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
      .from('workflow_templates')
      .select('*')
      .eq('category', category)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: '读取工作流模板失败' }, { status: 500 })
    }

    const rows = (data || []) as WorkflowTemplateRow[]
    const templates = rows.map(toWorkflowTemplateSummary)
    const defaultTemplate = templates.find((item) => item.isDefault) || null

    return NextResponse.json({
      templates,
      defaultTemplateId: defaultTemplate?.id || null,
    })
  } catch (error) {
    console.error('Workflow templates GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(POST as typeof POST & {
  __testables?: {
    setTestOverrides: (overrides: WorkflowTemplatesRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<keyof WorkflowTemplatesRouteTestOverrides>) {
      delete testOverrides[key]
    }
  },
}

;(GET as typeof GET & { __testables?: (typeof POST & { __testables?: any })['__testables'] }).__testables =
  (POST as typeof POST & { __testables?: any }).__testables
