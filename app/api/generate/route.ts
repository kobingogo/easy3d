import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTask, pollTaskStatus, downloadModel } from '@/lib/tripo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, quality = 'standard' } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. 创建数据库记录
    const { data: modelRecord, error: dbError } = await supabase
      .from('models')
      .insert({
        original_image_url: imageUrl,
        status: 'pending',
        quality,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
    }

    // 2. 调用 Tripo API
    const taskResponse = await createTask({
      imageUrl,
      quality,
    })

    if (taskResponse.code !== 0) {
      // 更新状态为失败
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

    // 4. 异步轮询状态（生产环境应该用队列）
    // 这里简单实现，实际应该用后台任务
    pollTaskStatus(taskId, {
      onProgress: async (progress) => {
        // 可以通过 WebSocket 推送进度
        console.log(`Task ${taskId} progress: ${progress}%`)
      }
    }).then(async (result) => {
      if (result.data.status === 'success') {
        // 提取模型 URL
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

            // 更新数据库
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
      estimatedTime: 45, // 预估时间（秒）
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}