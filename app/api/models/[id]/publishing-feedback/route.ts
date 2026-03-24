import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  applyPublishingFeedbackToMetadata,
  isPublishingPlatform,
  normalizePublishingVariantId,
  type PublishingFeedbackAction,
  type PublishingResultPayload,
} from '@/lib/seller-workflow/publishing-feedback'

interface ModelRow {
  id: string
  metadata: unknown
  updated_at: string
}

interface PublishingFeedbackPayload {
  platform: string
  variantId: string
  action: PublishingFeedbackAction
  appliedBy?: string
  publishResult?: PublishingResultPayload
}

type PublishingFeedbackRouteTestOverrides = {
  createClient?: typeof createClient
  nowIso?: () => string
}

const testOverrides: PublishingFeedbackRouteTestOverrides = {}

function parsePublishingFeedbackPayload(
  payload: PublishingFeedbackPayload
): {
  platform: 'taobao' | 'xiaohongshu' | 'douyin'
  variantId: string
  action: PublishingFeedbackAction
  appliedBy?: string
  publishResult?: PublishingResultPayload
} {
  if (!isPublishingPlatform(payload.platform)) {
    throw new Error('Unsupported platform')
  }

  const variantId = normalizePublishingVariantId(payload.variantId || '')
  if (!variantId) {
    throw new Error('variantId is required')
  }

  if (payload.action !== 'copy' && payload.action !== 'publish_result') {
    if (payload.action === 'set_next_recommendation') {
      return {
        platform: payload.platform,
        variantId,
        action: payload.action,
        appliedBy: normalizeAppliedBy(payload.appliedBy),
        publishResult: payload.publishResult,
      }
    }
    throw new Error('Unsupported action')
  }

  if (payload.action === 'publish_result' && !payload.publishResult) {
    throw new Error('publishResult is required for publish_result action')
  }

  return {
    platform: payload.platform,
    variantId,
    action: payload.action,
    appliedBy: normalizeAppliedBy(payload.appliedBy),
    publishResult: payload.publishResult,
  }
}

async function resolveAppliedByLabel(
  supabase: any,
  fallback?: string
): Promise<string> {
  const normalizedFallback = normalizeAppliedBy(fallback)
  if (normalizedFallback) {
    return normalizedFallback
  }

  try {
    const userResult = await supabase?.auth?.getUser?.()
    const userId = userResult?.data?.user?.id
    if (typeof userId === 'string' && userId.trim()) {
      return `user:${userId.trim()}`
    }
  } catch {
    // no-op: fallback to anonymous label
  }

  return 'user:anonymous'
}

function normalizeAppliedBy(value?: string): string | undefined {
  const normalized = value?.trim()
  if (!normalized) {
    return undefined
  }
  return normalized.slice(0, 120)
}

async function fetchModelById(supabase: any, id: string): Promise<ModelRow | null> {
  const { data, error } = await supabase
    .from('models')
    .select('id,metadata,updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch model: ${error.message || error}`)
  }

  return data as ModelRow | null
}

async function updateModelMetadataWithGuard(input: {
  supabase: any
  modelId: string
  updatedAt: string
  metadata: Record<string, unknown>
}) {
  const { data, error } = await input.supabase
    .from('models')
    .update({ metadata: input.metadata })
    .eq('id', input.modelId)
    .eq('updated_at', input.updatedAt)
    .select('id')

  if (error) {
    return { ok: false, error }
  }

  return { ok: Array.isArray(data) && data.length > 0, error: null }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()
    const model = await fetchModelById(supabase, id)
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const metadata =
      model.metadata && typeof model.metadata === 'object'
        ? (model.metadata as Record<string, unknown>)
        : {}

    return NextResponse.json({
      modelId: id,
      feedback: metadata.publishingFeedback || null,
    })
  } catch (error: any) {
    console.error('Publishing feedback GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const payload = parsePublishingFeedbackPayload(
      (await request.json()) as PublishingFeedbackPayload
    )

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()
    const nowIso = testOverrides.nowIso?.() ?? new Date().toISOString()
    const appliedBy =
      payload.action === 'set_next_recommendation'
        ? await resolveAppliedByLabel(supabase, payload.appliedBy)
        : undefined

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const model = await fetchModelById(supabase, id)
      if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }

      const next = applyPublishingFeedbackToMetadata(model.metadata, {
        platform: payload.platform,
        variantId: payload.variantId,
        action: payload.action,
        publishResult: payload.publishResult,
        appliedBy,
        nowIso,
      })

      const result = await updateModelMetadataWithGuard({
        supabase,
        modelId: id,
        updatedAt: model.updated_at,
        metadata: next.metadata,
      })

      if (result.error) {
        throw new Error(`Failed to update publishing feedback: ${result.error.message || result.error}`)
      }
      if (result.ok) {
        return NextResponse.json({
          modelId: id,
          feedback: next.feedback,
        })
      }
    }

    return NextResponse.json(
      { error: 'Publishing feedback update conflict, please retry' },
      { status: 409 }
    )
  } catch (error: any) {
    console.error('Publishing feedback POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

;(POST as typeof POST & {
  __testables?: {
    parsePublishingFeedbackPayload: typeof parsePublishingFeedbackPayload
    setTestOverrides: (overrides: PublishingFeedbackRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  parsePublishingFeedbackPayload,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof PublishingFeedbackRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}

;(GET as typeof GET & { __testables?: (typeof POST & { __testables?: any })['__testables'] }).__testables =
  (POST as typeof POST & { __testables?: any }).__testables
