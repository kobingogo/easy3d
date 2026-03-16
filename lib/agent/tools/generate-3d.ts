/**
 * 3D 生成工具
 * 调用 Tripo API 生成 3D 模型
 * 支持：图片转 3D、文本转 3D
 */

import type { Tool, GenerationResult, ToolContext, ToolResult } from '../types'
import { createTask, getTaskStatus, isTripoConfigured, createTaskWithBase64Image, downloadImageAsBase64 } from '@/lib/tripo'

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
    timeout: 180000,  // 3 分钟（包含轮询时间）
    retryable: true,
    maxRetries: 1
  },

  handler: async (input, context: ToolContext) => {
    const startTime = Date.now()

    console.log('[generate_3d] input:', JSON.stringify(input).slice(0, 500))

    // 在 try 外部声明变量，以便在 catch 中使用
    let promptText: string | undefined
    let imageUrl: string | undefined

    try {
      // 检查 Tripo API 是否配置
      if (!isTripoConfigured()) {
        throw new Error('Tripo API Key 未配置，请设置 TRIPO_API_KEY 环境变量')
      }

      // 提取 prompt 字符串（可能是对象或字符串）
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

      imageUrl = isValidImageUrl(input.imageUrl) ? input.imageUrl : undefined

      // 至少需要图片或提示词
      if (!imageUrl && !promptText) {
        throw new Error('需要提供 imageUrl 或 prompt 才能生成 3D 模型')
      }

      console.log(`[generate_3d] Mode: ${imageUrl ? 'image_to_model' : 'text_to_model'}`)
      console.log(`[generate_3d] Prompt: ${promptText?.slice(0, 100)}...`)

      // 调用 Tripo API 创建任务
      const taskResponse = await createTask({
        imageUrl,
        prompt: promptText,
        quality: input.quality || 'standard'
      })

      if (taskResponse.code !== 0) {
        throw new Error(taskResponse.msg || 'Tripo API error')
      }

      const taskId = taskResponse.data.task_id
      console.log(`[generate_3d] Task created: ${taskId}`)

      // 轮询等待任务完成
      const pollInterval = 3000  // 3秒
      const maxPollTime = 150000  // 2.5分钟
      const maxAttempts = Math.floor(maxPollTime / pollInterval)

      let modelUrl: string | undefined
      let thumbnailUrl: string | undefined

      for (let i = 0; i < maxAttempts; i++) {
        console.log(`[generate_3d] Polling attempt ${i + 1}/${maxAttempts}`)

        const status = await getTaskStatus(taskId)

        if (status.data.status === 'success') {
          // 提取模型 URL
          modelUrl = status.data.output?.pbr_model || status.data.result?.pbr_model?.url
          thumbnailUrl = status.data.output?.rendered_image || status.data.result?.rendered_image?.url

          console.log(`[generate_3d] Model generated successfully: ${modelUrl?.slice(0, 100)}...`)

          const result: GenerationResult = {
            taskId,
            modelId: '',
            status: 'completed',
            modelUrl,
            thumbnailUrl,
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
        }

        if (status.data.status === 'failed') {
          console.error('[generate_3d] Tripo task failed. Full response:', JSON.stringify(status, null, 2))
          const errorMsg = status.data.error?.message || '3D 模型生成失败'
          throw new Error(`Tripo 生成失败: ${errorMsg}`)
        }

        // 记录进度
        if (status.data.progress > 0) {
          console.log(`[generate_3d] Progress: ${status.data.progress}%`)
        }

        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

      throw new Error('3D 模型生成超时，请稍后重试')

    } catch (error: any) {
      console.error('[generate_3d] Error:', error.message)

      // 如果是图片模式失败，尝试多种降级方案
      if (imageUrl && promptText) {
        // 方案1: 尝试下载图片并转为 base64 上传
        if (error.message.includes('URL') || error.message.includes('访问') || error.message.includes('download')) {
          console.log('[generate_3d] 尝试下载图片并转为 base64 上传...')
          try {
            const { base64, mimeType } = await downloadImageAsBase64(imageUrl)
            console.log(`[generate_3d] 图片下载成功，类型: ${mimeType}, 大小: ${(base64.length / 1024).toFixed(1)}KB`)

            const fallbackResponse = await createTaskWithBase64Image({
              base64Image: base64,
              mimeType,
              prompt: promptText,
              quality: input.quality || 'standard',
            })

            if (fallbackResponse.code === 0) {
              const taskId = fallbackResponse.data.task_id
              console.log(`[generate_3d] Base64 task created: ${taskId}`)

              // 轮询等待
              const pollInterval = 3000
              const maxAttempts = 50

              for (let i = 0; i < maxAttempts; i++) {
                console.log(`[generate_3d] Base64 polling attempt ${i + 1}/${maxAttempts}`)
                const status = await getTaskStatus(taskId)

                if (status.data.status === 'success') {
                  const modelUrl = status.data.output?.pbr_model || status.data.result?.pbr_model?.url
                  const thumbnailUrl = status.data.output?.rendered_image || status.data.result?.rendered_image?.url

                  const result: GenerationResult = {
                    taskId,
                    modelId: '',
                    status: 'completed',
                    modelUrl,
                    thumbnailUrl,
                    mode: 'image_to_model'
                  }

                  context.tracer.endStepSuccess(context.stepId, result)

                  return {
                    success: true,
                    data: result,
                    metadata: {
                      duration: Date.now() - startTime,
                      taskId,
                      mode: 'image_to_model',
                      fallback: 'base64'
                    }
                  }
                }

                if (status.data.status === 'failed') {
                  console.error('[generate_3d] Base64 task failed:', JSON.stringify(status, null, 2))
                  break
                }

                await new Promise(resolve => setTimeout(resolve, pollInterval))
              }
            }
          } catch (base64Error: any) {
            console.error('[generate_3d] Base64 upload failed:', base64Error.message)
          }
        }

        // 方案2: 降级到纯文本生成模式
        if (error.message.includes('Tripo') || error.message.includes('URL')) {
          console.log('[generate_3d] 尝试降级到文本生成模式...')
          try {
            const fallbackResponse = await createTask({
              prompt: promptText,
              quality: input.quality || 'standard'
            })

            if (fallbackResponse.code === 0) {
              const taskId = fallbackResponse.data.task_id
              console.log(`[generate_3d] Text fallback task created: ${taskId}`)

              // 轮询等待
              const pollInterval = 3000
              const maxAttempts = 50

              for (let i = 0; i < maxAttempts; i++) {
                console.log(`[generate_3d] Text fallback polling attempt ${i + 1}/${maxAttempts}`)
                const status = await getTaskStatus(taskId)

                if (status.data.status === 'success') {
                  const modelUrl = status.data.output?.pbr_model || status.data.result?.pbr_model?.url
                  const thumbnailUrl = status.data.output?.rendered_image || status.data.result?.rendered_image?.url

                  const result: GenerationResult = {
                    taskId,
                    modelId: '',
                    status: 'completed',
                    modelUrl,
                    thumbnailUrl,
                    mode: 'text_to_model'
                  }

                  context.tracer.endStepSuccess(context.stepId, result)

                  return {
                    success: true,
                    data: result,
                    metadata: {
                      duration: Date.now() - startTime,
                      taskId,
                      mode: 'text_to_model',
                      fallback: 'text'
                    }
                  }
                }

                if (status.data.status === 'failed') {
                  break
                }

                await new Promise(resolve => setTimeout(resolve, pollInterval))
              }
            }
          } catch (fallbackError: any) {
            console.error('[generate_3d] Text fallback also failed:', fallbackError.message)
          }
        }
      }

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
    modelId: '',
    status: status.data.status === 'success' ? 'completed' :
            status.data.status === 'failed' ? 'failed' : 'processing',
    modelUrl: status.data.output?.pbr_model || status.data.result?.pbr_model?.url,
    thumbnailUrl: status.data.output?.rendered_image || status.data.result?.rendered_image?.url
  }
}