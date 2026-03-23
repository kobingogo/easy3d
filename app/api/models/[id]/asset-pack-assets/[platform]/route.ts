import { NextRequest, NextResponse } from 'next/server'
import { PHASE1_PLATFORMS, type Platform } from '@/lib/export/platform-adapter'
import { createClient } from '@/lib/supabase/server'

type AssetRouteTestOverrides = {
  createClient?: typeof createClient
  fetchImpl?: typeof fetch
}

const testOverrides: AssetRouteTestOverrides = {}

function isPlatform(value: string): value is Platform {
  return PHASE1_PLATFORMS.includes(value as Platform)
}

function getSnapshotAsset(model: any, platform: Platform) {
  const assets = model?.metadata?.assetPackSnapshot?.manifest?.assets
  if (!Array.isArray(assets)) {
    return null
  }

  return assets.find((asset) => asset?.platform === platform) || null
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; platform: string }> }
) {
  try {
    const { id, platform } = await context.params
    if (!isPlatform(platform)) {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    }

    const supabaseFactory = testOverrides.createClient ?? createClient
    const supabase = await supabaseFactory()
    const { data: model, error } = await supabase
      .from('models')
      .select('id, thumbnail_url, metadata')
      .eq('id', id)
      .single()

    if (error || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const asset = getSnapshotAsset(model, platform)
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const sourceUrl = asset.previewUrl || model.thumbnail_url
    if (!sourceUrl) {
      return NextResponse.json({ error: 'Asset source is missing' }, { status: 404 })
    }

    const fetchImpl = testOverrides.fetchImpl ?? fetch
    const upstream = await fetchImpl(sourceUrl, { cache: 'no-store' })
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Failed to fetch asset source' }, { status: 502 })
    }

    const filename = String(asset.filename).split('/').pop() || `${platform}.jpg`

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType || upstream.headers.get('content-type') || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Asset pack asset route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

;(GET as typeof GET & {
  __testables?: {
    setTestOverrides: (overrides: AssetRouteTestOverrides) => void
    resetTestOverrides: () => void
  }
}).__testables = {
  setTestOverrides: (overrides) => {
    Object.assign(testOverrides, overrides)
  },
  resetTestOverrides: () => {
    for (const key of Object.keys(testOverrides) as Array<keyof AssetRouteTestOverrides>) {
      delete testOverrides[key]
    }
  },
}
