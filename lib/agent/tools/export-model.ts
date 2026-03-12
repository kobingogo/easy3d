/**
 * 模型导出工具
 * 导出 3D 模型为指定格式
 */

import type { Tool, ExportResult, ToolContext, ToolResult } from '../types'

export const exportModelTool: Tool<{
  modelUrl: string
  format: 'glb' | 'gif' | 'mp4'
}, ExportResult> = {
  type: 'function',
  function: {
    name: 'export_model',
    description: '导出 3D 模型为指定格式（GLB/GIF/MP4）',
    parameters: {
      type: 'object',
      properties: {
        modelUrl: {
          type: 'string',
          description: '3D 模型 URL'
        },
        format: {
          type: 'string',
          enum: ['glb', 'gif', 'mp4'],
          description: '导出格式：glb(3D文件) / gif(动图) / mp4(视频)'
        }
      },
      required: ['modelUrl', 'format']
    }
  },

  config: {
    timeout: 60000,
    retryable: true,
    maxRetries: 1
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()

    try {
      // 目前直接返回原始 URL（GLB 格式）
      // 实际生产中应该调用 Tripo 的渲染 API
      const result: ExportResult = {
        format: input.format,
        url: input.modelUrl,
        size: 0,  // 未知大小
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24小时后过期
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
          code: 'EXPORT_FAILED',
          message: error.message,
          recoverable: true
        }
      }
    }
  }
}