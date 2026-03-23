import assert from 'node:assert/strict'
import {
  BATCH_ITEM_MAX_COUNT,
  BATCH_JOB_STATUSES,
  canTransitionBatchItemStatus,
} from '../lib/seller-workflow/batch-types'

async function main() {
  assert.deepEqual(BATCH_JOB_STATUSES, [
    'queued',
    'running',
    'partial_failed',
    'completed',
    'canceled',
  ])

  assert.equal(BATCH_ITEM_MAX_COUNT, 20)

  assert.equal(canTransitionBatchItemStatus('queued', 'processing'), true)
  assert.equal(canTransitionBatchItemStatus('processing', 'completed'), true)
  assert.equal(canTransitionBatchItemStatus('processing', 'failed'), true)
  assert.equal(canTransitionBatchItemStatus('failed', 'queued'), true)
  assert.equal(canTransitionBatchItemStatus('completed', 'queued'), false)

  console.log('[test-phase2a-batch-schema] PASS')
}

main().catch((error) => {
  console.error('[test-phase2a-batch-schema] FAIL', error)
  process.exit(1)
})
