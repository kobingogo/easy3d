import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildBatchExportZip } from '@/lib/seller-workflow/batch-export'

interface BatchJobRow {
  id: string
  name: string
}

interface BatchItemRow {
  id: string
  batch_job_id: string
  model_id: string | null
  source_image_url: string
  status: string
  attempt_count: number
}

interface ModelRow {
  id: string
  model_3d_url: string | null
  thumbnail_url: string | null
  metadata: any
}

type BatchDownloadRouteTestOverrides = {
  createClient?: typeof createClient
}

const testOverrides: BatchDownloadRouteTestOverrides = {}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return Response.json({ error: 'batch id is required' }, { status: 400 })
    }

    const createClientImpl = testOverrides.createClient ?? createClient
    const supabase = await createClientImpl()

    const { data: batch, error: batchError } = await supabase
      .from('batch_jobs')
      .select('id,name')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return Response.json({ error: 'Batch not found' }, { status: 404 })
    }

    const { data: items, error: itemsError } = await supabase
      .from('batch_items')
      .select('id,batch_job_id,model_id,source_image_url,status,attempt_count')
      .eq('batch_job_id', id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })

    if (itemsError) {
      return Response.json({ error: 'Failed to fetch batch items' }, { status: 500 })
    }

    const completedItems = (items || []) as BatchItemRow[]
    const modelIds = completedItems
      .map((item) => item.model_id)
      .filter((item): item is string => Boolean(item))

    if (modelIds.length === 0) {
      return Response.json(
        { error: 'No completed items available for export' },
        { status: 400 }
      )
    }

    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select('id,model_3d_url,thumbnail_url,metadata')
      .in('id', modelIds)

    if (modelsError) {
      return Response.json({ error: 'Failed to fetch model details' }, { status: 500 })
    }

    const modelMap = new Map<string, ModelRow>(
      ((models || []) as ModelRow[]).map((model) => [model.id, model])
    )

    const exportItems = completedItems
      .map((item) => {
        const model = item.model_id ? modelMap.get(item.model_id) : null
        if (!model || !item.model_id) {
          return null
        }

        return {
          batchItemId: item.id,
          modelId: item.model_id,
          sourceImageUrl: item.source_image_url,
          attemptCount: item.attempt_count,
          status: item.status,
          model3dUrl: model.model_3d_url,
          thumbnailUrl: model.thumbnail_url,
          metadata: model.metadata || null,
        }
      })
      .filter(Boolean)

    const exported = buildBatchExportZip({
      batchId: id,
      batchName: (batch as BatchJobRow).name,
      items: exportItems as NonNullable<(typeof exportItems)[number]>[],
    })

    if (exported.exportedCount === 0) {
      return Response.json(
        { error: 'No completed/unlocked items available for export' },
        { status: 400 }
      )
    }

    return new Response(Buffer.from(exported.bytes), {
      status: 200,
      headers: {
        'content-type': 'application/zip',
        'content-disposition': `attachment; filename="${exported.filename}"`,
        'x-exported-count': String(exported.exportedCount),
      },
    })
  } catch (error: any) {
    console.error('Batch download GET error:', error)
    return Response.json(
      { error: error?.message || 'Failed to export batch' },
      { status: 500 }
    )
  }
}

;(GET as typeof GET & {
  __testables?: {
    setTestOverrides: (overrides: BatchDownloadRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<
      keyof BatchDownloadRouteTestOverrides
    >) {
      delete testOverrides[key]
    }
  },
}
