/**
 * Prompt Evaluation System
 * Task 4.3: 效果评估系统
 *
 * LLM-based auto-scoring with evaluation metrics:
 * - Quality score (1-10)
 * - Professional metrics
 * - Before/after comparison
 * - Statistical analysis
 */

import {
  TrainingSample,
  ProductCategory,
  StyleType,
  PlatformType,
  getTrainingSamples
} from './data'
import type { OptimizationResult } from './prompt-optimizer'

// ==================== 类型定义 ====================

export interface EvaluationMetrics {
  /** 整体质量评分 (1-10) */
  overallScore: number
  /** 专业度评分 (1-10) */
  professionalismScore: number
  /** 细节描述评分 (1-10) */
  detailScore: number
  /** 创意性评分 (1-10) */
  creativityScore: number
  /** 电商适配度 (1-10) */
  ecommerceScore: number
  /** 3D生成友好度 (1-10) */
  generationScore: number
  /** 详细评价 */
  feedback: string
  /** 改进建议 */
  suggestions: string[]
}

export interface ComparisonResult {
  /** 原始提示词 */
  original: string
  /** 优化后提示词 */
  optimized: string
  /** 原始评分 */
  originalMetrics: EvaluationMetrics
  /** 优化后评分 */
  optimizedMetrics: EvaluationMetrics
  /** 提升百分比 */
  improvement: {
    overall: number      // 整体提升 %
    professionalism: number
    detail: number
    creativity: number
    ecommerce: number
    generation: number
  }
  /** 是否通过阈值 */
  passed: boolean
  /** 提升摘要 */
  summary: string
}

export interface BatchEvaluationResult {
  /** 总样本数 */
  totalSamples: number
  /** 平均提升 */
  averageImprovement: number
  /** 通过率 */
  passRate: number
  /** 详细结果 */
  results: ComparisonResult[]
  /** 统计数据 */
  statistics: {
    meanImprovement: number
    medianImprovement: number
    stdDeviation: number
    minImprovement: number
    maxImprovement: number
    categoryBreakdown: Record<ProductCategory, { avgImprovement: number; count: number }>
    styleBreakdown: Record<StyleType, { avgImprovement: number; count: number }>
  }
  /** 目标达成情况 */
  goalStatus: {
    targetImprovement: number    // 目标提升 40%
    achieved: boolean
    actualImprovement: number
  }
}

export interface EvaluationConfig {
  /** LLM 模型 */
  model?: string
  /** 提升阈值 (%) */
  improvementThreshold?: number
  /** 质量阈值 (1-10) */
  qualityThreshold?: number
  /** 批量评估样本数 */
  batchSize?: number
  /** 是否包含详细反馈 */
  includeFeedback?: boolean
}

// ==================== 评估指标定义 ====================

const EVALUATION_CRITERIA = {
  professionalism: {
    name: '专业度',
    description: '产品摄影术语使用是否专业，描述是否符合行业标准',
    weight: 0.25
  },
  detail: {
    name: '细节描述',
    description: '对材质、灯光、背景、角度等细节描述的完整程度',
    weight: 0.20
  },
  creativity: {
    name: '创意性',
    description: '风格搭配和视觉呈现的独特性和吸引力',
    weight: 0.15
  },
  ecommerce: {
    name: '电商适配度',
    description: '是否适合电商平台展示，能否吸引目标用户',
    weight: 0.20
  },
  generation: {
    name: '3D生成友好度',
    description: '提示词是否清晰明确，能否被AI正确理解和生成',
    weight: 0.20
  }
}

// ==================== LLM 评估函数 ====================

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

/**
 * 使用 LLM 评估提示词质量
 */
async function evaluateWithLLM(
  prompt: string,
  context: {
    originalInput?: string
    category?: ProductCategory
    style?: StyleType
    platform?: PlatformType
  } = {}
): Promise<EvaluationMetrics> {
  if (!DASHSCOPE_API_KEY) {
    console.warn('[Evaluate] DASHSCOPE_API_KEY not set, using heuristic scoring')
    return heuristicEvaluation(prompt, context)
  }

  const systemPrompt = `你是一个专业的电商产品摄影提示词评估专家。你需要评估给定的提示词质量，从以下五个维度打分（1-10分）：

1. 专业度 (professionalism): 产品摄影术语使用是否专业，描述是否符合行业标准
2. 细节描述 (detail): 对材质、灯光、背景、角度等细节描述的完整程度
3. 创意性 (creativity): 风格搭配和视觉呈现的独特性和吸引力
4. 电商适配度 (ecommerce): 是否适合电商平台展示，能否吸引目标用户
5. 3D生成友好度 (generation): 提示词是否清晰明确，能否被AI正确理解和生成

请返回 JSON 格式的评估结果。`

  const userPrompt = `请评估以下提示词的质量：

提示词：
${prompt}

${context.originalInput ? `原始输入：${context.originalInput}` : ''}
${context.category ? `商品类别：${context.category}` : ''}
${context.style ? `风格：${context.style}` : ''}
${context.platform ? `平台：${context.platform}` : ''}

请返回以下 JSON 格式：
{
  "overallScore": number,
  "professionalismScore": number,
  "detailScore": number,
  "creativityScore": number,
  "ecommerceScore": number,
  "generationScore": number,
  "feedback": "string - 详细评价",
  "suggestions": ["string - 改进建议1", "string - 改进建议2"]
}`

  try {
    const response = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    })

    if (!response.ok) {
      console.error('[Evaluate] LLM API error:', response.status)
      return heuristicEvaluation(prompt, context)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return heuristicEvaluation(prompt, context)
    }

    const result = JSON.parse(content)

    return {
      overallScore: clampScore(result.overallScore || 7),
      professionalismScore: clampScore(result.professionalismScore || 7),
      detailScore: clampScore(result.detailScore || 7),
      creativityScore: clampScore(result.creativityScore || 7),
      ecommerceScore: clampScore(result.ecommerceScore || 7),
      generationScore: clampScore(result.generationScore || 7),
      feedback: result.feedback || 'LLM 评估完成',
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('[Evaluate] LLM evaluation failed:', error)
    return heuristicEvaluation(prompt, context)
  }
}

/**
 * 基于规则的启发式评估（降级方案）
 */
function heuristicEvaluation(
  prompt: string,
  context: {
    originalInput?: string
    category?: ProductCategory
    style?: StyleType
    platform?: PlatformType
  } = {}
): EvaluationMetrics {
  const words = prompt.toLowerCase().split(/\s+/)
  const wordCount = words.length

  // 专业术语列表
  const professionalTerms = [
    'photography', 'lighting', 'studio', 'rendering', 'composition',
    'diffused', 'ambient', 'specular', 'reflection', 'shadow',
    'texture', 'material', 'gradient', 'high-key', 'low-key',
    'product', 'commercial', 'professional', 'quality', 'resolution'
  ]

  // 细节关键词
  const detailKeywords = [
    'lighting', 'background', 'angle', 'camera', 'shadow',
    'reflection', 'texture', 'material', 'color', 'surface',
    'environment', 'ambient', 'diffused', 'dramatic', 'soft'
  ]

  // 计算各维度分数
  const professionalMatches = professionalTerms.filter(t => prompt.toLowerCase().includes(t))
  const professionalismScore = clampScore(5 + professionalMatches.length * 0.5)

  const detailMatches = detailKeywords.filter(t => prompt.toLowerCase().includes(t))
  const detailScore = clampScore(4 + detailMatches.length * 0.6)

  // 创意性基于风格和组合
  const hasStyle = context.style && context.style !== 'minimal'
  const creativityScore = clampScore(hasStyle ? 7 : 6)

  // 电商适配度基于平台
  const hasPlatform = context.platform !== undefined
  const ecommerceScore = clampScore(hasPlatform ? 8 : 6)

  // 3D 生成友好度基于提示词长度和清晰度
  const hasGoodLength = wordCount >= 20 && wordCount <= 100
  const generationScore = clampScore(hasGoodLength ? 8 : 6)

  // 计算整体分数
  const overallScore = (
    professionalismScore * EVALUATION_CRITERIA.professionalism.weight +
    detailScore * EVALUATION_CRITERIA.detail.weight +
    creativityScore * EVALUATION_CRITERIA.creativity.weight +
    ecommerceScore * EVALUATION_CRITERIA.ecommerce.weight +
    generationScore * EVALUATION_CRITERIA.generation.weight
  )

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    professionalismScore,
    detailScore,
    creativityScore,
    ecommerceScore,
    generationScore,
    feedback: `启发式评估：提示词包含 ${wordCount} 个单词，${professionalMatches.length} 个专业术语，${detailMatches.length} 个细节关键词。`,
    suggestions: generateHeuristicSuggestions(prompt, professionalMatches, detailMatches)
  }
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10))
}

function generateHeuristicSuggestions(
  prompt: string,
  professionalMatches: string[],
  detailMatches: string[]
): string[] {
  const suggestions: string[] = []

  if (professionalMatches.length < 3) {
    suggestions.push('可以添加更多专业摄影术语，如 lighting、composition、texture 等')
  }

  if (detailMatches.length < 4) {
    suggestions.push('建议增加灯光、背景、角度等细节描述')
  }

  if (prompt.length < 100) {
    suggestions.push('提示词可以更详细，建议添加更多描述性内容')
  }

  if (prompt.length > 500) {
    suggestions.push('提示词可能过长，建议精简重点内容')
  }

  return suggestions
}

// ==================== 对比评估 ====================

/**
 * 对比原始提示词和优化后提示词
 */
export async function comparePrompts(
  original: string,
  optimized: string,
  context: {
    originalInput?: string
    category?: ProductCategory
    style?: StyleType
    platform?: PlatformType
  } = {}
): Promise<ComparisonResult> {
  // 并行评估两个提示词
  const [originalMetrics, optimizedMetrics] = await Promise.all([
    evaluateWithLLM(original, context),
    evaluateWithLLM(optimized, context)
  ])

  // 计算提升百分比
  const improvement = {
    overall: calculateImprovement(originalMetrics.overallScore, optimizedMetrics.overallScore),
    professionalism: calculateImprovement(originalMetrics.professionalismScore, optimizedMetrics.professionalismScore),
    detail: calculateImprovement(originalMetrics.detailScore, optimizedMetrics.detailScore),
    creativity: calculateImprovement(originalMetrics.creativityScore, optimizedMetrics.creativityScore),
    ecommerce: calculateImprovement(originalMetrics.ecommerceScore, optimizedMetrics.ecommerceScore),
    generation: calculateImprovement(originalMetrics.generationScore, optimizedMetrics.generationScore)
  }

  // 判断是否通过阈值（默认 40%）
  const passed = improvement.overall >= 40

  // 生成摘要
  const summary = generateComparisonSummary(originalMetrics, optimizedMetrics, improvement)

  return {
    original,
    optimized,
    originalMetrics,
    optimizedMetrics,
    improvement,
    passed,
    summary
  }
}

function calculateImprovement(original: number, optimized: number): number {
  if (original === 0) return optimized * 10 // 如果原始为 0，视为 100% 提升
  return Math.round(((optimized - original) / original) * 100)
}

function generateComparisonSummary(
  original: EvaluationMetrics,
  optimized: EvaluationMetrics,
  improvement: ComparisonResult['improvement']
): string {
  const improvements: string[] = []

  if (improvement.overall > 0) {
    improvements.push(`整体质量提升 ${improvement.overall}%`)
  }

  if (improvement.professionalism > 10) {
    improvements.push(`专业度提升 ${improvement.professionalism}%`)
  }

  if (improvement.detail > 10) {
    improvements.push(`细节描述提升 ${improvement.detail}%`)
  }

  if (improvements.length === 0) {
    return '优化效果不明显，建议调整优化策略'
  }

  return improvements.join('，')
}

// ==================== 批量评估 ====================

/**
 * 批量评估训练样本
 */
export async function batchEvaluate(
  samples?: TrainingSample[],
  config: EvaluationConfig = {}
): Promise<BatchEvaluationResult> {
  const {
    batchSize = 50,
    improvementThreshold = 40
  } = config

  // 获取样本
  const evaluationSamples = samples || getTrainingSamples(batchSize)

  console.log(`[Evaluate] Starting batch evaluation of ${evaluationSamples.length} samples`)

  const results: ComparisonResult[] = []
  const categoryBreakdown: Record<ProductCategory, { totalImprovement: number; count: number }> = {} as any
  const styleBreakdown: Record<StyleType, { totalImprovement: number; count: number }> = {} as any

  // 逐个评估
  for (const sample of evaluationSamples) {
    // 构造原始提示词（简单的中文描述）
    const original = `${sample.input}`

    // 使用优化后的提示词
    const optimized = sample.output

    // 执行对比评估
    const result = await comparePrompts(original, optimized, {
      originalInput: sample.input,
      category: sample.category,
      style: sample.style,
      platform: sample.platform
    })

    results.push(result)

    // 统计分类数据
    if (!categoryBreakdown[sample.category]) {
      categoryBreakdown[sample.category] = { totalImprovement: 0, count: 0 }
    }
    categoryBreakdown[sample.category].totalImprovement += result.improvement.overall
    categoryBreakdown[sample.category].count++

    if (!styleBreakdown[sample.style]) {
      styleBreakdown[sample.style] = { totalImprovement: 0, count: 0 }
    }
    styleBreakdown[sample.style].totalImprovement += result.improvement.overall
    styleBreakdown[sample.style].count++
  }

  // 计算统计数据
  const improvements = results.map(r => r.improvement.overall)
  const sortedImprovements = [...improvements].sort((a, b) => a - b)

  const meanImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length
  const medianImprovement = sortedImprovements[Math.floor(sortedImprovements.length / 2)]
  const variance = improvements.reduce((sum, val) => sum + Math.pow(val - meanImprovement, 2), 0) / improvements.length
  const stdDeviation = Math.sqrt(variance)

  const passCount = results.filter(r => r.passed).length
  const passRate = (passCount / results.length) * 100

  // 格式化分类统计
  const formattedCategoryBreakdown = Object.fromEntries(
    Object.entries(categoryBreakdown).map(([cat, data]) => [
      cat,
      { avgImprovement: Math.round(data.totalImprovement / data.count), count: data.count }
    ])
  ) as Record<ProductCategory, { avgImprovement: number; count: number }>

  const formattedStyleBreakdown = Object.fromEntries(
    Object.entries(styleBreakdown).map(([style, data]) => [
      style,
      { avgImprovement: Math.round(data.totalImprovement / data.count), count: data.count }
    ])
  ) as Record<StyleType, { avgImprovement: number; count: number }>

  // 判断目标达成
  const goalStatus = {
    targetImprovement: improvementThreshold,
    achieved: meanImprovement >= improvementThreshold,
    actualImprovement: Math.round(meanImprovement)
  }

  console.log(`[Evaluate] Batch evaluation complete. Average improvement: ${meanImprovement.toFixed(1)}%`)

  return {
    totalSamples: results.length,
    averageImprovement: Math.round(meanImprovement),
    passRate: Math.round(passRate),
    results,
    statistics: {
      meanImprovement: Math.round(meanImprovement),
      medianImprovement: Math.round(medianImprovement),
      stdDeviation: Math.round(stdDeviation),
      minImprovement: Math.min(...improvements),
      maxImprovement: Math.max(...improvements),
      categoryBreakdown: formattedCategoryBreakdown,
      styleBreakdown: formattedStyleBreakdown
    },
    goalStatus
  }
}

// ==================== 单次评估函数 ====================

/**
 * 评估单个优化结果
 */
export async function evaluateOptimization(
  originalInput: string,
  optimizationResult: OptimizationResult
): Promise<ComparisonResult> {
  return comparePrompts(
    originalInput,
    optimizationResult.prompt,
    {
      originalInput,
      category: optimizationResult.category,
      style: optimizationResult.style,
      platform: optimizationResult.platform
    }
  )
}

/**
 * 快速质量评估（不调用 LLM）
 */
export function quickEvaluate(prompt: string): EvaluationMetrics {
  return heuristicEvaluation(prompt)
}

// ==================== 导出 ====================

export {
  EVALUATION_CRITERIA,
  evaluateWithLLM,
  heuristicEvaluation
}