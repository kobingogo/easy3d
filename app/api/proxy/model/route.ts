import { NextRequest, NextResponse } from 'next/server'

/**
 * 模型代理端点
 * 解决 Tripo CDN URL 的 CORS 问题
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
    }

    // 验证 URL 是否来自 Tripo CDN
    const parsedUrl = new URL(url)
    if (!parsedUrl.hostname.includes('tripo3d.com') && !parsedUrl.hostname.includes('tripo-data')) {
      return NextResponse.json({ error: 'Invalid URL source' }, { status: 403 })
    }

    // 获取模型
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch model: ${response.status}` },
        { status: response.status }
      )
    }

    const arrayBuffer = await response.arrayBuffer()

    // 返回模型数据，设置正确的 CORS 头
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy failed', message: error.message },
      { status: 500 }
    )
  }
}