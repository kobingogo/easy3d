import { NextRequest, NextResponse } from 'next/server'
import { getTaskStatus, isTripoConfigured } from '@/lib/tripo'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    if (!isTripoConfigured()) {
      return NextResponse.json({ error: 'Tripo API Key not configured' }, { status: 500 })
    }

    const status = await getTaskStatus(taskId)

    // 提取模型 URL（优先使用 output.pbr_model，其次 result.pbr_model.url）
    const modelUrl = status.data.output?.pbr_model || status.data.result?.pbr_model?.url
    const thumbnailUrl = status.data.output?.rendered_image || status.data.result?.rendered_image?.url

    return NextResponse.json({
      success: true,
      taskId: status.data.task_id,
      status: status.data.status,
      progress: status.data.progress,
      modelUrl,
      thumbnailUrl,
      error: status.data.error?.message
    })

  } catch (error: any) {
    console.error('Tripo status API error:', error)
    return NextResponse.json({
      error: 'Failed to get task status',
      message: error.message
    }, { status: 500 })
  }
}