/**
 * Prompt Optimization API
 * Exposes the optimize_prompt tool for frontend use
 */

import { NextRequest, NextResponse } from 'next/server'
import { optimizePromptTool } from '@/lib/agent/tools/optimize-prompt'
import type { ExtendedProductAnalysis } from '@/lib/agent/tools/analyze-product'
import type { StyleTemplate } from '@/lib/agent/types'

// Simple tracer for API context
const apiTracer = {
  startStep: (stepId: string, tool: string, input: any) => {
    console.log(`[Tracer] Starting step ${stepId}: ${tool}`, JSON.stringify(input).slice(0, 200))
  },
  endStepSuccess: (stepId: string, result: any, metadata?: any) => {
    console.log(`[Tracer] Step ${stepId} succeeded`, metadata ? JSON.stringify(metadata) : '')
  },
  endStepFailed: (stepId: string, error: string) => {
    console.error(`[Tracer] Step ${stepId} failed:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { analysis, style, platform, userDescription } = body

    // Validate required fields
    if (!userDescription && !analysis) {
      return NextResponse.json(
        { error: '请提供商品描述或分析结果' },
        { status: 400 }
      )
    }

    // Create tool context
    const context = {
      workflowId: `api-${Date.now()}`,
      stepId: 'optimize-prompt-1',
      previousResults: new Map(),
      tracer: apiTracer
    }

    // Prepare input
    const input = {
      analysis: analysis as ExtendedProductAnalysis | undefined,
      style: style as StyleTemplate | undefined,
      platform: platform as 'xiaohongshu' | 'taobao' | 'douyin' | 'amazon' | undefined,
      userDescription: userDescription as string | undefined
    }

    console.log('[optimize API] Input:', JSON.stringify(input).slice(0, 300))

    // Execute the tool
    const result = await optimizePromptTool.handler(input, context)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: result.metadata
      })
    } else {
      return NextResponse.json(
        { error: result.error?.message || '提示词优化失败' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[optimize API] Error:', error)
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve available styles and platforms
export async function GET() {
  return NextResponse.json({
    styles: [
      { id: 'minimal', name: '极简', description: '干净白色背景，柔和漫射光，极简构图' },
      { id: 'luxury', name: '奢华', description: '优雅渐变背景，高级摄影灯光，金色点缀' },
      { id: 'tech', name: '科技', description: '未来感深色背景，蓝色LED光效，金属反光表面' },
      { id: 'natural', name: '自然', description: '自然日光，有机背景，木质纹理，生活化' },
      { id: 'trendy', name: '潮流', description: '活力渐变背景，动态角度，多彩灯光' }
    ],
    platforms: [
      { id: 'xiaohongshu', name: '小红书', description: '生活化、种草感、氛围感强' },
      { id: 'taobao', name: '淘宝', description: '专业、干净、突出商品' },
      { id: 'douyin', name: '抖音', description: '潮流、动感、吸引眼球' },
      { id: 'amazon', name: '亚马逊', description: '专业、简洁、标准化' }
    ]
  })
}