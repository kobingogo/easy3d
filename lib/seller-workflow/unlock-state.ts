import type { UnlockStatus } from './types'
import type { UnlockRequestRow, UnlockRequestView } from './unlock-request'

type ActiveRequest = Pick<
  UnlockRequestRow,
  'id' | 'status' | 'created_at' | 'approved_at' | 'fulfilled_at'
>

type RejectedRequest = Pick<
  UnlockRequestRow,
  'id' | 'status' | 'created_at' | 'rejected_at'
>

export interface DeriveUnlockViewInput {
  activeRequest: ActiveRequest | null
  latestRejectedRequest: RejectedRequest | null
  metadataUnlockStatus?: UnlockStatus | null
}

export function deriveUnlockView(input: DeriveUnlockViewInput): UnlockRequestView {
  const active = input.activeRequest

  if (active) {
    if (active.status === 'submitted') {
      return {
        currentState: 'requested',
        currentRequestId: active.id,
        latestRequestStatus: 'submitted',
        submittedAt: active.created_at,
      }
    }

    if (active.status === 'approved') {
      if (active.fulfilled_at) {
        return {
          currentState: 'unlocked',
          currentRequestId: active.id,
          latestRequestStatus: 'approved',
          approvedAt: active.approved_at ?? undefined,
          fulfilledAt: active.fulfilled_at,
        }
      }

      return {
        currentState: 'approved',
        currentRequestId: active.id,
        latestRequestStatus: 'approved',
        approvedAt: active.approved_at ?? undefined,
      }
    }
  }

  const latestRejected = input.latestRejectedRequest
  if (latestRejected && latestRejected.status === 'rejected') {
    return {
      currentState: 'rejected',
      currentRequestId: latestRejected.id,
      latestRequestStatus: 'rejected',
      rejectedAt: latestRejected.rejected_at ?? undefined,
    }
  }

  return {
    currentState: 'preview_only',
    currentRequestId: null,
    latestRequestStatus: null,
  }
}
