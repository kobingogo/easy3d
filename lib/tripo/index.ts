/**
 * Tripo AI API 封装
 * 文档：https://docs.tripo3d.ai
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
  imageUrl: string
  prompt?: string
  quality?: 'standard' | 'hd'
}

// ==================== API 函数 ====================

/**
 * 创建 3D 生成任务
 */
export async function createTask(options: CreateTaskOptions): Promise<TripoTaskResponse> {
  const { imageUrl, prompt, quality = 'standard' } = options

  const response = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'image_to_model',
      file: {
        type: 'url',
        url: imageUrl,
      },
      mode: quality === 'hd' ? 'preview' : 'quick',
      ...(prompt && { prompt }),
    }),
  })

  if (!response.ok) {
    throw new Error(`Tripo API error: ${response.status}`)
  }

  return response.json()
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
    throw new Error(`Tripo API error: ${response.status}`)
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