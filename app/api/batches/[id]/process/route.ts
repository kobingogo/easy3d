import { NextRequest, NextResponse } from 'next/server'
import { POST as generateSmartPost } from '@/app/api/generate-smart/route'
import { GET as tripoStatusGet } from '@/app/api/tripo/status/[taskId]/route'
import { createClient } from '@/lib/supabase/server'
import {
  BATCH_PROCESS_CONCURRENCY,
  type BatchJobSummary,
} from '@/lib/seller-workflow/batch-types'
import {
  claimBatchItemsForProcessing,
  markBatchItemFailed,
  markBatchItemProcessing,
  refreshBatchJobCounters,
  syncProcessingBatchItemsFromModels,
} from '@/lib/seller-workflow/batch-queue'

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

interface ProcessingBatchItemRow {
  id: string
  source_image_url: string
  trip_task_id: string | null
}

interface GenerateSmartResult {
  success: boolean
  modelId?: string
  taskId?: string
  error?: string
}

type BatchProcessRouteTestOverrides = {
  createClient?: typeof createClient
  invokeGenerateSmart?: (imageUrl: string) => Promise<GenerateSmartResult>
  syncTripoTaskStatus?: (taskId: string) => Promise<void>
}

const testOverrides: BatchProcessRouteTestOverrides = {}

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

async function defaultInvokeGenerateSmart(imageUrl: string): Promise<GenerateSmartResult> {
  const response = await generateSmartPost(
    new NextRequest('http://localhost/api/generate-smart', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
      headers: {
        'content-type': 'application/json',
      },
    })
  )
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      success: false,
      error: payload?.error || 'generate-smart failed',
    }
  }

  return {
    success: true,
    modelId: payload?.modelId,
    taskId: payload?.taskId,
  }
}

async function defaultSyncTripoTaskStatus(taskId: string) {
  const response = await tripoStatusGet(
    new NextRequest(`http://localhost/api/tripo/status/${taskId}`, {
      method: 'GET',
    }),
    { params: Promise.resolve({ taskId }) }
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.error || payload?.message || 'failed to sync task status')
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'batch id is required' }, { status: 400 })
    }

    const createClientImpl = testOverrides.createClient ?? createClient
    const invokeGenerateSmart = testOverrides.invokeGenerateSmart ?? defaultInvokeGenerateSmart
    const syncTripoTaskStatus = testOverrides.syncTripoTaskStatus ?? defaultSyncTripoTaskStatus
    const supabase = await createClientImpl()

    const { data: batch, error: batchError } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    if ((batch as BatchJobRow).status === 'canceled') {
      return NextResponse.json({ error: 'Batch already canceled' }, { status: 409 })
    }

    const { data: processingItems, error: processingError } = await supabase
      .from('batch_items')
      .select('id,source_image_url,trip_task_id')
      .eq('batch_job_id', id)
      .eq('status', 'processing')

    if (processingError) {
      return NextResponse.json({ error: 'Failed to read processing items' }, { status: 500 })
    }

    let syncErrorCount = 0
    for (const item of (processingItems || []) as ProcessingBatchItemRow[]) {
      if (!item.trip_task_id) {
        continue
      }
      try {
        await syncTripoTaskStatus(item.trip_task_id)
      } catch {
        syncErrorCount += 1
      }
    }

    await syncProcessingBatchItemsFromModels(supabase, id)
    const preClaim = await refreshBatchJobCounters(supabase, id)
    const availableSlots = Math.max(
      0,
      BATCH_PROCESS_CONCURRENCY - preClaim.counters.processingCount
    )

    const claimed =
      availableSlots > 0
        ? await claimBatchItemsForProcessing(supabase, id, availableSlots)
        : []

    let launchedCount = 0
    let launchFailedCount = 0

    for (const item of claimed) {
      try {
        const result = await invokeGenerateSmart(item.source_image_url)
        if (!result.success || !result.modelId || !result.taskId) {
          launchFailedCount += 1
          await markBatchItemFailed(supabase, {
            batchJobId: id,
            itemId: item.id,
            errorMessage: result.error || 'Failed to dispatch generation task',
          })
          continue
        }

        await markBatchItemProcessing(supabase, {
          batchJobId: id,
          itemId: item.id,
          modelId: result.modelId,
          tripTaskId: result.taskId,
        })
        launchedCount += 1
      } catch (error: any) {
        launchFailedCount += 1
        await markBatchItemFailed(supabase, {
          batchJobId: id,
          itemId: item.id,
          errorMessage: error?.message || 'Failed to dispatch generation task',
        })
      }
    }

    const postSync = await syncProcessingBatchItemsFromModels(supabase, id)
    const { data: latestBatch } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      batchId: id,
      claimedCount: claimed.length,
      launchedCount,
      launchFailedCount,
      syncErrorCount,
      batch: latestBatch ? toBatchSummary(latestBatch as BatchJobRow) : null,
      counters: postSync.counters,
    })
  } catch (error: any) {
    console.error('Batch process POST error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process batch' },
      { status: 500 }
    )
  }
}

;(POST as typeof POST & {
  __testables?: {
    toBatchSummary: typeof toBatchSummary
    defaultInvokeGenerateSmart: typeof defaultInvokeGenerateSmart
    defaultSyncTripoTaskStatus: typeof defaultSyncTripoTaskStatus
    setTestOverrides: (overrides: BatchProcessRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  toBatchSummary,
  defaultInvokeGenerateSmart,
  defaultSyncTripoTaskStatus,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof BatchProcessRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}
