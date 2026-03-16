/**
 * Batch Evaluation API
 * Batch evaluation with statistical analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  batchEvaluate,
  type BatchEvaluationResult,
  type EvaluationConfig
} from '@/lib/fine-tune/evaluate'
import { getTrainingSamples, type TrainingSample } from '@/lib/fine-tune/data'

export interface BatchEvaluateRequest {
  samples?: TrainingSample[]
  config?: EvaluationConfig
  sampleCount?: number
}

export interface BatchEvaluateResponse {
  success: boolean
  data?: BatchEvaluationResult
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<BatchEvaluateResponse>> {
  try {
    const body: BatchEvaluateRequest = await request.json()
    const { samples, config = {}, sampleCount = 20 } = body

    console.log(`[batch-evaluate API] Starting batch evaluation, sampleCount: ${sampleCount}`)

    // Use provided samples or get from training data
    const evaluationSamples = samples || getTrainingSamples(Math.min(sampleCount, 100))

    // Run batch evaluation
    const result = await batchEvaluate(evaluationSamples, {
      batchSize: sampleCount,
      improvementThreshold: 40,
      ...config
    })

    console.log(`[batch-evaluate API] Complete. Avg improvement: ${result.averageImprovement}%`)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('[batch-evaluate API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '批量评估失败' },
      { status: 500 }
    )
  }
}

// GET endpoint for batch evaluation status/config
export async function GET() {
  const samples = getTrainingSamples(10)

  return NextResponse.json({
    availableSamples: 600,
    defaultBatchSize: 20,
    maxBatchSize: 100,
    improvementThreshold: 40,
    samplePreview: samples.slice(0, 3).map(s => ({
      id: s.id,
      input: s.input,
      category: s.category,
      style: s.style
    }))
  })
}