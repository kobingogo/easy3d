import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  findActiveUnlockRequest,
  findLatestRejectedUnlockRequest,
  mapUnlockRequestInsertErrorToHttpStatus,
  toUnlockRequestInsert,
  type PostgresInsertError,
  type UnlockRequestPayload,
  type UnlockRequestRow,
} from '@/lib/seller-workflow/unlock-request'
import { deriveUnlockView } from '@/lib/seller-workflow/unlock-state'

interface ResolveUnlockViewResult {
  activeRequest: UnlockRequestRow | null
  latestRejectedRequest: UnlockRequestRow | null
  unlockView: ReturnType<typeof deriveUnlockView>
}

type UnlockRequestsRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: UnlockRequestsRouteTestOverrides = {}

function buildUnlockRequestInsertPayload(payload: UnlockRequestPayload) {
  return toUnlockRequestInsert(payload)
}

function mapUnlockInsertErrorStatus(
  error: PostgresInsertError | null | undefined
) {
  return mapUnlockRequestInsertErrorToHttpStatus(error)
}

function resolveUnlockViewFromRequests(
  requests: UnlockRequestRow[]
): ResolveUnlockViewResult {
  const activeRequest = findActiveUnlockRequest(requests)
  const latestRejectedRequest = findLatestRejectedUnlockRequest(requests)

  const unlockView = deriveUnlockView({
    activeRequest,
    latestRejectedRequest,
  })

  return {
    activeRequest,
    latestRejectedRequest,
    unlockView,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as UnlockRequestPayload
    const supabaseFactory = testOverrides.createClient ?? createClient
    const supabase = await supabaseFactory()
    const insertPayload = buildUnlockRequestInsertPayload(payload)

    const { data, error } = await supabase
      .from('unlock_requests')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      const status = mapUnlockInsertErrorStatus(error)
      if (status === 409) {
        return NextResponse.json(
          { error: 'Active unlock request already exists for this model' },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: 'Failed to create unlock request' }, { status: 500 })
    }

    const resolved = resolveUnlockViewFromRequests([data as UnlockRequestRow])
    return NextResponse.json(
      {
        success: true,
        request: data,
        unlockView: resolved.unlockView,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Unlock requests POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Invalid unlock request payload' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 })
    }

    const supabaseFactory = testOverrides.createClient ?? createClient
    const supabase = await supabaseFactory()
    const { data, error } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch unlock requests' }, { status: 500 })
    }

    const requests = (data || []) as UnlockRequestRow[]
    const resolved = resolveUnlockViewFromRequests(requests)

    return NextResponse.json({
      modelId,
      unlockView: resolved.unlockView,
      activeRequest: resolved.activeRequest,
      latestRejectedRequest: resolved.latestRejectedRequest,
      requests,
    })
  } catch (error) {
    console.error('Unlock requests GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(POST as typeof POST & {
  __testables?: {
    buildUnlockRequestInsertPayload: typeof buildUnlockRequestInsertPayload
    mapUnlockInsertErrorStatus: typeof mapUnlockInsertErrorStatus
    resolveUnlockViewFromRequests: typeof resolveUnlockViewFromRequests
    setTestOverrides: (overrides: UnlockRequestsRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  buildUnlockRequestInsertPayload,
  mapUnlockInsertErrorStatus,
  resolveUnlockViewFromRequests,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof UnlockRequestsRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}

;(GET as typeof GET & { __testables?: (typeof POST & { __testables?: any })['__testables'] }).__testables =
  (POST as typeof POST & { __testables?: any }).__testables
