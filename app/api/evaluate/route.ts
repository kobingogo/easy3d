/**
 * Prompt Evaluation API
 * Single prompt evaluation with LLM-based scoring
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  evaluateWithLLM,
  comparePrompts,
  quickEvaluate,
  type EvaluationMetrics,
  type ComparisonResult
} from '@/lib/fine-tune/evaluate'
import type { ProductCategory, StyleType, PlatformType } from '@/lib/fine-tune/data'

export interface EvaluateRequest {
  prompt: string
  originalPrompt?: string
  context?: {
    originalInput?: string
    category?: ProductCategory
    style?: StyleType
    platform?: PlatformType
  }
  mode?: 'single' | 'compare' | 'quick'
}

export interface EvaluateResponse {
  success: boolean
  data?: {
    metrics?: EvaluationMetrics
    comparison?: ComparisonResult
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<EvaluateResponse>> {
  try {
    const body: EvaluateRequest = await request.json()
    const { prompt, originalPrompt, context = {}, mode = 'single' } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '请提供提示词' },
        { status: 400 }
      )
    }

    console.log(`[evaluate API] Mode: ${mode}, Prompt length: ${prompt.length}`)

    let result: EvaluateResponse['data']

    switch (mode) {
      case 'compare':
        // Compare original vs optimized prompt
        if (!originalPrompt) {
          return NextResponse.json(
            { success: false, error: '对比模式需要提供原始提示词' },
            { status: 400 }
          )
        }
        const comparison = await comparePrompts(originalPrompt, prompt, context)
        result = { comparison }
        break

      case 'quick':
        // Quick heuristic evaluation (no LLM call)
        const quickMetrics = quickEvaluate(prompt)
        result = { metrics: quickMetrics }
        break

      case 'single':
      default:
        // Full LLM-based evaluation
        const metrics = await evaluateWithLLM(prompt, context)
        result = { metrics }
        break
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('[evaluate API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '评估失败' },
      { status: 500 }
    )
  }
}

// GET endpoint for evaluation criteria info
export async function GET() {
  return NextResponse.json({
    modes: [
      { id: 'single', name: '单次评估', description: 'LLM 全维度评分' },
      { id: 'compare', name: '对比评估', description: '对比原始与优化后提示词' },
      { id: 'quick', name: '快速评估', description: '启发式规则评估（无 LLM 调用）' }
    ],
    metrics: [
      { id: 'overallScore', name: '整体质量', weight: 1.0 },
      { id: 'professionalismScore', name: '专业度', weight: 0.25 },
      { id: 'detailScore', name: '细节描述', weight: 0.20 },
      { id: 'creativityScore', name: '创意性', weight: 0.15 },
      { id: 'ecommerceScore', name: '电商适配度', weight: 0.20 },
      { id: 'generationScore', name: '3D生成友好度', weight: 0.20 }
    ],
    categories: [
      'fashion', 'beauty', 'electronics', 'home',
      'food', 'sports', 'toys', 'jewelry'
    ],
    styles: ['minimal', 'luxury', 'tech', 'natural', 'trendy'],
    platforms: ['xiaohongshu', 'taobao', 'douyin', 'amazon']
  })
}