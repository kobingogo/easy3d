/**
 * 3D 生成工具
 * 调用 Tripo API 生成 3D 模型
 */

import type { Tool, GenerationResult, ToolContext, ToolResult } from '../types'
import { createTask, getTaskStatus } from '@/lib/tripo'

export const generate3DTool: Tool<{
  imageUrl: string
  prompt?: string
  quality?: 'standard' | 'hd'
}, GenerationResult> = {
  type: 'function',
  function: {
    name: 'generate_3d',
    description: '调用 Tripo AI 从图片生成 3D 模型，返回任务 ID 和状态',
    parameters: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: '商品图片 URL'
        },
        prompt: {
          type: 'string',
          description: '优化后的提示词（可选）'
        },
        quality: {
          type: 'string',
          enum: ['standard', 'hd'],
          description: '生成质量：standard 快速，hd 高质量',
          default: 'standard'
        }
      },
      required: ['imageUrl']
    }
  },

  config: {
    timeout: 120000,  // 2 分钟
    retryable: true,
    maxRetries: 1
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()

    try {
      // 调用 Tripo API
      const taskResponse = await createTask({
        imageUrl: input.imageUrl,
        prompt: input.prompt,
        quality: input.quality || 'standard'
      })

      if (taskResponse.code !== 0) {
        throw new Error(taskResponse.msg || 'Tripo API error')
      }

      const taskId = taskResponse.data.task_id

      const result: GenerationResult = {
        taskId,
        modelId: '',  // 将在完成时填充
        status: 'processing'
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