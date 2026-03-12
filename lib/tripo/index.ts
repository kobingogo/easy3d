/**
 * Tripo AI API 封装
 * 文档：https://docs.tripo3d.ai
 * 支持：image_to_model 和 text_to_model
 */

const TRIPO_API_KEY = process.env.TRIPO_API_KEY!
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

// ==================== 类型定义 ====================

export interface TripoTaskResponse {
  code: number
  msg: string
  data: {
    task_id: string
    quota_type: string
  }
}

export interface TripoTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  progress: number
  result?: {
    model_id: string
    files: Array<{
      file_type: string
      file_url: string
    }>
  }
  error?: {
    code: string
    message: string
  }
}

export interface CreateTaskOptions {
  imageUrl?: string
  prompt?: string
  quality?: 'standard' | 'hd'
}

// ==================== API 函数 ====================

/**
 * 创建 3D 生成任务
 * 支持图片生成和文本生成两种模式
 */
export async function createTask(options: CreateTaskOptions): Promise<TripoTaskResponse> {
  const { imageUrl, prompt, quality = 'standard' } = options

  // 验证参数
  if (!imageUrl && !prompt) {
    throw new Error('需要提供 imageUrl 或 prompt')
  }

  // 根据是否有图片选择模式
  const mode = quality === 'hd' ? 'preview' : 'quick'

  let requestBody: any

  if (imageUrl) {
    // 图片转 3D 模式
    requestBody = {
      type: 'image_to_model',
      file: {
        type: 'url',
        url: imageUrl,
      },
      mode,
      ...(prompt && { prompt }),
    }
  } else {
    // 文本转 3D 模式
    requestBody = {
      type: 'text_to_model',
      prompt: prompt || '',
      mode,
    }
  }

  console.log(`[Tripo] Creating task with ${imageUrl ? 'image' : 'text'} mode`)

  const response = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[Tripo] API error:', data)

    // 友好错误信息
    let errorMessage = `Tripo API error: ${response.status}`
    if (data.code === 2010 || data.message?.includes('credit')) {
      errorMessage = 'Tripo API 余额不足，请充值后重试'
    } else if (data.message) {
      errorMessage = `Tripo API error: ${data.message}`
    }

    throw new Error(errorMessage)
  }

  return data
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: string): Promise<TripoTaskStatus> {
  const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(`Tripo API error: ${response.status} - ${data.msg || 'Unknown error'}`)
  }

  return response.json()
}

/**
 * 轮询任务状态直到完成
 */
export async function pollTaskStatus(
  taskId: string,
  options?: {
    interval?: number      // 轮询间隔 (ms)
    timeout?: number       // 超时时间 (ms)
    onProgress?: (progress: number) => void
  }
): Promise<TripoTaskStatus> {
  const {
    interval = 5000,
    timeout = 180000,  // 3 分钟超时
    onProgress
  } = options || {}

  const startTime = Date.now()
  const maxAttempts = Math.floor(timeout / interval)

  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTaskStatus(taskId)

    if (onProgress) {
      onProgress(status.progress)
    }

    if (status.status === 'success' || status.status === 'failed') {
      return status
    }

    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('Task timeout')
}

/**
 * 下载模型文件
 */
export async function downloadModel(modelUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(modelUrl)
  if (!response.ok) {
    throw new Error(`Failed to download model: ${response.status}`)
  }
  return response.arrayBuffer()
}

/**
 * 检查 API Key 是否配置
 */
export function isTripoConfigured(): boolean {
  return !!TRIPO_API_KEY
}