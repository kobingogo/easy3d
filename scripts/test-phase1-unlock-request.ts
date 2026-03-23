import assert from 'node:assert/strict'
import {
  findActiveUnlockRequest,
  findLatestRejectedUnlockRequest,
  mapUnlockRequestInsertErrorToHttpStatus,
  normalizeUnlockRequestPayload,
  toUnlockRequestInsert,
  type UnlockRequestRow,
} from '../lib/seller-workflow/unlock-request'
import { deriveUnlockView } from '../lib/seller-workflow/unlock-state'

function buildRow(input: Partial<UnlockRequestRow> & Pick<UnlockRequestRow, 'id' | 'model_id' | 'status'>): UnlockRequestRow {
  return {
    id: input.id,
    model_id: input.model_id,
    status: input.status,
    contact_name: input.contact_name ?? 'Alice',
    contact_channel: input.contact_channel ?? 'wechat',
    contact_value: input.contact_value ?? 'alice_wechat',
    note: input.note ?? null,
    approved_at: input.approved_at ?? null,
    rejected_at: input.rejected_at ?? null,
    fulfilled_at: input.fulfilled_at ?? null,
    created_at: input.created_at ?? '2026-03-23T10:00:00.000Z',
    updated_at: input.updated_at ?? '2026-03-23T10:00:00.000Z',
  }
}

async function main() {
  const payload = normalizeUnlockRequestPayload({
    modelId: ' model_001 ',
    contactName: ' Alice ',
    contactChannel: 'wechat',
    contactValue: '  alice_wechat  ',
    note: '  请联系我 ',
  })

  assert.deepEqual(payload, {
    modelId: 'model_001',
    contactName: 'Alice',
    contactChannel: 'wechat',
    contactValue: 'alice_wechat',
    note: '请联系我',
  })

  assert.deepEqual(toUnlockRequestInsert(payload), {
    model_id: 'model_001',
    status: 'submitted',
    contact_name: 'Alice',
    contact_channel: 'wechat',
    contact_value: 'alice_wechat',
    note: '请联系我',
    approved_at: null,
    rejected_at: null,
  })

  const previewOnly = deriveUnlockView({
    activeRequest: null,
    latestRejectedRequest: null,
    metadataUnlockStatus: 'unlocked',
  })
  assert.equal(previewOnly.currentState, 'preview_only')
  assert.equal(previewOnly.latestRequestStatus, null)

  const submitted = buildRow({
    id: 'req_submitted',
    model_id: 'model_001',
    status: 'submitted',
    created_at: '2026-03-23T10:01:00.000Z',
  })
  const requestedView = deriveUnlockView({
    activeRequest: submitted,
    latestRejectedRequest: null,
  })
  assert.equal(requestedView.currentState, 'requested')
  assert.equal(requestedView.currentRequestId, 'req_submitted')
  assert.equal(requestedView.submittedAt, '2026-03-23T10:01:00.000Z')

  const approvedPending = buildRow({
    id: 'req_approved',
    model_id: 'model_001',
    status: 'approved',
    approved_at: '2026-03-23T10:02:00.000Z',
    fulfilled_at: null,
    created_at: '2026-03-23T09:50:00.000Z',
  })
  const approvedView = deriveUnlockView({
    activeRequest: approvedPending,
    latestRejectedRequest: null,
  })
  assert.equal(approvedView.currentState, 'approved')
  assert.equal(approvedView.approvedAt, '2026-03-23T10:02:00.000Z')
  assert.equal(approvedView.fulfilledAt, undefined)

  const approvedFulfilled = buildRow({
    id: 'req_unlocked',
    model_id: 'model_001',
    status: 'approved',
    approved_at: '2026-03-23T10:02:00.000Z',
    fulfilled_at: '2026-03-23T10:03:00.000Z',
    created_at: '2026-03-23T09:50:00.000Z',
  })
  const unlockedView = deriveUnlockView({
    activeRequest: approvedFulfilled,
    latestRejectedRequest: null,
  })
  assert.equal(unlockedView.currentState, 'unlocked')
  assert.equal(unlockedView.fulfilledAt, '2026-03-23T10:03:00.000Z')

  const rejectedOld = buildRow({
    id: 'req_rejected',
    model_id: 'model_001',
    status: 'rejected',
    rejected_at: '2026-03-23T09:30:00.000Z',
    created_at: '2026-03-23T09:00:00.000Z',
  })
  const rejectedView = deriveUnlockView({
    activeRequest: null,
    latestRejectedRequest: rejectedOld,
  })
  assert.equal(rejectedView.currentState, 'rejected')
  assert.equal(rejectedView.currentRequestId, 'req_rejected')
  assert.equal(rejectedView.rejectedAt, '2026-03-23T09:30:00.000Z')

  const historyWithResubmit = [
    rejectedOld,
    submitted,
  ]
  const activeAfterRejected = findActiveUnlockRequest(historyWithResubmit)
  const latestRejected = findLatestRejectedUnlockRequest(historyWithResubmit)
  const resubmitView = deriveUnlockView({
    activeRequest: activeAfterRejected,
    latestRejectedRequest: latestRejected,
  })
  assert.equal(resubmitView.currentState, 'requested')
  assert.equal(resubmitView.currentRequestId, 'req_submitted')

  assert.equal(
    mapUnlockRequestInsertErrorToHttpStatus({
      code: '23505',
      constraint: 'idx_unlock_requests_active_model_id',
    }),
    409
  )
  assert.equal(
    mapUnlockRequestInsertErrorToHttpStatus({
      code: '23505',
      constraint: 'another_unique_index',
    }),
    500
  )

  console.log('[test-phase1-unlock-request] PASS')
}

main().catch((error) => {
  console.error('[test-phase1-unlock-request] FAIL', error)
  process.exit(1)
})
