import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTask, pollTaskStatus, downloadModel, type TripoTaskType, type TripoConfig } from '@/lib/tripo'

/**
 * 生成 3D 模型 API
 *
 * 支持两种模式：
 * 1. 单图模式：传入 imageUrl，使用 image_to_model
 * 2. 多视角模式：传入 images 数组，使用 multiview_to_model
 *
 * 请求体：
 * - imageUrl: string (单图模式)
 * - images: Array<{ url: string }> (多视角模式，顺序: [front, left, back, right])
 * - quality: 'standard' | 'hd' (已弃用，保留兼容)
 * - config: Partial<TripoConfig> (可选，覆盖默认配置)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, images, quality, config: customConfig } = body

    // 验证输入
    const validation = validateInput({ imageUrl, images })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 确定任务类型
    const taskType: TripoTaskType = validation.isMultiview ? 'multiview_to_model' : 'image_to_model'
    console.log(`[Generate] Task type: ${taskType}, images count: ${validation.isMultiview ? images!.length : 1}`)

    const supabase = await createClient()

    // 1. 创建数据库记录
    const { data: modelRecord, error: dbError } = await supabase
      .from('models')
      .insert({
        original_image_url: imageUrl || (images && images[0]?.url),
        status: 'pending',
        quality: quality || 'hd',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
    }

    // 2. 调用 Tripo API
    const taskResponse = await createTask(
      validation.isMultiview
        ? {
            type: 'multiview_to_model',
            images: images!.map((img: { url: string; file_token?: string; type?: string }) => ({
              url: img.url,
              file_token: img.file_token,
              type: img.type || 'jpg',
            })),
            config: customConfig,
          }
        : {
            type: 'image_to_model',
            imageUrl: imageUrl!,
            config: customConfig,
          }
    )

    if (taskResponse.code !== 0) {
      await supabase
        .from('models')
        .update({ status: 'failed' })
        .eq('id', modelRecord.id)

      return NextResponse.json(
        { error: taskResponse.msg },
        { status: 500 }
      )
    }

    const taskId = taskResponse.data.task_id

    // 3. 更新任务 ID
    await supabase
      .from('models')
      .update({
        trip_task_id: taskId,
        status: 'processing'
      })
      .eq('id', modelRecord.id)

    // 4. 异步轮询状态
    pollTaskStatus(taskId, {
      onProgress: async (progress) => {
        console.log(`Task ${taskId} progress: ${progress}%`)
      }
    }).then(async (result) => {
      if (result.data.status === 'success') {
        const modelUrl = result.data.output?.pbr_model || result.data.result?.pbr_model?.url
        const thumbnailUrl = result.data.output?.rendered_image || result.data.result?.rendered_image?.url

        if (modelUrl) {
          try {
            const modelBuffer = await downloadModel(modelUrl)
            const modelFileName = `${modelRecord.id}.glb`

            await supabase.storage
              .from('3d-models')
              .upload(modelFileName, modelBuffer, {
                contentType: 'model/gltf-binary',
              })

            const { data: urlData } = supabase.storage
              .from('3d-models')
              .getPublicUrl(modelFileName)

            await supabase
              .from('models')
              .update({
                model_3d_url: urlData.publicUrl,
                thumbnail_url: thumbnailUrl,
                status: 'completed'
              })
              .eq('id', modelRecord.id)
          } catch (error) {
            console.error('Failed to save model:', error)
            await supabase
              .from('models')
              .update({ status: 'failed' })
              .eq('id', modelRecord.id)
          }
        }
      } else {
        await supabase
          .from('models')
          .update({ status: 'failed' })
          .eq('id', modelRecord.id)
      }
    }).catch(async (error) => {
      console.error('Poll error:', error)
      await supabase
        .from('models')
        .update({ status: 'failed' })
        .eq('id', modelRecord.id)
    })

    // 5. 返回任务信息
    return NextResponse.json({
      success: true,
      taskId,
      modelId: modelRecord.id,
      taskType,
      estimatedTime: taskType === 'multiview_to_model' ? 60 : 45,
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 验证输入参数
 */
function validateInput({ imageUrl, images }: { imageUrl?: string; images?: Array<{ url: string }> }): {
  valid: boolean
  error?: string
  isMultiview: boolean
} {
  // 无任何输入
  if (!imageUrl && (!images || images.length === 0)) {
    return {
      valid: false,
      error: '需要提供 imageUrl 或 images 参数',
      isMultiview: false,
    }
  }

  // 单图模式
  if (imageUrl && !images) {
    return {
      valid: true,
      isMultiview: false,
    }
  }

  // 多视角模式
  if (images && images.length > 0) {
    // 验证每张图片都有 URL
    for (let i = 0; i < images.length; i++) {
      if (!images[i].url) {
        return {
          valid: false,
          error: `images[${i}] 缺少 url 字段`,
          isMultiview: true,
        }
      }
    }

    // 多视角最多 4 张图
    if (images.length > 4) {
      return {
        valid: false,
        error: '多视角模式最多支持 4 张图片（front, left, back, right）',
        isMultiview: true,
      }
    }

    return {
      valid: true,
      isMultiview: true,
    }
  }

  // 同时提供了 imageUrl 和 images，优先使用多视角
  if (imageUrl && images && images.length > 0) {
    return {
      valid: true,
      isMultiview: true,
    }
  }

  return {
    valid: false,
    error: '无效的输入参数',
    isMultiview: false,
  }
}