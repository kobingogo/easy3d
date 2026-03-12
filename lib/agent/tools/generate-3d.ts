/**
 * 3D 生成工具
 * 调用 Tripo API 生成 3D 模型
 * 支持：图片转 3D、文本转 3D
 */

import type { Tool, GenerationResult, ToolContext, ToolResult } from '../types'
import { createTask, getTaskStatus, isTripoConfigured } from '@/lib/tripo'

export const generate3DTool: Tool<{
  imageUrl?: string
  prompt?: string | any  // 支持对象或字符串
  quality?: 'standard' | 'hd'
}, GenerationResult> = {
  type: 'function',
  function: {
    name: 'generate_3d',
    description: '调用 Tripo AI 生成 3D 模型。支持图片转3D（提供imageUrl）或文本转3D（提供prompt）',
    parameters: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: '商品图片 URL（可选，如果没有则使用文本模式）'
        },
        prompt: {
          type: 'string',
          description: '生成提示词（可选，用于优化生成效果）'
        },
        quality: {
          type: 'string',
          enum: ['standard', 'hd'],
          description: '生成质量：standard 快速，hd 高质量',
          default: 'standard'
        }
      }
    }
  },

  config: {
    timeout: 120000,  // 2 分钟
    retryable: true,
    maxRetries: 1
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()

    console.log('[generate_3d] input:', JSON.stringify(input).slice(0, 500))

    try {
      // 检查 Tripo API 是否配置
      if (!isTripoConfigured()) {
        throw new Error('Tripo API Key 未配置，请设置 TRIPO_API_KEY 环境变量')
      }

      // 提取 prompt 字符串（可能是对象或字符串）
      let promptText: string | undefined
      if (input.prompt) {
        if (typeof input.prompt === 'string') {
          promptText = input.prompt
        } else if (typeof input.prompt === 'object' && input.prompt.prompt) {
          // 如果 prompt 是对象，提取其中的 prompt 字段
          promptText = input.prompt.prompt
        }
      }

      // 验证是否有有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        // 检测假 URL
        if (trimmed.includes('example.com') || trimmed.includes('placeholder')) return false
        return true
      }

      const imageUrl = isValidImageUrl(input.imageUrl) ? input.imageUrl : undefined

      // 至少需要图片或提示词
      if (!imageUrl && !promptText) {
        throw new Error('需要提供 imageUrl 或 prompt 才能生成 3D 模型')
      }

      console.log(`[generate_3d] Mode: ${imageUrl ? 'image_to_model' : 'text_to_model'}`)
      console.log(`[generate_3d] Prompt: ${promptText?.slice(0, 100)}...`)

      // 调用 Tripo API
      const taskResponse = await createTask({
        imageUrl,
        prompt: promptText,
        quality: input.quality || 'standard'
      })

      if (taskResponse.code !== 0) {
        throw new Error(taskResponse.msg || 'Tripo API error')
      }

      const taskId = taskResponse.data.task_id

      const result: GenerationResult = {
        taskId,
        modelId: '',  // 将在完成时填充
        status: 'processing',
        mode: imageUrl ? 'image_to_model' : 'text_to_model'
      }

      context.tracer.endStepSuccess(context.stepId, result)

      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime,
          taskId,
          mode: result.mode
        }
      }

    } catch (error: any) {
      console.error('[generate_3d] Error:', error.message)
      context.tracer.endStepFailed(context.stepId, error.message)

      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.message,
          recoverable: true
        }
      }
    }
  }
}

/**
 * 检查生成状态
 */
export async function checkGenerationStatus(taskId: string): Promise<GenerationResult> {
  const status = await getTaskStatus(taskId)

  return {
    taskId,
    modelId: status.result?.model_id || '',
    status: status.status === 'success' ? 'completed' :
            status.status === 'failed' ? 'failed' : 'processing',
    modelUrl: status.result?.files?.find(f => f.file_type === 'GLB')?.file_url,
    thumbnailUrl: status.result?.files?.find(f => f.file_type === 'rendered_image')?.file_url
  }
}