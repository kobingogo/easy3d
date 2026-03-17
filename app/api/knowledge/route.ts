import { NextRequest, NextResponse } from 'next/server'
import { searchKnowledge, askKnowledge, suggestDisplay } from '@/lib/rag/search'
import { getStats, getCollectionInfo, getAllEntries } from '@/lib/rag/qdrant'
import type { KnowledgeCategory } from '@/lib/rag/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // 获取知识库状态
    if (action === 'stats') {
      const stats = await getStats()
      const info = await getCollectionInfo()

      return NextResponse.json({
        success: true,
        stats,
        info: info ? {
          pointsCount: info.points_count,
          segmentsCount: info.segments_count,
          status: info.status
        } : null
      })
    }

    // 获取知识条目列表
    if (action === 'list') {
      const category = searchParams.get('category') as KnowledgeCategory | null
      const limit = parseInt(searchParams.get('limit') || '20')
      const offset = parseInt(searchParams.get('offset') || '0')

      const { entries, total } = await getAllEntries({
        category: category || undefined,
        limit,
        offset
      })

      return NextResponse.json({
        success: true,
        entries,
        total,
        category: category || 'all'
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: stats, list'
    }, { status: 400 })

  } catch (error) {
    console.error('Knowledge API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, query, productDescription, style, options } = body

    const startTime = Date.now()

    // 搜索知识
    if (action === 'search') {
      if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 })
      }

      const results = await searchKnowledge(query, options)

      return NextResponse.json({
        success: true,
        results,
        query,
        latency: Date.now() - startTime
      })
    }

    // 问答
    if (action === 'ask') {
      if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 })
      }

      const result = await askKnowledge(query)

      return NextResponse.json({
        success: true,
        answer: result.answer,
        references: result.references,
        query,
        latency: Date.now() - startTime
      })
    }

    // 展示建议
    if (action === 'suggest') {
      if (!productDescription) {
        return NextResponse.json({ error: 'Product description is required' }, { status: 400 })
      }

      const result = await suggestDisplay(productDescription, style)

      return NextResponse.json({
        success: true,
        suggestion: result.suggestion,
        references: result.references,
        latency: Date.now() - startTime
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: search, ask, suggest'
    }, { status: 400 })

  } catch (error) {
    console.error('Knowledge API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}