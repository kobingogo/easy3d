import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  assertBatchItemCountWithinLimit,
  BATCH_ITEM_MAX_COUNT,
  type BatchJobSummary,
} from '@/lib/seller-workflow/batch-types'

interface BatchJobRow {
  id: string
  name: string
  category: 'bags'
  workflow_template_id: string | null
  status: 'queued' | 'running' | 'partial_failed' | 'completed' | 'canceled'
  total_count: number
  queued_count: number
  processing_count: number
  completed_count: number
  failed_count: number
  started_at: string | null
  completed_at: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

interface BatchCreateItemPayload {
  sourceImageUrl: string
}

interface BatchCreatePayload {
  name: string
  category?: 'bags'
  workflowTemplateId: string | null
  items: BatchCreateItemPayload[]
}

type BatchesRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: BatchesRouteTestOverrides = {}

function toBatchSummary(row: BatchJobRow): BatchJobSummary {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    workflowTemplateId: row.workflow_template_id ?? null,
    status: row.status,
    totalCount: row.total_count,
    queuedCount: row.queued_count,
    processingCount: row.processing_count,
    completedCount: row.completed_count,
    failedCount: row.failed_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    canceledAt: row.canceled_at,
  }
}

function normalizeBatchCreatePayload(payload: any): BatchCreatePayload {
  const name = typeof payload?.name === 'string' ? payload.name.trim() : ''
  if (!name) {
    throw new Error('批次名称不能为空')
  }

  const items = Array.isArray(payload?.items) ? payload.items : []
  assertBatchItemCountWithinLimit(items.length)

  const normalized = items.map((item: any, index: number) => {
    const sourceImageUrl =
      typeof item?.sourceImageUrl === 'string' ? item.sourceImageUrl.trim() : ''
    if (!sourceImageUrl) {
      throw new Error(`第 ${index + 1} 个子任务缺少 sourceImageUrl`)
    }

    return { sourceImageUrl }
  })

  return {
    name,
    category: 'bags',
    workflowTemplateId:
      typeof payload?.workflowTemplateId === 'string' && payload.workflowTemplateId.trim()
        ? payload.workflowTemplateId.trim()
        : null,
    items: normalized,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = normalizeBatchCreatePayload(await request.json())
    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    if (payload.workflowTemplateId) {
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('id,category')
        .eq('id', payload.workflowTemplateId)
        .single()

      if (templateError || !template) {
        return NextResponse.json({ error: '工作流模板不存在' }, { status: 400 })
      }

      if (template.category !== payload.category) {
        return NextResponse.json({ error: '工作流模板品类与批次不一致' }, { status: 400 })
      }
    }

    const totalCount = payload.items.length
    const { data: batch, error: batchError } = await supabase
      .from('batch_jobs')
      .insert({
        name: payload.name,
        category: payload.category,
        workflow_template_id: payload.workflowTemplateId,
        status: 'queued',
        total_count: totalCount,
        queued_count: totalCount,
        processing_count: 0,
        completed_count: 0,
        failed_count: 0,
      })
      .select('*')
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: '创建批次失败' }, { status: 500 })
    }

    const batchItems = payload.items.map((item) => ({
      batch_job_id: batch.id,
      source_image_url: item.sourceImageUrl,
      status: 'queued',
      attempt_count: 0,
      last_error: null,
      model_id: null,
      trip_task_id: null,
      locked_at: null,
    }))

    const { error: itemsError } = await supabase
      .from('batch_items')
      .insert(batchItems)
      .select('id')

    if (itemsError) {
      return NextResponse.json({ error: '批次子任务创建失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        batchId: batch.id,
        batch: toBatchSummary(batch as BatchJobRow),
      },
      { status: 201 }
    )
  } catch (error: any) {
    const message = error?.message || '批次参数无效'
    const status = message.includes('limit') || message.includes('不能为空') ? 400 : 400
    return NextResponse.json(
      {
        error: message,
        maxItems: BATCH_ITEM_MAX_COUNT,
      },
      { status }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(Number(searchParams.get('limit') || '20') || 20, 1),
      100
    )

    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: '读取批次列表失败' }, { status: 500 })
    }

    const rows = (data || []) as BatchJobRow[]
    return NextResponse.json({
      batches: rows.map(toBatchSummary),
    })
  } catch (error) {
    console.error('Batches GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(POST as typeof POST & {
  __testables?: {
    normalizeBatchCreatePayload: typeof normalizeBatchCreatePayload
    toBatchSummary: typeof toBatchSummary
    setTestOverrides: (overrides: BatchesRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  normalizeBatchCreatePayload,
  toBatchSummary,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<keyof BatchesRouteTestOverrides>) {
      delete testOverrides[key]
    }
  },
}

;(GET as typeof GET & { __testables?: (typeof POST & { __testables?: any })['__testables'] }).__testables =
  (POST as typeof POST & { __testables?: any }).__testables
