import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  findActiveUnlockRequest,
  findLatestRejectedUnlockRequest,
  type UnlockRequestRow,
} from '@/lib/seller-workflow/unlock-request'
import { deriveUnlockView } from '@/lib/seller-workflow/unlock-state'

interface ModelRow {
  id: string
  status: string
  metadata: unknown
  model_3d_url: string | null
  thumbnail_url: string | null
  created_at: string
  [key: string]: unknown
}

interface ComposeModelDetailInput {
  model: ModelRow
  unlockRequests: UnlockRequestRow[]
}

interface CopySummary {
  taobaoTitle?: string
  xiaohongshuTitle?: string
  douyinHook?: string
}

interface StrategySummary {
  recommendedPlatform?: string
  marketingHook?: string
  reasoningSummary?: string
  featureFocus?: string[]
}

type ModelsRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: ModelsRouteTestOverrides = {}

function extractCopySummary(metadata: any): CopySummary | null {
  const copy = metadata?.assetPackSnapshot?.copy
  if (!copy) {
    return null
  }

  return {
    taobaoTitle: copy.taobao?.title,
    xiaohongshuTitle: copy.xiaohongshu?.title,
    douyinHook: copy.douyin?.hook,
  }
}

function extractStrategySummary(metadata: any): StrategySummary | null {
  const strategy = metadata?.assetPackSnapshot?.strategy
  if (!strategy) {
    return null
  }

  return {
    recommendedPlatform: strategy.recommendedPlatform,
    marketingHook: strategy.marketingHook,
    reasoningSummary: strategy.reasoningSummary,
    featureFocus: strategy.featureFocus,
  }
}

function groupUnlockRequestsByModelId(requests: UnlockRequestRow[]): Record<string, UnlockRequestRow[]> {
  return requests.reduce<Record<string, UnlockRequestRow[]>>((acc, request) => {
    if (!acc[request.model_id]) {
      acc[request.model_id] = []
    }
    acc[request.model_id].push(request)
    return acc
  }, {})
}

function composeModelDetail(input: ComposeModelDetailInput) {
  const metadata = input.model.metadata
  const activeRequest = findActiveUnlockRequest(input.unlockRequests)
  const latestRejectedRequest = findLatestRejectedUnlockRequest(input.unlockRequests)

  const unlockView = deriveUnlockView({
    activeRequest,
    latestRejectedRequest,
    metadataUnlockStatus:
      metadata && typeof metadata === 'object' && 'unlockStatus' in metadata
        ? (metadata as { unlockStatus?: any }).unlockStatus
        : undefined,
  })

  return {
    model: {
      ...input.model,
      metadata,
      unlockStatus: unlockView.currentState,
      currentState: unlockView.currentState,
      unlockView,
      copySummary: extractCopySummary(metadata),
      strategySummary: extractStrategySummary(metadata),
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseFactory = testOverrides.createClient ?? createClient
    const supabase = await supabaseFactory()
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('id')

    if (modelId) {
      const { data: model, error } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single()

      if (error || !model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }

      const { data: unlockRequests, error: unlockError } = await supabase
        .from('unlock_requests')
        .select('*')
        .eq('model_id', modelId)
        .order('created_at', { ascending: false })

      if (unlockError) {
        return NextResponse.json({ error: 'Failed to fetch unlock requests' }, { status: 500 })
      }

      return NextResponse.json(
        composeModelDetail({
          model: model as ModelRow,
          unlockRequests: (unlockRequests || []) as UnlockRequestRow[],
        })
      )
    }

    const { data: models, error } = await supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
    }

    const modelIds = (models || []).map((model) => model.id)
    let groupedUnlockRequests: Record<string, UnlockRequestRow[]> = {}

    if (modelIds.length > 0) {
      const { data: unlockRequests, error: unlockError } = await supabase
        .from('unlock_requests')
        .select('*')
        .in('model_id', modelIds)
        .order('created_at', { ascending: false })

      if (unlockError) {
        return NextResponse.json({ error: 'Failed to fetch unlock requests' }, { status: 500 })
      }

      groupedUnlockRequests = groupUnlockRequestsByModelId(
        (unlockRequests || []) as UnlockRequestRow[]
      )
    }

    const enrichedModels = (models || []).map((model) =>
      composeModelDetail({
        model: model as ModelRow,
        unlockRequests: groupedUnlockRequests[model.id] || [],
      }).model
    )

    return NextResponse.json({ models: enrichedModels })
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('id')

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
    }

    const supabaseFactory = testOverrides.createClient ?? createClient
    const supabase = await supabaseFactory()

    const { data: model, error: fetchError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single()

    if (fetchError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    if (model.model_3d_url) {
      const fileName = model.model_3d_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('3d-models').remove([fileName])
      }
    }

    if (model.original_image_url) {
      const fileName = model.original_image_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('original-images').remove([fileName])
      }
    }

    const { error: deleteError } = await supabase
      .from('models')
      .delete()
      .eq('id', modelId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(GET as typeof GET & {
  __testables?: {
    composeModelDetail: typeof composeModelDetail
    setTestOverrides: (overrides: ModelsRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  composeModelDetail,
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<keyof ModelsRouteTestOverrides>) {
      delete testOverrides[key]
    }
  },
}

;(DELETE as typeof DELETE & { __testables?: (typeof GET & { __testables?: any })['__testables'] }).__testables =
  (GET as typeof GET & { __testables?: any }).__testables
