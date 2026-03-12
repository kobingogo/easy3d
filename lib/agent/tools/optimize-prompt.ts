/**
 * 提示词优化工具
 * 基于 RAG 检索和商品分析，生成优化的 3D 生成提示词
 */

import type { Tool, OptimizedPrompt, ProductAnalysis, StyleTemplate, ToolContext, ToolResult } from '../types'
import { generate } from '../llm'
import { searchKnowledge } from '@/lib/rag/search'

// 提示词模板
const PROMPT_TEMPLATES: Record<StyleTemplate, string> = {
  minimal: `Professional product photography of {product}, clean white background, soft diffused lighting, minimal composition, focus on product details, 4K resolution, e-commerce ready`,

  luxury: `Luxury product showcase of {product}, elegant gradient background with soft pink tones, premium studio lighting with soft shadows, gold accents, 8K resolution, photorealistic, high-end commercial photography`,

  tech: `High-tech product render of {product}, futuristic dark background with blue LED accents, metallic reflective surface, dramatic lighting, 8K resolution, hyperrealistic, product visualization, tech showcase`,

  natural: `Natural product photography of {product}, soft natural daylight from window, organic background with green plants, wooden surface, lifestyle product shot, clean and fresh aesthetic, 4K resolution`,

  trendy: `Trendy product showcase of {product}, vibrant gradient background, dynamic angle, colorful lighting, modern aesthetic, social media ready, 4K resolution, eye-catching composition, Gen Z style`
}

// 风格描述映射
const STYLE_DESCRIPTIONS: Record<StyleTemplate, { lighting: string; background: string; camera: string }> = {
  minimal: {
    lighting: '柔和的漫射光，均匀照亮产品',
    background: '纯白或浅灰色背景，简洁干净',
    camera: '正面或45度角，突出产品轮廓'
  },
  luxury: {
    lighting: '精致的影棚灯光，营造高级感',
    background: '渐变背景，粉色或金色点缀',
    camera: '微距特写，展示细节质感'
  },
  tech: {
    lighting: '蓝色LED光效，科技感照明',
    background: '深色背景，金属质感反射',
    camera: '俯视或侧面，展示设计线条'
  },
  natural: {
    lighting: '自然窗光，柔和温暖',
    background: '木纹或绿植背景，自然氛围',
    camera: '生活化角度，展示使用场景'
  },
  trendy: {
    lighting: '彩色灯光，动感能量',
    background: '渐变色块，潮流元素',
    camera: '动态角度，吸引眼球'
  }
}

export const optimizePromptTool: Tool<{
  analysis: ProductAnalysis
  style?: StyleTemplate
  platform?: 'taobao' | 'xiaohongshu' | 'douyin' | 'amazon'
}, OptimizedPrompt> = {
  type: 'function',
  function: {
    name: 'optimize_prompt',
    description: '基于商品分析结果和RAG知识库，生成优化的3D展示提示词',
    parameters: {
      type: 'object',
      properties: {
        analysis: {
          type: 'object',
          description: '商品分析结果（来自 analyze_product）'
        },
        style: {
          type: 'string',
          enum: ['minimal', 'luxury', 'tech', 'natural', 'trendy'],
          description: '展示风格',
          default: 'minimal'
        },
        platform: {
          type: 'string',
          enum: ['taobao', 'xiaohongshu', 'douyin', 'amazon'],
          description: '目标平台'
        }
      },
      required: ['analysis']
    }
  },

  config: {
    timeout: 15000,
    retryable: true,
    maxRetries: 2
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()
    const { analysis, style = 'minimal', platform } = input

    try {
      // 1. RAG 检索相关知识（可选，失败时跳过）
      let knowledge: any[] = []
      try {
        knowledge = await searchKnowledge(
          `${analysis.subcategory} ${style} ${analysis.keywords.slice(0, 3).join(' ')}`,
          {
            limit: 3,
            enableRerank: true
          }
        )
      } catch (ragError: any) {
        console.log(`[optimize_prompt] RAG search failed: ${ragError.message}, continuing without RAG`)
      }

      // 2. 获取风格配置
      const styleConfig = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.minimal
      const template = PROMPT_TEMPLATES[style] || PROMPT_TEMPLATES.minimal

      // 3. 生成优化提示词
      const productDesc = `${analysis.subcategory} ${analysis.keywords.slice(0, 3).join(' ')}`

      const prompt = template
        .replace('{product}', productDesc)
        .replace('{lighting}', styleConfig.lighting)
        .replace('{background}', styleConfig.background)

      // 4. 根据平台调整
      let finalPrompt = prompt
      if (platform === 'xiaohongshu') {
        finalPrompt += ', lifestyle photography, social media aesthetic'
      } else if (platform === 'amazon') {
        finalPrompt += ', pure white background, product centered, professional catalog shot'
      }

      const result: OptimizedPrompt = {
        prompt: finalPrompt,
        style,
        lighting: styleConfig.lighting,
        background: styleConfig.background,
        camera: styleConfig.camera,
        keywords: analysis.keywords,
        knowledgeReferences: knowledge.map(k => k.entry.id)
      }

      context.tracer.endStepSuccess(context.stepId, result)

      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime
        }
      }

    } catch (error: any) {
      context.tracer.endStepFailed(context.stepId, error.message)

      return {
        success: false,
        error: {
          code: 'PROMPT_OPTIMIZATION_FAILED',
          message: error.message,
          recoverable: true
        }
      }
    }
  }
}