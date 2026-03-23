import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BatchItemSummary, BatchJobSummary, BatchItemStatus } from '@/lib/seller-workflow/batch-types'

interface BatchJobRow {
  id: string
  name: string
  category: 'bags'
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

interface BatchItemRow {
  id: string
  batch_job_id: string
  model_id: string | null
  source_image_url: string
  status: BatchItemStatus
  attempt_count: number
  last_error: string | null
  trip_task_id: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
}

type BatchDetailRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: BatchDetailRouteTestOverrides = {}

function toBatchSummary(row: BatchJobRow): BatchJobSummary {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
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

function toBatchItemSummary(row: BatchItemRow): BatchItemSummary {
  return {
    id: row.id,
    batchJobId: row.batch_job_id,
    modelId: row.model_id,
    sourceImageUrl: row.source_image_url,
    status: row.status,
    attemptCount: row.attempt_count,
    lastError: row.last_error,
    tripTaskId: row.trip_task_id,
    lockedAt: row.locked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'batch id is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(Number(searchParams.get('page') || '1') || 1, 1)
    const pageSize = Math.min(
      Math.max(Number(searchParams.get('pageSize') || '20') || 20, 1),
      100
    )
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    const { data: batch, error: batchError } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const { data: items, error: itemsError } = await supabase
      .from('batch_items')
      .select('*')
      .eq('batch_job_id', id)
      .order('created_at', { ascending: true })
      .range(start, end)

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch batch items' }, { status: 500 })
    }

    const batchSummary = toBatchSummary(batch as BatchJobRow)
    return NextResponse.json({
      batch: batchSummary,
      items: ((items || []) as BatchItemRow[]).map(toBatchItemSummary),
      pagination: {
        page,
        pageSize,
        total: batchSummary.totalCount,
        hasMore: end + 1 < batchSummary.totalCount,
      },
    })
  } catch (error) {
    console.error('Batch detail GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(GET as typeof GET & {
  __testables?: {
    toBatchSummary: typeof toBatchSummary
    toBatchItemSummary: typeof toBatchItemSummary
    setTestOverrides: (overrides: BatchDetailRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  toBatchSummary,
  toBatchItemSummary,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof BatchDetailRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}
