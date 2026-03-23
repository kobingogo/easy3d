/**
 * 文案生成工具
 * 为不同平台生成电商文案
 */

import type { Tool, ToolContext, ToolResult } from '../types'
import { generatePlatformCopy } from '../../copy/platform-copy'
import type {
  CopyStyle,
  PlatformCopyInput
} from '../../copy/platform-copy'
import { PHASE1_PLATFORMS } from '../../export/platform-adapter'
import type { Platform } from '../../export/platform-adapter'

export interface CopywritingInput {
  productDescription: string
  platform: Platform
  style?: CopyStyle
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
          enum: [...PHASE1_PLATFORMS],
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
      const copyInput: PlatformCopyInput = {
        productDescription,
        platform,
        style,
        productAnalysis
      }
      const generated = await generatePlatformCopy(copyInput)
      const copyResult: CopywritingResult = {
        ...generated,
        platform,
        style
      }

      context.tracer.endStepSuccess(context.stepId, copyResult, {
        modelUsed: 'qwen3.5-plus'
      })

      return {
        success: true,
        data: copyResult,
        metadata: {
          duration: Date.now() - startTime,
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
