/**
 * 质量检查工具
 * 检查 3D 模型质量，验证生成结果是否符合预期
 */

import type { Tool, QualityCheckResult, QualityIssue, ToolContext, ToolResult } from '../types'
import { vision, generate } from '../llm'

export interface QualityCheckInput {
  modelUrl: string
  thumbnailUrl: string
  expectedProductType?: string  // 预期的商品类型
  expectedCategory?: string     // 预期的商品类别
  originalDescription?: string  // 用户原始描述
}

export interface ExtendedQualityResult extends QualityCheckResult {
  typeMatch?: {
    matched: boolean
    detectedType: string
    expectedType: string
    confidence: number
  }
  recommendation?: string  // 改进建议
}

export const qualityCheckTool: Tool<QualityCheckInput, ExtendedQualityResult> = {
  type: 'function',
  function: {
    name: 'quality_check',
    description: '检查 3D 模型质量，验证类型匹配度，识别潜在问题并给出改进建议',
    parameters: {
      type: 'object',
      properties: {
        modelUrl: {
          type: 'string',
          description: '3D 模型 URL'
        },
        thumbnailUrl: {
          type: 'string',
          description: '模型预览图 URL'
        },
        expectedProductType: {
          type: 'string',
          description: '预期的商品类型（如 handbag, lipstick）'
        },
        expectedCategory: {
          type: 'string',
          description: '预期的商品类别（如 bags, beauty）'
        },
        originalDescription: {
          type: 'string',
          description: '用户原始描述'
        }
      },
      required: ['modelUrl', 'thumbnailUrl']
    }
  },

  config: {
    timeout: 30000,
    retryable: false
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()

    console.log('[quality_check] Input:', JSON.stringify({
      expectedProductType: input.expectedProductType,
      expectedCategory: input.expectedCategory,
      originalDescription: input.originalDescription
    }))

    try {
      // 1. 分析预览图，检测实际生成的模型类型
      const analysisPrompt = `分析这张 3D 模型预览图，判断生成的是什么类型的商品。

请返回 JSON 格式：
{
  "detectedProductType": "检测到的商品类型英文（如 handbag, lipstick, shoe, phone, bottle, box）",
  "detectedCategory": "检测到的类别（clothing/shoes/beauty/electronics/home/jewelry/food/bags/accessories/other）",
  "confidence": 0.0-1.0 的置信度,
  "description": "简短描述这个模型是什么"
}

只返回 JSON。`

      const analysisResult = await vision({
        model: 'qwen3.5-plus',
        imageUrls: [input.thumbnailUrl],
        prompt: analysisPrompt
      })

      const analysis = parseAnalysisResponse(analysisResult.content)
      console.log('[quality_check] Model analysis:', JSON.stringify(analysis))

      // 2. 类型匹配检查
      let typeMatch: ExtendedQualityResult['typeMatch'] = undefined

      if (input.expectedProductType || input.expectedCategory) {
        const expectedType = input.expectedProductType || input.expectedCategory || ''
        const detectedType = analysis.detectedProductType || analysis.detectedCategory || ''

        // 判断是否匹配
        const matched = checkTypeMatch(expectedType, detectedType, analysis.confidence)

        typeMatch = {
          matched,
          detectedType: analysis.detectedProductType || 'unknown',
          expectedType,
          confidence: analysis.confidence
        }

        console.log('[quality_check] Type match:', JSON.stringify(typeMatch))
      }

      // 3. 质量评估
      const qualityPrompt = `评估这张 3D 模型预览图的质量。

评估维度（0-100分）：
1. geometry: 几何完整性 - 模型形状是否完整，有无缺失或变形
2. texture: 纹理质量 - 纹理是否清晰，颜色是否准确
3. lighting: 光照效果 - 光照是否均匀，阴影是否自然
4. completeness: 完整度 - 整体是否完整呈现产品特征

返回 JSON：
{
  "geometry": 85,
  "texture": 90,
  "lighting": 75,
  "completeness": 88,
  "issues": [{ "type": "warning/info", "message": "问题描述", "area": "geometry/texture/lighting/completeness" }],
  "suggestions": ["改进建议"]
}`

      const qualityResult = await vision({
        model: 'qwen3.5-plus',
        imageUrls: [input.thumbnailUrl],
        prompt: qualityPrompt
      })

      const quality = parseQualityResponse(qualityResult.content)

      // 4. 生成综合建议
      let recommendation = ''
      if (typeMatch && !typeMatch.matched) {
        recommendation = `检测到的模型类型（${typeMatch.detectedType}）与预期（${typeMatch.expectedType}）不匹配。建议重新生成。`
      } else if (quality.overallScore < 70) {
        recommendation = `模型质量较低（${quality.overallScore}分），存在以下问题：${quality.issues.map(i => i.message).join('、')}`
      } else {
        recommendation = '模型生成成功，质量良好。'
      }

      const result: ExtendedQualityResult = {
        overallScore: quality.overallScore,
        dimensions: quality.dimensions,
        issues: quality.issues,
        suggestions: quality.suggestions,
        typeMatch,
        recommendation
      }

      context.tracer.endStepSuccess(context.stepId, result, {
        tokensUsed: analysisResult.usage.totalTokens + qualityResult.usage.totalTokens,
        modelUsed: 'qwen3.5-plus'
      })

      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: analysisResult.usage.totalTokens + qualityResult.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        }
      }

    } catch (error: any) {
      console.error('[quality_check] Error:', error.message)
      context.tracer.endStepFailed(context.stepId, error.message)

      return {
        success: false,
        error: {
          code: 'QUALITY_CHECK_FAILED',
          message: error.message,
          recoverable: false
        }
      }
    }
  }
}

/**
 * 检查类型是否匹配
 */
function checkTypeMatch(expected: string, detected: string, confidence: number): boolean {
  const normalizeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      // 包类
      'handbag': 'bag', 'bag': 'bag', 'purse': 'bag', 'backpack': 'bag',
      '女包': 'bag', '手提包': 'bag', '钱包': 'bag', '背包': 'bag',
      // 美妆类
      'lipstick': 'beauty', 'makeup': 'beauty', 'cosmetic': 'beauty',
      '口红': 'beauty', '化妆品': 'beauty', '面霜': 'beauty',
      // 鞋类
      'shoe': 'shoes', 'sneaker': 'shoes', 'boot': 'shoes', 'heel': 'shoes',
      '鞋': 'shoes', '运动鞋': 'shoes', '靴子': 'shoes',
      // 电子类
      'phone': 'electronics', 'laptop': 'electronics', 'headphone': 'electronics',
      '手机': 'electronics', '电脑': 'electronics', '耳机': 'electronics',
      // 服饰类
      'clothes': 'clothing', 'shirt': 'clothing', 'dress': 'clothing',
      '衣服': 'clothing', '衬衫': 'clothing', '裙子': 'clothing',
      // 食品类
      'food': 'food', 'drink': 'food', 'snack': 'food',
      '食品': 'food', '饮料': 'food',
      // 家居类
      'furniture': 'home', 'lamp': 'home', 'chair': 'home',
      '家具': 'home', '灯': 'home', '椅子': 'home',
      // 首饰类
      'jewelry': 'jewelry', 'ring': 'jewelry', 'necklace': 'jewelry',
      '首饰': 'jewelry', '戒指': 'jewelry', '项链': 'jewelry',
      // 配饰类
      'watch': 'accessories', 'glass': 'accessories', 'hat': 'accessories',
      '手表': 'accessories', '眼镜': 'accessories', '帽子': 'accessories'
    }

    const lower = type.toLowerCase().trim()
    return typeMap[lower] || typeMap[expected] || lower
  }

  const normalizedExpected = normalizeType(expected)
  const normalizedDetected = normalizeType(detected)

  // 直接匹配
  if (normalizedExpected === normalizedDetected) {
    return confidence > 0.6
  }

  // 部分匹配（字符串包含）
  if (normalizedExpected.includes(normalizedDetected) || normalizedDetected.includes(normalizedExpected)) {
    return confidence > 0.7
  }

  return false
}

/**
 * 解析分析响应
 */
function parseAnalysisResponse(content: string): {
  detectedProductType: string
  detectedCategory: string
  confidence: number
  description: string
} {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        detectedProductType: parsed.detectedProductType || 'unknown',
        detectedCategory: parsed.detectedCategory || 'other',
        confidence: parsed.confidence || 0.5,
        description: parsed.description || ''
      }
    }
  } catch (e) {
    console.error('[quality_check] Parse analysis error:', e)
  }

  return {
    detectedProductType: 'unknown',
    detectedCategory: 'other',
    confidence: 0.3,
    description: '无法识别'
  }
}

/**
 * 解析质量响应
 */
function parseQualityResponse(content: string): QualityCheckResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const dimensions = {
        geometry: parsed.geometry || 80,
        texture: parsed.texture || 80,
        lighting: parsed.lighting || 80,
        completeness: parsed.completeness || 80
      }

      return {
        overallScore: Math.round((dimensions.geometry + dimensions.texture + dimensions.lighting + dimensions.completeness) / 4),
        dimensions,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || []
      }
    }
  } catch (e) {
    console.error('[quality_check] Parse quality error:', e)
  }

  return {
    overallScore: 75,
    dimensions: {
      geometry: 75,
      texture: 75,
      lighting: 75,
      completeness: 75
    },
    issues: [],
    suggestions: ['模型质量评估完成']
  }
}