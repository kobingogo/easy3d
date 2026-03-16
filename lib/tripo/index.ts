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
  code: number
  data: {
    task_id: string
    status: 'pending' | 'processing' | 'success' | 'failed'
    progress: number
    output?: {
      pbr_model?: string
      rendered_image?: string
    }
    result?: {
      pbr_model?: {
        type: string
        url: string
      }
      rendered_image?: {
        type: string
        url: string
      }
    }
    error?: {
      code: string
      message: string
    }
  }
}

export interface CreateTaskOptions {
  imageUrl?: string
  prompt?: string
  quality?: 'standard' | 'hd'
  /** 是否生成 PBR 材质，默认 true */
  pbr?: boolean
  /** 随机种子，用于可复现结果 */
  seed?: number
}

// ==================== API 函数 ====================

/**
 * 创建 3D 生成任务
 * 支持图片生成和文本生成两种模式
 *
 * API 文档: https://platform.tripo3d.ai/docs/generation
 * - image_to_model: 需要提供图片 URL 或 base64
 * - text_to_model: 只需要提供 prompt
 */
export async function createTask(options: CreateTaskOptions): Promise<TripoTaskResponse> {
  const { imageUrl, prompt, quality = 'standard', pbr = true, seed } = options

  // 验证参数
  if (!imageUrl && !prompt) {
    throw new Error('需要提供 imageUrl 或 prompt')
  }

  // 根据质量选择模式: quick = 快速预览, preview = 高质量
  const mode = quality === 'hd' ? 'preview' : 'quick'

  let requestBody: any

  if (imageUrl) {
    // 图片转 3D 模式
    // 文档: https://platform.tripo3d.ai/docs/generation#image-to-model
    requestBody = {
      type: 'image_to_model',
      file: {
        type: 'url',
        url: imageUrl,
      },
      mode,
      // 不指定 model_version，使用最新版本
      // model_version 会在后台自动使用最新模型
      ...(pbr && { pbr }),
      ...(prompt && { prompt }),
      ...(seed !== undefined && { seed }),
    }

    console.log(`[Tripo] Creating image_to_model task, mode: ${mode}, pbr: ${pbr}`)
  } else {
    // 文本转 3D 模式
    // 文档: https://platform.tripo3d.ai/docs/generation#text-to-model
    requestBody = {
      type: 'text_to_model',
      prompt: prompt || '',
      mode,
      ...(pbr && { pbr }),
      ...(seed !== undefined && { seed }),
    }

    console.log(`[Tripo] Creating text_to_model task, mode: ${mode}, pbr: ${pbr}`)
  }

  console.log(`[Tripo] Request body:`, JSON.stringify(requestBody).slice(0, 300))

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
    console.error('[Tripo] API error response:', JSON.stringify(data, null, 2))

    // 友好错误信息
    let errorMessage = `Tripo API error: ${response.status}`

    // 常见错误码处理
    if (data.code === 1001) {
      errorMessage = 'Tripo API 认证失败，请检查 API Key'
    } else if (data.code === 1002) {
      errorMessage = 'Tripo API Key 无效或已过期'
    } else if (data.code === 1003) {
      errorMessage = 'Tripo API 余额不足，请充值后重试'
    } else if (data.code === 2001) {
      errorMessage = '图片 URL 无法访问，请检查图片是否可公开访问'
    } else if (data.code === 2002) {
      errorMessage = '图片格式不支持，请使用 JPG/PNG 格式'
    } else if (data.code === 2003) {
      errorMessage = '图片尺寸过小，请使用至少 256x256 的图片'
    } else if (data.message?.includes('credit') || data.message?.includes('quota')) {
      errorMessage = 'Tripo API 余额不足，请充值后重试'
    } else if (data.message) {
      errorMessage = `Tripo API error: ${data.message}`
    }

    throw new Error(errorMessage)
  }

  console.log(`[Tripo] Task created successfully: ${data.data?.task_id}`)
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
      onProgress(status.data.progress)
    }

    if (status.data.status === 'success' || status.data.status === 'failed') {
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

/**
 * 使用 base64 图片数据创建任务
 * 当图片 URL 无法公开访问时使用（如 Cloudflare 保护的 URL）
 */
export async function createTaskWithBase64Image(options: {
  base64Image: string  // base64 编码的图片数据（不含 data:image/xxx;base64, 前缀）
  mimeType: string     // 图片 MIME 类型，如 'image/jpeg', 'image/png'
  prompt?: string
  quality?: 'standard' | 'hd'
  pbr?: boolean
  seed?: number
}): Promise<TripoTaskResponse> {
  const { base64Image, mimeType, prompt, quality = 'standard', pbr = true, seed } = options

  if (!TRIPO_API_KEY) {
    throw new Error('Tripo API Key 未配置')
  }

  const mode = quality === 'hd' ? 'preview' : 'quick'

  const requestBody = {
    type: 'image_to_model',
    file: {
      type: 'base64',
      data: base64Image,
      mime_type: mimeType,
    },
    mode,
    ...(pbr && { pbr }),
    ...(prompt && { prompt }),
    ...(seed !== undefined && { seed }),
  }

  console.log(`[Tripo] Creating image_to_model task with base64, mode: ${mode}`)

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
    console.error('[Tripo] API error response:', JSON.stringify(data, null, 2))
    throw new Error(`Tripo API error: ${data.message || response.status}`)
  }

  return data
}

/**
 * 从 URL 下载图片并转换为 base64
 * 用于处理无法直接访问的图片 URL
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*',
    },
  })

  if (!response.ok) {
    throw new Error(`无法下载图片: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  return {
    base64,
    mimeType: contentType,
  }
}