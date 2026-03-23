import type { UnlockStatus } from './types'

export type UnlockRequestStatus = 'submitted' | 'approved' | 'rejected'
export type UnlockContactChannel = 'wechat' | 'phone' | 'xiaohongshu'

export interface UnlockRequestPayload {
  modelId: string
  contactName: string
  contactChannel: UnlockContactChannel
  contactValue: string
  note?: string
}

export interface UnlockRequestInsert {
  model_id: string
  status: UnlockRequestStatus
  contact_name: string
  contact_channel: UnlockContactChannel
  contact_value: string
  note: string | null
}

export interface UnlockRequestRow {
  id: string
  model_id: string
  status: UnlockRequestStatus
  contact_name: string
  contact_channel: UnlockContactChannel
  contact_value: string
  note: string | null
  fulfilled_at: string | null
  created_at: string
  updated_at: string
}

export interface UnlockRequestView {
  currentState: UnlockStatus
  currentRequestId: string | null
  latestRequestStatus: UnlockRequestStatus | null
  submittedAt?: string
  rejectedAt?: string
  approvedAt?: string
  fulfilledAt?: string
}

export function normalizeUnlockRequestPayload(
  payload: UnlockRequestPayload
): UnlockRequestPayload {
  if (!isUnlockContactChannel(payload.contactChannel)) {
    throw new Error(`Unsupported contact channel: ${payload.contactChannel}`)
  }

  const modelId = payload.modelId.trim()
  const contactName = payload.contactName.trim()
  const contactValue = payload.contactValue.trim()
  const note = payload.note?.trim()

  if (!modelId) {
    throw new Error('modelId is required')
  }
  if (!contactName) {
    throw new Error('contactName is required')
  }
  if (!contactValue) {
    throw new Error('contactValue is required')
  }

  return {
    modelId,
    contactName,
    contactChannel: payload.contactChannel,
    contactValue,
    note: note || undefined,
  }
}

export function toUnlockRequestInsert(
  payload: UnlockRequestPayload
): UnlockRequestInsert {
  const normalized = normalizeUnlockRequestPayload(payload)
  return {
    model_id: normalized.modelId,
    status: 'submitted',
    contact_name: normalized.contactName,
    contact_channel: normalized.contactChannel,
    contact_value: normalized.contactValue,
    note: normalized.note ?? null,
  }
}

export function isUnlockRequestStatusActive(
  status: UnlockRequestStatus
): boolean {
  return status === 'submitted' || status === 'approved'
}

export function findActiveUnlockRequest(
  requests: UnlockRequestRow[]
): UnlockRequestRow | null {
  return pickLatestRequest(
    requests.filter((request) => isUnlockRequestStatusActive(request.status))
  )
}

export function findLatestRejectedUnlockRequest(
  requests: UnlockRequestRow[]
): UnlockRequestRow | null {
  return pickLatestRequest(
    requests.filter((request) => request.status === 'rejected')
  )
}

export interface PostgresInsertError {
  code?: string
  constraint?: string
}

const ACTIVE_REQUEST_CONSTRAINTS = new Set([
  'idx_unlock_requests_active_model_id',
])

export function isUnlockRequestActiveConflict(
  error: PostgresInsertError | null | undefined
): boolean {
  return (
    error?.code === '23505' &&
    Boolean(error.constraint && ACTIVE_REQUEST_CONSTRAINTS.has(error.constraint))
  )
}

export function mapUnlockRequestInsertErrorToHttpStatus(
  error: PostgresInsertError | null | undefined
): 409 | 500 {
  return isUnlockRequestActiveConflict(error) ? 409 : 500
}

function pickLatestRequest(
  requests: UnlockRequestRow[]
): UnlockRequestRow | null {
  if (requests.length === 0) {
    return null
  }

  return requests.reduce((latest, current) => {
    const latestAt = Date.parse(latest.created_at)
    const currentAt = Date.parse(current.created_at)
    return currentAt > latestAt ? current : latest
  })
}

function isUnlockContactChannel(
  channel: string
): channel is UnlockContactChannel {
  return channel === 'wechat' || channel === 'phone' || channel === 'xiaohongshu'
}
