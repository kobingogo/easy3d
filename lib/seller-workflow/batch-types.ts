import type { Json } from '@/lib/supabase/types'

export const BATCH_ITEM_MAX_COUNT = 20
export const BATCH_PROCESS_CONCURRENCY = 3

export const BATCH_JOB_STATUSES = [
  'queued',
  'running',
  'partial_failed',
  'completed',
  'canceled',
] as const

export const BATCH_ITEM_STATUSES = [
  'queued',
  'processing',
  'completed',
  'failed',
  'skipped',
] as const

export type BatchJobStatus = (typeof BATCH_JOB_STATUSES)[number]
export type BatchItemStatus = (typeof BATCH_ITEM_STATUSES)[number]

export interface BatchJobSummary {
  id: string
  name: string
  category: 'bags'
  workflowTemplateId: string | null
  status: BatchJobStatus
  totalCount: number
  queuedCount: number
  processingCount: number
  completedCount: number
  failedCount: number
  createdAt: string
  updatedAt: string
  startedAt: string | null
  completedAt: string | null
  canceledAt: string | null
}

export interface BatchItemSummary {
  id: string
  batchJobId: string
  modelId: string | null
  sourceImageUrl: string
  status: BatchItemStatus
  attemptCount: number
  lastError: string | null
  tripTaskId: string | null
  lockedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BatchCreateInputItem {
  sourceImageUrl: string
  metadata?: Json
}

export interface BatchCounters {
  totalCount: number
  queuedCount: number
  processingCount: number
  completedCount: number
  failedCount: number
}

export function canTransitionBatchItemStatus(
  from: BatchItemStatus,
  to: BatchItemStatus
) {
  const allowed: Record<BatchItemStatus, BatchItemStatus[]> = {
    queued: ['processing', 'skipped'],
    processing: ['completed', 'failed', 'skipped'],
    failed: ['queued', 'skipped'],
    completed: [],
    skipped: [],
  }

  return allowed[from].includes(to)
}

export function assertBatchItemCountWithinLimit(count: number) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Batch item count must be a positive integer')
  }

  if (count > BATCH_ITEM_MAX_COUNT) {
    throw new Error(`Batch item count exceeds limit (${BATCH_ITEM_MAX_COUNT})`)
  }
}

export function deriveBatchJobStatus(counters: BatchCounters): BatchJobStatus {
  if (counters.totalCount === 0) {
    return 'queued'
  }

  if (counters.completedCount === counters.totalCount) {
    return 'completed'
  }

  if (counters.failedCount > 0 && counters.completedCount > 0) {
    return 'partial_failed'
  }

  if (counters.failedCount > 0 && counters.queuedCount === 0 && counters.processingCount === 0) {
    return 'partial_failed'
  }

  if (counters.processingCount > 0 || counters.completedCount > 0) {
    return 'running'
  }

  return 'queued'
}
