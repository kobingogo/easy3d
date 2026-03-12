import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('id')

    if (modelId) {
      // 获取单个模型状态
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }

      return NextResponse.json({ model: data })
    }

    // 获取模型列表
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
    }

    return NextResponse.json({ models: data })
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('id')

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 获取模型信息
    const { data: model, error: fetchError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single()

    if (fetchError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // 删除存储的文件
    if (model.model_3d_url) {
      const fileName = model.model_3d_url.split('/').pop()
      await supabase.storage.from('3d-models').remove([fileName])
    }

    if (model.original_image_url) {
      const fileName = model.original_image_url.split('/').pop()
      await supabase.storage.from('original-images').remove([fileName])
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('models')
      .delete()
      .eq('id', modelId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}