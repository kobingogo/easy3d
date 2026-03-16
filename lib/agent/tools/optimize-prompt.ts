/**
 * 提示词优化工具
 * 使用 LLM 深度优化 3D 生成提示词，支持平台风格适配
 */

import type { Tool, OptimizedPrompt, StyleTemplate, ToolContext, ToolResult } from '../types'
import type { ExtendedProductAnalysis } from './analyze-product'
import { generate } from '../llm'
import { searchKnowledge } from '@/lib/rag/search'

// 平台风格配置
const PLATFORM_STYLES: Record<string, {
  styleHint: string
  keywords: string[]
  description: string
}> = {
  xiaohongshu: {
    styleHint: 'lifestyle, Instagram-worthy, aesthetic, soft natural lighting, cozy atmosphere',
    keywords: ['种草', '生活化', '氛围感', '精致'],
    description: '小红书风格：生活化、种草感、氛围感强'
  },
  taobao: {
    styleHint: 'clean product photography, e-commerce ready, pure white background, professional catalog',
    keywords: ['专业', '干净', '商品展示'],
    description: '淘宝风格：专业、干净、突出商品'
  },
  douyin: {
    styleHint: 'dynamic, trendy, eye-catching, vibrant colors, social media viral',
    keywords: ['潮流', '动感', '吸睛'],
    description: '抖音风格：潮流、动感、吸引眼球'
  },
  amazon: {
    styleHint: 'professional product photography, pure white background, product centered, catalog style',
    keywords: ['专业', '简洁', '标准化'],
    description: '亚马逊风格：专业、简洁、标准化'
  }
}

// 风格模板（作为备用）
const STYLE_TEMPLATES: Record<StyleTemplate, string> = {
  minimal: 'clean white background, soft diffused lighting, minimal composition',
  luxury: 'elegant gradient background, premium studio lighting, gold accents',
  tech: 'futuristic dark background, blue LED accents, metallic reflective surface',
  natural: 'natural daylight, organic background, wooden surface, lifestyle',
  trendy: 'vibrant gradient background, dynamic angle, colorful lighting'
}

export const optimizePromptTool: Tool<{
  analysis?: ExtendedProductAnalysis
  style?: StyleTemplate
  platform?: 'xiaohongshu' | 'taobao' | 'douyin' | 'amazon'
  userDescription?: string
}, OptimizedPrompt> = {
  type: 'function',
  function: {
    name: 'optimize_prompt',
    description: '使用 LLM 深度优化 3D 生成提示词，结合商品分析和平台风格生成最佳提示词',
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
          description: '展示风格'
        },
        platform: {
          type: 'string',
          enum: ['xiaohongshu', 'taobao', 'douyin', 'amazon'],
          description: '目标平台'
        },
        userDescription: {
          type: 'string',
          description: '用户原始描述'
        }
      }
    }
  },

  config: {
    timeout: 20000,
    retryable: true,
    maxRetries: 2
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()
    const { analysis, style, platform: inputPlatform, userDescription } = input

    console.log('[optimize_prompt] Input:', JSON.stringify({ analysis, style, inputPlatform, userDescription }).slice(0, 500))

    try {
      // 1. 确定平台（优先级：输入参数 > analysis.platform > 默认）
      const platform = inputPlatform || analysis?.platform || null
      console.log('[optimize_prompt] Platform:', platform)

      // 2. 确定风格（优先级：输入参数 > analysis.suggestedStyle > 根据平台推断 > 默认）
      let finalStyle: StyleTemplate = style || analysis?.suggestedStyle || 'minimal'
      if (!style && platform) {
        // 根据平台推断风格
        const platformStyleMap: Record<string, StyleTemplate> = {
          xiaohongshu: 'natural',
          taobao: 'minimal',
          douyin: 'trendy',
          amazon: 'minimal'
        }
        finalStyle = platformStyleMap[platform] || 'minimal'
      }
      console.log('[optimize_prompt] Final style:', finalStyle)

      // 3. 构建商品描述
      let productDesc = ''
      if (analysis?.subcategory && analysis.subcategory !== '商品') {
        const keywords = analysis.keywords?.slice(0, 3).join(' ') || ''
        productDesc = `${analysis.subcategory} ${keywords}`.trim()
      } else if (userDescription) {
        productDesc = userDescription
      } else {
        productDesc = 'product'
      }
      console.log('[optimize_prompt] Product description:', productDesc)

      // 4. 使用 LLM 深度优化提示词
      const optimizationPrompt = buildOptimizationPrompt(productDesc, analysis, platform, finalStyle)
      console.log('[optimize_prompt] LLM prompt:', optimizationPrompt.slice(0, 300))

      const result = await generate({
        model: 'qwen3.5-plus',
        messages: [{
          role: 'user',
          content: optimizationPrompt
        }],
        responseFormat: { type: 'json_object' }
      })

      console.log('[optimize_prompt] LLM response:', result.content.slice(0, 500))

      // 5. 解析 LLM 响应
      const optimized = parseOptimizationResponse(result.content, finalStyle, platform)

      // 6. RAG 知识检索（可选增强）
      try {
        const knowledge = await searchKnowledge(`${productDesc} ${finalStyle}`, { limit: 2 })
        optimized.knowledgeReferences = knowledge.map(k => k.entry?.id).filter(Boolean)
      } catch (e) {
        console.log('[optimize_prompt] RAG search skipped')
      }

      console.log('[optimize_prompt] Final prompt:', optimized.prompt)

      context.tracer.endStepSuccess(context.stepId, optimized, {
        tokensUsed: result.usage.totalTokens,
        modelUsed: 'qwen3.5-plus'
      })

      return {
        success: true,
        data: optimized,
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: result.usage.totalTokens,
          modelUsed: 'qwen3.5-plus'
        }
      }

    } catch (error: any) {
      console.error('[optimize_prompt] Error:', error.message)
      context.tracer.endStepFailed(context.stepId, error.message)

      // 降级：返回基础提示词
      const fallbackPrompt = generateFallbackPrompt(analysis, style, userDescription)

      return {
        success: true,  // 不阻止流程继续
        data: fallbackPrompt,
        metadata: {
          duration: Date.now() - startTime,
          fallback: true
        }
      }
    }
  }
}

/**
 * 构建 LLM 优化提示词
 */
function buildOptimizationPrompt(
  productDesc: string,
  analysis: ExtendedProductAnalysis | undefined,
  platform: string | null,
  style: StyleTemplate
): string {
  const platformInfo = platform ? PLATFORM_STYLES[platform] : null
  const styleTemplate = STYLE_TEMPLATES[style]

  return `你是一个专业的 3D 产品渲染提示词专家。请为以下商品生成最佳的 3D 渲染提示词。

【商品信息】
- 商品描述：${productDesc}
- 类别：${analysis?.category || 'other'}
- 子类别：${analysis?.subcategory || '商品'}
- 风格标签：${analysis?.style?.join('、') || '无'}
- 目标用户：${analysis?.targetAudience || '通用'}
${platformInfo ? `- 目标平台：${platformInfo.description}` : ''}

【要求】
1. 提示词必须准确描述商品本身，让 AI 能生成正确的商品类型
2. 必须包含商品的英文名称（用于 Tripo AI 理解）
3. 结合风格要求：${styleTemplate}
${platformInfo ? `4. 适配平台风格：${platformInfo.styleHint}` : ''}

【输出格式】
返回 JSON：
{
  "prompt": "英文提示词，用于 3D 生成",
  "productType": "商品的英文类型名称（如 handbag, lipstick, sneaker）",
  "style": "使用的风格",
  "lighting": "灯光描述（中文）",
  "background": "背景描述（中文）",
  "camera": "相机角度描述（中文）",
  "keywords": ["关键特征词"],
  "confidence": 0.9
}

【重要提示】
- prompt 中的商品类型必须明确、具体（如 women's handbag 而非 bag）
- 避免使用模糊词汇（如 product, item）
- 确保生成的模型类型与用户需求完全匹配

只返回 JSON，不要其他内容。`
}

/**
 * 解析 LLM 优化响应
 */
function parseOptimizationResponse(
  content: string,
  style: StyleTemplate,
  platform: string | null
): OptimizedPrompt {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        prompt: parsed.prompt || generateDefaultPrompt(parsed.productType, style, platform),
        style: parsed.style || style,
        lighting: parsed.lighting || '柔和的漫射光',
        background: parsed.background || '纯色背景',
        camera: parsed.camera || '正面展示',
        keywords: parsed.keywords || [],
        knowledgeReferences: [],
        productType: parsed.productType,
        confidence: parsed.confidence || 0.8
      }
    }
  } catch (e) {
    console.error('[optimize_prompt] Parse error:', e)
  }

  // 返回默认值
  return {
    prompt: generateDefaultPrompt('product', style, platform),
    style,
    lighting: '柔和的漫射光',
    background: '纯色背景',
    camera: '正面展示',
    keywords: [],
    confidence: 0.6
  }
}

/**
 * 生成默认提示词
 */
function generateDefaultPrompt(
  productType: string,
  style: StyleTemplate,
  platform: string | null
): string {
  const styleTemplate = STYLE_TEMPLATES[style]
  const platformStyle = platform ? PLATFORM_STYLES[platform]?.styleHint : ''

  return `Professional 3D product render of ${productType}, ${styleTemplate}${platformStyle ? ', ' + platformStyle : ''}, high quality, photorealistic, 4K resolution`
}

/**
 * 生成降级提示词
 */
function generateFallbackPrompt(
  analysis: ExtendedProductAnalysis | undefined,
  style: StyleTemplate | undefined,
  userDescription: string | undefined
): OptimizedPrompt {
  const productType = analysis?.subcategory || userDescription || 'product'
  const finalStyle = style || analysis?.suggestedStyle || 'minimal'

  return {
    prompt: `Professional 3D product render of ${productType}, ${STYLE_TEMPLATES[finalStyle]}, high quality, 4K resolution`,
    style: finalStyle,
    lighting: '柔和的漫射光',
    background: '纯色背景',
    camera: '正面展示',
    keywords: analysis?.keywords || [],
    confidence: 0.5
  }
}