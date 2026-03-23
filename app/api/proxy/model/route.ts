import { NextRequest, NextResponse } from 'next/server'

/**
 * 模型代理端点 - 流式传输版本
 * 解决 Tripo CDN URL 的 CORS 问题
 * 支持流式传输、Range 请求、缓存
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

    // 获取 Range 请求头（支持分段加载）
    const rangeHeader = request.headers.get('range')

    // 构建请求头
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    // 获取模型 - 使用流式响应
    const response = await fetch(url, { headers })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch model: ${response.status}` },
        { status: response.status }
      )
    }

    // 获取内容长度
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type') || 'model/gltf-binary'

    // 构建响应头
    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="model.glb"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      // 长期缓存（模型 URL 通常带有签名，不会变化）
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength
    }

    // 支持 Range 请求（用于断点续传和分段加载）
    if (response.status === 206) {
      responseHeaders['Content-Range'] = response.headers.get('content-range') || ''
      return new NextResponse(response.body, {
        status: 206,
        headers: responseHeaders
      })
    }

    // 流式返回模型数据
    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders
    })

  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy failed', message: error.message },
      { status: 500 }
    )
  }
}

// 支持 OPTIONS 预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '86400',
    }
  })
}