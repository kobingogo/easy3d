/**
 * 商品分析工具
 * 使用视觉模型分析商品图片，或基于文本描述生成分析结果
 */

import type { Tool, ProductAnalysis, ToolContext, ToolResult } from '../types'
import { vision, generate } from '../llm'

const ANALYZE_PROMPT = `你是一个电商产品分析专家。请分析这张商品图片，返回以下信息：

1. 商品类别：从 [clothing, shoes, beauty, electronics, home, jewelry, food, bags, accessories, other] 中选择
2. 子类别：具体的商品类型（如：口红、运动鞋、手机壳、女包、钱包）
3. 风格标签：如 [简约, 潮流, 商务, 可爱, 复古, 奢华] 等，返回 2-4 个
4. 主色调：识别 2-3 个主要颜色
5. 材质：如 [皮革, 金属, 塑料, 棉麻, 玻璃] 等
6. 目标用户：如 [年轻女性, 商务人士, 学生] 等
7. 价格定位：budget(平价) / mid(中端) / premium(高端) / luxury(奢侈)
8. 关键词：5-8 个描述关键词（包含商品的中英文名称）
9. 推荐风格：minimal(极简) / luxury(奢华) / tech(科技) / natural(自然) / trendy(潮流)
10. 置信度：0-1 之间的数字

请严格以 JSON 格式返回结果，不要包含其他内容。格式示例：
{
  "category": "bags",
  "subcategory": "女包",
  "style": ["简约", "优雅"],
  "colors": ["黑色", "金色"],
  "materials": ["皮革", "金属"],
  "targetAudience": "年轻女性",
  "priceRange": "premium",
  "keywords": ["女包", "手提包", "女士", "皮革", "时尚"],
  "confidence": 0.92,
  "suggestedStyle": "luxury"
}`

const TEXT_ANALYZE_PROMPT = `你是一个电商产品分析专家。请分析以下用户需求描述，提取商品属性和展示需求。

用户描述：{description}

请返回 JSON 格式的分析结果，必须包含以下字段：
{
  "category": "商品类别，从 [clothing, shoes, beauty, electronics, home, jewelry, food, bags, accessories, other] 中选择最合适的一个",
  "subcategory": "具体的商品子类别名称（如：女包、口红、运动鞋），必须是中文",
  "style": ["风格标签数组，2-4个"],
  "colors": ["主色调数组，2-3个"],
  "materials": ["材质数组，1-3个"],
  "targetAudience": "目标用户",
  "priceRange": "budget/mid/premium/luxury",
  "keywords": ["关键词数组，5-8个，包含商品的中英文名称"],
  "confidence": 0.7,
  "suggestedStyle": "minimal/luxury/tech/natural/trendy",
  "platform": "目标平台（如果有提及），如 xiaohongshu/taobao/douyin/amazon，没有则为 null",
  "displayContext": "展示场景描述（如：适合小红书的种草风格、适合电商详情页），从描述中推断"
}

【重要分析要点】：
1. 准确识别商品类型（subcategory 是最重要的字段）
2. 提取平台信息（小红书/淘宝/抖音等）
3. 理解展示需求（种草/专业/生活化等）
4. keywords 必须包含商品的中文和英文名称

只返回 JSON，不要其他内容。`

export interface ExtendedProductAnalysis extends ProductAnalysis {
  platform?: 'xiaohongshu' | 'taobao' | 'douyin' | 'amazon' | null
  displayContext?: string
}

export const analyzeProductTool: Tool<{ imageUrl?: string; description?: string }, ExtendedProductAnalysis> = {
  type: 'function',
  function: {
    name: 'analyze_product',
    description: '分析商品图片或描述，识别类别、风格、颜色、材质、目标平台等属性，为后续3D展示优化提供基础',
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
      let analysis: ExtendedProductAnalysis

      // 验证是否为有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (trimmed === '') return false
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        if (trimmed.includes('用户') || trimmed.includes('提供') || trimmed.includes('图片URL')) return false
        return true
      }

      // 有有效图片 URL 则尝试视觉分析
      if (isValidImageUrl(imageUrl)) {
        console.log('[analyze_product] 尝试视觉分析，URL:', imageUrl)

        try {
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
        } catch (visionError: any) {
          // 视觉分析失败，降级到文本分析
          console.log('[analyze_product] 视觉分析失败，降级到文本分析:', visionError.message)

          // 如果有描述，使用文本分析
          if (description && description.trim()) {
            console.log('[analyze_product] 使用文本描述分析')
            const result = await generate({
              model: 'qwen3.5-plus',
              messages: [{
                role: 'user',
                content: TEXT_ANALYZE_PROMPT.replace('{description}', description)
              }],
              responseFormat: { type: 'json_object' }
            })

            analysis = parseAnalysisResponse(result.content)
            analysis.confidence = 0.65  // 降级分析，置信度稍低

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
                modelUsed: 'qwen3.5-plus',
                fallback: true
              }
            }
          }

          // 没有描述，重新抛出错误
          throw visionError
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

        console.log('[analyze_product] LLM response:', result.content.slice(0, 500))
        analysis = parseAnalysisResponse(result.content)
        analysis.confidence = 0.7

        console.log('[analyze_product] Parsed analysis:', JSON.stringify(analysis))

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
        subcategory: '商品',
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
function parseAnalysisResponse(content: string): ExtendedProductAnalysis {
  try {
    // 尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      // 解析平台信息
      let platform: ExtendedProductAnalysis['platform'] = null
      if (parsed.platform) {
        const platformMap: Record<string, ExtendedProductAnalysis['platform']> = {
          '小红书': 'xiaohongshu',
          'xiaohongshu': 'xiaohongshu',
          '淘宝': 'taobao',
          'taobao': 'taobao',
          '抖音': 'douyin',
          'douyin': 'douyin',
          'amazon': 'amazon',
          '亚马逊': 'amazon'
        }
        platform = platformMap[parsed.platform.toLowerCase()] || null
      }

      return {
        category: parsed.category || 'other',
        subcategory: parsed.subcategory || '商品',
        style: Array.isArray(parsed.style) ? parsed.style : [],
        colors: Array.isArray(parsed.colors) ? parsed.colors : [],
        materials: Array.isArray(parsed.materials) ? parsed.materials : [],
        targetAudience: parsed.targetAudience || '通用',
        priceRange: parsed.priceRange || 'mid',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
        suggestedStyle: parsed.suggestedStyle || 'minimal',
        platform,
        displayContext: parsed.displayContext
      }
    }
  } catch (e) {
    console.error('Failed to parse analysis response:', e, 'Content:', content.slice(0, 200))
  }

  // 返回默认值
  return {
    category: 'other',
    subcategory: '商品',
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