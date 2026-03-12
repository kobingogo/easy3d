/**
 * 商品分析工具
 * 使用视觉模型分析商品图片，或基于文本描述生成分析结果
 */

import type { Tool, ProductAnalysis, ToolContext, ToolResult } from '../types'
import { vision, generate } from '../llm'

const ANALYZE_PROMPT = `你是一个电商产品分析专家。请分析这张商品图片，返回以下信息：

1. 商品类别：从 [clothing, shoes, beauty, electronics, home, jewelry, food, bags, accessories, other] 中选择
2. 子类别：具体的商品类型（如：口红、运动鞋、手机壳）
3. 风格标签：如 [简约, 潮流, 商务, 可爱, 复古] 等，返回 2-4 个
4. 主色调：识别 2-3 个主要颜色
5. 材质：如 [皮革, 金属, 塑料, 棉麻, 玻璃] 等
6. 目标用户：如 [年轻女性, 商务人士, 学生] 等
7. 价格定位：budget(平价) / mid(中端) / premium(高端) / luxury(奢侈)
8. 关键词：5-8 个描述关键词
9. 推荐风格：minimal(极简) / luxury(奢华) / tech(科技) / natural(自然) / trendy(潮流)
10. 置信度：0-1 之间的数字

请严格以 JSON 格式返回结果，不要包含其他内容。格式示例：
{
  "category": "beauty",
  "subcategory": "口红",
  "style": ["简约", "优雅"],
  "colors": ["红色", "金色"],
  "materials": ["金属", "塑料"],
  "targetAudience": "年轻女性",
  "priceRange": "premium",
  "keywords": ["口红", "彩妆", "奢华", "红管"],
  "confidence": 0.92,
  "suggestedStyle": "luxury"
}`

const TEXT_ANALYZE_PROMPT = `你是一个电商产品分析专家。请根据用户描述，推断商品的属性特征：

用户描述：{description}

请返回以下信息（JSON格式）：
{
  "category": "商品类别：clothing/shoes/beauty/electronics/home/jewelry/food/bags/accessories/other",
  "subcategory": "具体商品类型",
  "style": ["风格标签2-4个"],
  "colors": ["主色调2-3个"],
  "materials": ["材质"],
  "targetAudience": "目标用户",
  "priceRange": "budget/mid/premium/luxury",
  "keywords": ["关键词5-8个"],
  "confidence": 0.7,
  "suggestedStyle": "minimal/luxury/tech/natural/trendy"
}`

export const analyzeProductTool: Tool<{ imageUrl?: string; description?: string }, ProductAnalysis> = {
  type: 'function',
  function: {
    name: 'analyze_product',
    description: '分析商品图片或描述，识别类别、风格、颜色、材质等属性，为后续3D展示优化提供基础',
    parameters: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: '商品图片 URL（可选）'
        },
        description: {
          type: 'string',
          description: '商品描述文字（可选，当没有图片时使用）'
        }
      }
    }
  },

  config: {
    timeout: 30000,
    retryable: true,
    maxRetries: 2
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()
    const { imageUrl, description } = input

    console.log('[analyze_product] input:', JSON.stringify({ imageUrl, description }))

    try {
      let analysis: ProductAnalysis

      // 验证是否为有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (trimmed === '') return false
        // 必须是 http/https 开头的有效 URL
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        // 不能是占位符文本
        if (trimmed.includes('用户') || trimmed.includes('提供') || trimmed.includes('图片URL')) return false
        return true
      }

      // 有有效图片 URL 则使用视觉分析
      if (isValidImageUrl(imageUrl)) {
        console.log('[analyze_product] 使用视觉分析，URL:', imageUrl)
        const result = await vision({
          model: 'qwen3.5-plus',
          imageUrls: [imageUrl!],
          prompt: ANALYZE_PROMPT
        })

        analysis = parseAnalysisResponse(result.content)

        context.tracer.endStepSuccess(context.stepId, analysis, {
          tokensUsed: result.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        })

        return {
          success: true,
          data: analysis,
          metadata: {
            duration: Date.now() - startTime,
            tokensUsed: result.usage.totalTokens,
            modelUsed: 'qwen3.5-plus'
          }
        }
      }

      // 没有有效图片，使用文本描述分析
      const textDescription = description || ''
      if (textDescription.trim() !== '') {
        console.log('[analyze_product] 使用文本分析，描述:', textDescription)
        const result = await generate({
          model: 'qwen3.5-plus',
          messages: [{
            role: 'user',
            content: TEXT_ANALYZE_PROMPT.replace('{description}', textDescription)
          }],
          responseFormat: { type: 'json_object' }
        })

        analysis = parseAnalysisResponse(result.content)
        analysis.confidence = 0.7  // 文本分析置信度稍低

        context.tracer.endStepSuccess(context.stepId, analysis, {
          tokensUsed: result.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        })

        return {
          success: true,
          data: analysis,
          metadata: {
            duration: Date.now() - startTime,
            tokensUsed: result.usage.totalTokens,
            modelUsed: 'qwen3.5-plus'
          }
        }
      }

      // 既没有图片也没有描述，返回默认分析
      console.log('[analyze_product] 无图片和描述，返回默认分析')
      analysis = {
        category: 'other',
        subcategory: '通用商品',
        style: ['简约'],
        colors: [],
        materials: [],
        targetAudience: '通用',
        priceRange: 'mid',
        keywords: ['商品', '展示'],
        confidence: 0.5,
        suggestedStyle: 'minimal'
      }

      context.tracer.endStepSuccess(context.stepId, analysis)

      return {
        success: true,
        data: analysis,
        metadata: {
          duration: Date.now() - startTime
        }
      }

    } catch (error: any) {
      console.error('[analyze_product] 错误:', error.message)
      context.tracer.endStepFailed(context.stepId, error.message)

      return {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message,
          recoverable: true
        }
      }
    }
  }
}

/**
 * 解析分析响应
 */
function parseAnalysisResponse(content: string): ProductAnalysis {
  try {
    // 尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        category: parsed.category || 'other',
        subcategory: parsed.subcategory || '未知商品',
        style: parsed.style || [],
        colors: parsed.colors || [],
        materials: parsed.materials || [],
        targetAudience: parsed.targetAudience || '通用',
        priceRange: parsed.priceRange || 'mid',
        keywords: parsed.keywords || [],
        confidence: parsed.confidence || 0.8,
        suggestedStyle: parsed.suggestedStyle || 'minimal'
      }
    }
  } catch (e) {
    console.error('Failed to parse analysis response:', e)
  }

  // 返回默认值
  return {
    category: 'other',
    subcategory: '未知商品',
    style: ['简约'],
    colors: [],
    materials: [],
    targetAudience: '通用',
    priceRange: 'mid',
    keywords: [],
    confidence: 0.5,
    suggestedStyle: 'minimal'
  }
}