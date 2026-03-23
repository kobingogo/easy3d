import {
  BATCH_PROCESS_CONCURRENCY,
  canTransitionBatchItemStatus,
  deriveBatchJobStatus,
  type BatchCounters,
  type BatchItemStatus,
} from './batch-types'

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
}

export type BatchQueueItemRow = BatchItemRow

interface ModelRow {
  id: string
  status: string
  trip_task_id: string | null
  metadata?: Record<string, any> | null
}

function normalizeBatchCounters(items: Array<{ status: BatchItemStatus }>): BatchCounters {
  let queuedCount = 0
  let processingCount = 0
  let completedCount = 0
  let failedCount = 0

  for (const item of items) {
    switch (item.status) {
      case 'queued':
        queuedCount += 1
        break
      case 'processing':
        processingCount += 1
        break
      case 'completed':
        completedCount += 1
        break
      case 'failed':
        failedCount += 1
        break
      default:
        break
    }
  }

  return {
    totalCount: items.length,
    queuedCount,
    processingCount,
    completedCount,
    failedCount,
  }
}

export async function refreshBatchJobCounters(supabase: any, batchJobId: string) {
  const { data: items, error: itemsError } = await supabase
    .from('batch_items')
    .select('status')
    .eq('batch_job_id', batchJobId)

  if (itemsError) {
    throw new Error(`Failed to read batch items: ${itemsError.message || itemsError}`)
  }

  const counters = normalizeBatchCounters((items || []) as Array<{ status: BatchItemStatus }>)
  const status = deriveBatchJobStatus(counters)

  const patch: Record<string, any> = {
    status,
    total_count: counters.totalCount,
    queued_count: counters.queuedCount,
    processing_count: counters.processingCount,
    completed_count: counters.completedCount,
    failed_count: counters.failedCount,
  }

  if (status === 'running') {
    patch.started_at = new Date().toISOString()
    patch.completed_at = null
  } else if (status === 'completed' || status === 'partial_failed') {
    patch.completed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('batch_jobs')
    .update(patch)
    .eq('id', batchJobId)

  if (updateError) {
    throw new Error(`Failed to update batch counters: ${updateError.message || updateError}`)
  }

  return {
    status,
    counters,
  }
}

export async function claimBatchItemsForProcessing(
  supabase: any,
  batchJobId: string,
  requestedLimit: number
) {
  const limit = Math.max(0, Math.min(requestedLimit, BATCH_PROCESS_CONCURRENCY))
  if (limit === 0) {
    return [] as BatchItemRow[]
  }

  const { data: queuedItems, error: queuedError } = await supabase
    .from('batch_items')
    .select('*')
    .eq('batch_job_id', batchJobId)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (queuedError) {
    throw new Error(`Failed to read queued items: ${queuedError.message || queuedError}`)
  }

  const claimed: BatchItemRow[] = []
  const now = new Date().toISOString()
  for (const item of (queuedItems || []) as BatchItemRow[]) {
    if (!canTransitionBatchItemStatus('queued', 'processing')) {
      continue
    }

    const { data: updated, error: updateError } = await supabase
      .from('batch_items')
      .update({
        status: 'processing',
        locked_at: now,
        attempt_count: (item.attempt_count || 0) + 1,
        last_error: null,
      })
      .eq('id', item.id)
      .eq('status', 'queued')
      .select('*')
      .single()

    if (updateError || !updated) {
      continue
    }

    claimed.push(updated as BatchItemRow)
  }

  await refreshBatchJobCounters(supabase, batchJobId)
  return claimed
}

export async function markBatchItemProcessing(
  supabase: any,
  input: {
    batchJobId: string
    itemId: string
    modelId: string
    tripTaskId: string
  }
) {
  const { error } = await supabase
    .from('batch_items')
    .update({
      status: 'processing',
      model_id: input.modelId,
      trip_task_id: input.tripTaskId,
      locked_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('id', input.itemId)
    .eq('batch_job_id', input.batchJobId)

  if (error) {
    throw new Error(`Failed to mark batch item processing: ${error.message || error}`)
  }
}

export async function markBatchItemCompleted(
  supabase: any,
  input: {
    batchJobId: string
    itemId: string
    modelId?: string | null
    tripTaskId?: string | null
  }
) {
  const { error } = await supabase
    .from('batch_items')
    .update({
      status: 'completed',
      model_id: input.modelId ?? null,
      trip_task_id: input.tripTaskId ?? null,
      last_error: null,
      locked_at: null,
    })
    .eq('id', input.itemId)
    .eq('batch_job_id', input.batchJobId)

  if (error) {
    throw new Error(`Failed to mark batch item completed: ${error.message || error}`)
  }
}

export async function markBatchItemFailed(
  supabase: any,
  input: {
    batchJobId: string
    itemId: string
    errorMessage: string
  }
) {
  const { error } = await supabase
    .from('batch_items')
    .update({
      status: 'failed',
      last_error: input.errorMessage,
      locked_at: null,
    })
    .eq('id', input.itemId)
    .eq('batch_job_id', input.batchJobId)

  if (error) {
    throw new Error(`Failed to mark batch item failed: ${error.message || error}`)
  }
}

export async function requeueFailedBatchItem(
  supabase: any,
  input: {
    batchJobId: string
    itemId: string
  }
) {
  const { data, error } = await supabase
    .from('batch_items')
    .update({
      status: 'queued',
      last_error: null,
      locked_at: null,
    })
    .eq('id', input.itemId)
    .eq('batch_job_id', input.batchJobId)
    .eq('status', 'failed')
    .select('*')
    .single()

  if (error || !data) {
    throw new Error('Failed to requeue batch item')
  }

  await refreshBatchJobCounters(supabase, input.batchJobId)
  return data as BatchItemRow
}

function getModelErrorMessage(model: ModelRow) {
  const metadata = model.metadata || {}
  return (
    metadata.materializationError ||
    metadata.errorMessage ||
    metadata.error ||
    'Batch item generation failed'
  )
}

export async function syncProcessingBatchItemsFromModels(
  supabase: any,
  batchJobId: string
) {
  const { data: processingItems, error: processingError } = await supabase
    .from('batch_items')
    .select('*')
    .eq('batch_job_id', batchJobId)
    .eq('status', 'processing')

  if (processingError) {
    throw new Error(`Failed to read processing items: ${processingError.message || processingError}`)
  }

  const items = ((processingItems || []) as BatchItemRow[]).filter((item) => item.model_id)
  if (items.length === 0) {
    return refreshBatchJobCounters(supabase, batchJobId)
  }

  const modelIds = items.map((item) => item.model_id as string)
  const { data: models, error: modelsError } = await supabase
    .from('models')
    .select('id,status,trip_task_id,metadata')
    .in('id', modelIds)

  if (modelsError) {
    throw new Error(`Failed to sync model statuses: ${modelsError.message || modelsError}`)
  }

  const modelMap = new Map<string, ModelRow>(
    ((models || []) as ModelRow[]).map((model) => [model.id, model])
  )

  for (const item of items) {
    const model = modelMap.get(item.model_id as string)
    if (!model) {
      continue
    }

    if (model.status === 'completed') {
      await markBatchItemCompleted(supabase, {
        batchJobId,
        itemId: item.id,
        modelId: model.id,
        tripTaskId: model.trip_task_id,
      })
      continue
    }

    if (model.status === 'failed') {
      await markBatchItemFailed(supabase, {
        batchJobId,
        itemId: item.id,
        errorMessage: getModelErrorMessage(model),
      })
    }
  }

  return refreshBatchJobCounters(supabase, batchJobId)
}

export const claimQueuedBatchItems = claimBatchItemsForProcessing
