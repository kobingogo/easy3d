/**
 * 文案生成工具
 * 为不同平台生成电商文案
 */

import type { Tool, ToolContext, ToolResult } from '../types'
import { generate } from '../llm'

export type Platform = 'xiaohongshu' | 'taobao' | 'douyin'

export interface CopywritingInput {
  productDescription: string
  platform: Platform
  style?: 'casual' | 'professional' | 'trendy'
  productAnalysis?: {
    category?: string
    subcategory?: string
    keywords?: string[]
    style?: string[]
  }
}

export interface CopywritingResult {
  title: string
  content: string
  tags: string[]
  platform: Platform
  style: string
}

const PLATFORM_PROMPTS: Record<Platform, string> = {
  xiaohongshu: `你是一个小红书种草文案专家。请为以下商品生成种草风格的文案。

要求：
1. 标题：吸引眼球，可用emoji，15-25字
2. 正文：
   - 开头用场景代入或疑问句吸引注意
   - 分点描述产品卖点（用emoji分隔）
   - 结尾引导互动（点赞收藏评论）
   - 适当使用emoji增加亲和力
   - 控制在300-500字
3. 标签：5-8个相关话题标签，格式为 #标签名

风格要点：
- 像朋友推荐一样自然
- 突出使用体验和感受
- 避免硬广感
- 可适当加入"姐妹们""真的绝了""冲"等网络用语`,

  taobao: `你是一个淘宝商品文案专家。请为以下商品生成电商详情页文案。

要求：
1. 标题：简洁专业，突出核心卖点，20-30字
2. 正文：
   - 第一段：产品简介和核心卖点（50字内）
   - 第二段：详细功能特点（分点描述）
   - 第三段：适用场景和人群
   - 结尾：促销信息或服务承诺
   - 控制在200-400字
3. 标签：3-5个搜索关键词，用空格分隔

风格要点：
- 专业可信
- 卖点清晰
- 突出性价比
- 引导下单`,

  douyin: `你是一个抖音短视频文案专家。请为以下商品生成短视频脚本文案。

要求：
1. 标题：吸睛开场，制造悬念，10-20字
2. 正文：
   - 开场白（0-3秒）：制造悬念或抛出痛点
   - 中间展示（3-15秒）：产品核心卖点展示
   - 结尾引导（15-20秒）：引导下单或关注
   - 控制在100-200字，适合口播
3. 标签：3-5个热门话题标签，格式为 #标签名

风格要点：
- 前3秒必须抓住眼球
- 口语化，适合朗读
- 节奏紧凑
- 适当使用网络热词`
}

export const generateCopyTool: Tool<CopywritingInput, CopywritingResult> = {
  type: 'function',
  function: {
    name: 'generate_copy',
    description: '根据商品信息和目标平台生成电商文案，支持小红书种草风格、淘宝详情页、抖音短视频脚本',
    parameters: {
      type: 'object',
      properties: {
        productDescription: {
          type: 'string',
          description: '商品描述信息'
        },
        platform: {
          type: 'string',
          enum: ['xiaohongshu', 'taobao', 'douyin'],
          description: '目标平台：小红书、淘宝、抖音'
        },
        style: {
          type: 'string',
          enum: ['casual', 'professional', 'trendy'],
          description: '文案风格：休闲、专业、潮流'
        },
        productAnalysis: {
          type: 'object',
          description: '商品分析结果（可选，用于增强文案针对性）',
          properties: {
            category: { type: 'string' },
            subcategory: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
            style: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['productDescription', 'platform']
    }
  },

  config: {
    timeout: 30000,
    retryable: true,
    maxRetries: 2
  },

  handler: async (input: CopywritingInput, context: ToolContext) => {
    const startTime = Date.now()
    const { productDescription, platform, style = 'casual', productAnalysis } = input

    console.log('[generate_copy] input:', JSON.stringify({ productDescription, platform, style }))

    try {
      const platformPrompt = PLATFORM_PROMPTS[platform]

      let enhancedDescription = productDescription
      if (productAnalysis) {
        enhancedDescription = `
商品描述：${productDescription}
商品类别：${productAnalysis.subcategory || '未知'}
商品风格：${productAnalysis.style?.join('、') || '未知'}
关键词：${productAnalysis.keywords?.join('、') || '未知'}
        `.trim()
      }

      const prompt = `${platformPrompt}

商品信息：
${enhancedDescription}

请以JSON格式返回结果：
{
  "title": "标题",
  "content": "正文内容",
  "tags": ["标签1", "标签2"],
  "platform": "${platform}",
  "style": "${style}"
}

只返回JSON，不要其他内容。`

      const result = await generate({
        model: 'qwen3.5-plus',
        messages: [{
          role: 'user',
          content: prompt
        }],
        responseFormat: { type: 'json_object' }
      })

      console.log('[generate_copy] LLM response:', result.content.slice(0, 500))

      const copyResult = parseCopyResponse(result.content, platform, style)

      context.tracer.endStepSuccess(context.stepId, copyResult, {
        tokensUsed: result.usage.totalTokens,
        modelUsed: 'qwen3.5-plus'
      })

      return {
        success: true,
        data: copyResult,
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: result.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        }
      }

    } catch (error: any) {
      console.error('[generate_copy] 错误:', error.message)
      context.tracer.endStepFailed(context.stepId, error.message)

      return {
        success: false,
        error: {
          code: 'COPY_GENERATION_FAILED',
          message: error.message,
          recoverable: true
        }
      }
    }
  }
}

/**
 * 解析文案响应
 */
function parseCopyResponse(content: string, platform: Platform, style: string): CopywritingResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || '商品推荐',
        content: parsed.content || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        platform,
        style: parsed.style || style
      }
    }
  } catch (e) {
    console.error('Failed to parse copy response:', e)
  }

  // 返回默认值
  return {
    title: '商品推荐',
    content: content.slice(0, 500),
    tags: [],
    platform,
    style
  }
}