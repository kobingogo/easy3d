import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BatchItemSummary, BatchItemStatus } from '@/lib/seller-workflow/batch-types'
import { requeueFailedBatchItem } from '@/lib/seller-workflow/batch-queue'

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

type BatchRetryRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: BatchRetryRouteTestOverrides = {}

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    if (!id || !itemId) {
      return NextResponse.json({ error: 'batch id and item id are required' }, { status: 400 })
    }

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    const { data: item, error: itemError } = await supabase
      .from('batch_items')
      .select('*')
      .eq('id', itemId)
      .eq('batch_job_id', id)
      .maybeSingle()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Batch item not found' }, { status: 404 })
    }

    if ((item as BatchItemRow).status !== 'failed') {
      return NextResponse.json({ error: 'Only failed items can be retried' }, { status: 409 })
    }

    const updated = (await requeueFailedBatchItem(supabase, {
      batchJobId: id,
      itemId,
    })) as BatchItemRow

    return NextResponse.json({
      success: true,
      item: toBatchItemSummary(updated),
    })
  } catch (error: any) {
    console.error('Batch retry POST error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to retry batch item' },
      { status: 500 }
    )
  }
}

;(POST as typeof POST & {
  __testables?: {
    toBatchItemSummary: typeof toBatchItemSummary
    setTestOverrides: (overrides: BatchRetryRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  toBatchItemSummary,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof BatchRetryRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}
