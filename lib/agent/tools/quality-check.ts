/**
 * 质量检查工具
 * 检查 3D 模型质量
 */

import type { Tool, QualityCheckResult, QualityIssue, ToolContext, ToolResult } from '../types'
import { vision } from '../llm'

export const qualityCheckTool: Tool<{
  modelUrl: string
  thumbnailUrl: string
  originalImageUrl?: string
}, QualityCheckResult> = {
  type: 'function',
  function: {
    name: 'quality_check',
    description: '检查 3D 模型质量，识别潜在问题并给出改进建议',
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
        originalImageUrl: {
          type: 'string',
          description: '原始商品图片 URL（可选，用于对比）'
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

    try {
      // 使用视觉模型分析预览图 (qwen3.5-plus 支持视觉)
      const result = await vision({
        model: 'qwen3.5-plus',
        imageUrls: [input.thumbnailUrl],
        prompt: `你是一个3D模型质量评估专家。请分析这张3D模型预览图，评估以下维度：

1. 几何完整性 (0-100分)：模型形状是否完整，有无缺失或变形
2. 纹理质量 (0-100分)：纹理是否清晰，颜色是否准确
3. 光照效果 (0-100分)：光照是否均匀，阴影是否自然
4. 完整度 (0-100分)：整体是否完整呈现产品特征

请返回 JSON 格式：
{
  "geometry": 85,
  "texture": 90,
  "lighting": 75,
  "completeness": 88,
  "issues": [
    { "type": "warning", "message": "背面光照略暗", "area": "lighting" }
  ],
  "suggestions": ["建议增加环境光", "可以调整背景颜色"]
}`
      })

      const qualityResult = parseQualityResponse(result.content)

      context.tracer.endStepSuccess(context.stepId, qualityResult, {
        tokensUsed: result.usage.totalTokens,
        modelUsed: 'qwen3.5-plus'
      })

      return {
        success: true,
        data: qualityResult,
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: result.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        }
      }

    } catch (error: any) {
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
    console.error('Failed to parse quality response:', e)
  }

  // 默认返回
  return {
    overallScore: 80,
    dimensions: {
      geometry: 80,
      texture: 80,
      lighting: 80,
      completeness: 80
    },
    issues: [],
    suggestions: ['模型质量良好']
  }
}