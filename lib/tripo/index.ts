/**
 * Tripo AI API 封装
 * 文档：https://platform.tripo3d.ai/docs/generation
 * 支持：image_to_model, text_to_model, multiview_to_model
 */

import { getTripoConfig, isMultiviewSupported, isQualityParamsSupported, type TripoConfig } from './config'

const TRIPO_API_KEY = process.env.TRIPO_API_KEY!
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

const DEFAULT_CONFIG = {
    "face_limit": 500000,
    "quad": true,
    "visibility": "public",
    "model_version": "v3.1-20260211",
    "generate_parts": false,
    "smart_poly": false,
    "texture": true,
    "pbr": false,
    "texture_alignment": "original_image",
    "texture_quality": "detailed",
    "enable_image_autofix": true,
    "geometry_quality": "standard"
}

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

export type TripoTaskType = 'image_to_model' | 'text_to_model' | 'multiview_to_model'

export interface ImageInput {
  /** 图片 URL */
  url?: string
  /** 上传后的 file_token */
  file_token?: string
  /** 图片类型: jpg, jpeg, png */
  type?: string
}

export interface CreateTaskOptions {
  /** 任务类型 */
  type: TripoTaskType
  /** 单图输入 (image_to_model) */
  imageUrl?: string
  /** 多图输入 (multiview_to_model) - 顺序: [front, left, back, right] */
  images?: Array<{ url?: string; file_token?: string; type?: string }>
  /** 文本提示 (text_to_model) */
  prompt?: string
  /** 自定义配置覆盖 */
  config?: Partial<TripoConfig>
}

// ==================== API 函数 ====================

/**
 * 创建 3D 生成任务
 * 支持单图、多图、文本三种模式
 */
export async function createTask(options: CreateTaskOptions): Promise<TripoTaskResponse> {
  const { type, imageUrl, images, prompt, config: customConfig } = options

  // 合并配置
  const config = { ...getTripoConfig(), ...customConfig, }

  // 验证模型版本支持多视角
  if (type === 'multiview_to_model' && !isMultiviewSupported(config.modelVersion)) {
    console.warn(`[Tripo] model_version ${config.modelVersion} may not support multiview, falling back to v2.5-20250123`)
    config.modelVersion = 'v2.5-20250123'
  }

  let requestBody: Record<string, unknown>

  switch (type) {
    case 'image_to_model':
      if (!imageUrl) {
        throw new Error('image_to_model 需要 imageUrl 参数')
      }
      requestBody = buildImageToModelRequest(imageUrl, config, prompt)
      break

    case 'multiview_to_model':
      if (!images || images.length === 0) {
        throw new Error('multiview_to_model 需要 images 参数')
      }
      requestBody = buildMultiviewToModelRequest(images, config, prompt)
      break

    case 'text_to_model':
      if (!prompt) {
        throw new Error('text_to_model 需要 prompt 参数')
      }
      requestBody = buildTextToModelRequest(prompt, config)
      break

    default:
      throw new Error(`不支持的任务类型: ${type}`)
  }

  const qualityInfo = isQualityParamsSupported(config.modelVersion)
    ? `, geometry_quality: ${config.geometryQuality}`
    : ' (P1 model uses default quality)'
  console.log(`[Tripo] Creating ${type} task with model_version: ${config.modelVersion}${qualityInfo}`)

  requestBody = {...requestBody, ...DEFAULT_CONFIG}
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
    throw createFriendlyError(data, response.status)
  }

  console.log(`[Tripo] Task created successfully: ${data.data?.task_id}`)
  return data
}

/**
 * 构建单图转 3D 请求
 * @param imageUrl 图片 URL
 * @param config 配置
 * @param prompt 可选的提示词，用于引导生成方向
 */
function buildImageToModelRequest(imageUrl: string, config: TripoConfig, prompt?: string): Record<string, unknown> {
  // P1-20260311 专用高质量配置
  const isP1 = config.modelVersion === 'P1-20260311'
  
  const baseRequest: Record<string, unknown> = {
    type: 'image_to_model',
    file: {
      type: 'url',
      url: imageUrl,
    },
    model_version: config.modelVersion,
    // 材质参数 - P1 默认启用高质量 PBR
    pbr: config.pbr,
    auto_size: config.autoSize,
    // 提示词
    negative_prompt: config.negativePrompt,
  }

  // 添加 prompt 引导（P1 强烈推荐使用 prompt 补充描述）
  if (prompt) {
    baseRequest.prompt = prompt
    console.log(`[Tripo] Using prompt for image_to_model: ${prompt.slice(0, 100)}...`)
  } else if (isP1) {
    // P1 模型即使没有 prompt 也建议添加默认引导
    baseRequest.prompt = 'high quality 3D model, detailed texture, professional grade'
    console.log('[Tripo] P1 model: Using default quality prompt')
  }

  // 质量参数处理
  if (isP1) {
    // P1-20260311 专用参数
    // P1 使用 face_limit 控制精度（范围：48-20000，推荐 15000-20000 高质量）
    if (config.faceLimit) {
      baseRequest.face_limit = config.faceLimit
    } else {
      // 默认高质量设置
      baseRequest.face_limit = 15000
    }
    
    // P1 支持图片自动修复（去噪、增强）
    if (config.enableImageAutofix !== undefined) {
      baseRequest.enable_image_autofix = config.enableImageAutofix
    } else {
      // 默认启用，提升输入图片质量
      baseRequest.enable_image_autofix = true
    }
    
    console.log(`[Tripo] P1-20260311: face_limit=${baseRequest.face_limit}, enable_image_autofix=${baseRequest.enable_image_autofix}`)
  } else if (isQualityParamsSupported(config.modelVersion)) {
    // v3.1 等版本使用标准质量参数
    baseRequest.geometry_quality = config.geometryQuality
    baseRequest.texture_quality = config.textureQuality
    baseRequest.texture_alignment = config.textureAlignment
  }

  return baseRequest
}

/**
 * 构建多视角转 3D 请求
 * 文档要求: files 必须按顺序 [front, left, back, right]
 * @param images 图片数组
 * @param config 配置
 * @param prompt 可选的提示词
 */
function buildMultiviewToModelRequest(
  images: Array<{ url?: string; file_token?: string; type?: string }>,
  config: TripoConfig,
  prompt?: string
): Record<string, unknown> {
  // 构建 files 数组，最多 4 张图
  const files = images.slice(0, 4).map((img, index) => {
    const position = ['front', 'left', 'back', 'right'][index]
    console.log(`[Tripo] Multiview image ${index + 1}: ${position}`)

    if (img.file_token) {
      return {
        type: img.type || 'jpg',
        file_token: img.file_token,
      }
    }
    return {
      type: img.type || 'jpg',
      url: img.url,
    }
  })

  const baseRequest: Record<string, unknown> = {
    type: 'multiview_to_model',
    files,
    model_version: config.modelVersion,
    // 材质参数 - P1 默认启用高质量 PBR
    pbr: config.pbr,
    auto_size: config.autoSize,
    // 提示词
    negative_prompt: config.negativePrompt,
  }

  // P1 模型的多视角模式支持 face_limit 参数
  const isP1 = config.modelVersion === 'P1-20260311'
  if (isP1) {
    if (config.faceLimit) {
      baseRequest.face_limit = config.faceLimit
    } else {
      // 多视角默认高质量
      baseRequest.face_limit = 15000
    }
    console.log(`[Tripo] P1-20260311 multiview: face_limit=${baseRequest.face_limit}`)
  } else if (isQualityParamsSupported(config.modelVersion)) {
    // v3.1 等版本使用标准质量参数
    baseRequest.geometry_quality = config.geometryQuality
  }

  baseRequest.texture_quality = config.textureQuality
  baseRequest.texture_alignment = config.textureAlignment
  return baseRequest
}

/**
 * 构建文本转 3D 请求
 * 支持 v3.1-20260211 等文生模型
 */
function buildTextToModelRequest(prompt: string, config: TripoConfig): Record<string, unknown> {
  const isV31 = config.modelVersion === 'v3.1-20260211'
  
  const baseRequest: Record<string, unknown> = {
    type: 'text_to_model',
    prompt,
    model_version: config.modelVersion,
    // 材质参数
    pbr: config.pbr,
    auto_size: config.autoSize,
    // 提示词
    negative_prompt: config.negativePrompt,
  }

  // v3.1-20260211 支持 geometry_quality 参数（Ultra Mode）
  if (isV31 || isQualityParamsSupported(config.modelVersion)) {
    baseRequest.geometry_quality = config.geometryQuality
    baseRequest.texture_quality = config.textureQuality
    baseRequest.texture_alignment = config.textureAlignment
    
    if (isV31 && config.geometryQuality === 'detailed') {
      console.log('[Tripo] v3.1-20260211: Ultra Mode enabled (geometry_quality=detailed)')
    }
  }

  return baseRequest
}

/**
 * 创建友好的错误信息
 */
function createFriendlyError(data: Record<string, unknown>, status: number): Error {
  let errorMessage = `Tripo API error: ${status}`

  const errorMap: Record<string, string> = {
    '1001': 'Tripo API 认证失败，请检查 API Key',
    '1002': 'Tripo API Key 无效或已过期',
    '1003': 'Tripo API 余额不足，请充值后重试',
    '2001': '图片 URL 无法访问，请检查图片是否可公开访问',
    '2002': '图片格式不支持，请使用 JPG/PNG 格式',
    '2003': '图片尺寸过小，请使用至少 256x256 的图片',
  }

  const code = String(data.code)
  if (errorMap[code]) {
    errorMessage = errorMap[code]
  } else if (String(data.message || '').includes('credit') || String(data.message || '').includes('quota')) {
    errorMessage = 'Tripo API 余额不足，请充值后重试'
  } else if (data.message) {
    errorMessage = `Tripo API error: ${data.message}`
  }

  return new Error(errorMessage)
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
    interval?: number
    timeout?: number
    onProgress?: (progress: number) => void
  }
): Promise<TripoTaskStatus> {
  const config = getTripoConfig()
  const {
    interval = config.pollInterval,
    timeout = config.pollTimeout,
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
 * 使用 P1-20260311 模型生成高质量 3D 模型（便捷函数）
 * 
 * @param imageUrl 输入图片 URL
 * @param prompt 可选的提示词（推荐添加，用于引导生成方向）
 * @param options 可选的高级配置
 * @returns 任务响应（包含 task_id）
 * 
 * @example
 * ```typescript
 * // 基础使用
 * const result = await generateHighQuality3D('https://example.com/product.jpg')
 * 
 * // 带提示词
 * const result = await generateHighQuality3D(
 *   'https://example.com/watch.jpg',
 *   '精致的机械手表，金属表壳，皮革表带，高端腕表'
 * )
 * 
 * // 自定义配置
 * const result = await generateHighQuality3D(
 *   'https://example.com/character.jpg',
 *   '赛博朋克风格角色，细节丰富',
 *   { faceLimit: 20000, enableImageAutofix: true }
 * )
 * ```
 */
export async function generateHighQuality3D(
  imageUrl: string,
  prompt?: string,
  options?: {
    /** 面数限制（48-20000，默认 15000） */
    faceLimit?: number
    /** 启用图片自动修复（默认 true） */
    enableImageAutofix?: boolean
    /** 自定义负面提示词 */
    negativePrompt?: string
    /** 是否启用 PBR（默认 true） */
    pbr?: boolean
  }
): Promise<TripoTaskResponse> {
  return createTask({
    type: 'image_to_model',
    imageUrl,
    prompt,
    config: {
      modelVersion: 'P1-20260311',
      faceLimit: options?.faceLimit || 15000,
      enableImageAutofix: options?.enableImageAutofix ?? true,
      negativePrompt: options?.negativePrompt,
      pbr: options?.pbr ?? true,
      autoSize: true,
      geometryQuality: 'detailed',
      textureQuality: 'detailed',
    },
  })
}

/**
 * 使用 v3.1-20260211 模型从文本生成高质量 3D 模型（便捷函数）
 * 
 * @param prompt 文本描述（≤1024 字符）
 * @param options 可选的高级配置
 * @returns 任务响应（包含 task_id）
 * 
 * @example
 * ```typescript
 * // 基础使用
 * const result = await generateHighQuality3DFromText('一个赛博朋克风格的机械龙')
 * 
 * // 自定义配置
 * const result = await generateHighQuality3DFromText(
 *   '精致的机械手表，金属表壳，皮革表带',
 *   { geometryQuality: 'detailed', faceLimit: 20000 }
 * )
 * ```
 */
export async function generateHighQuality3DFromText(
  prompt: string,
  options?: {
    /** 几何质量（默认 'detailed' - Ultra Mode） */
    geometryQuality?: 'detailed' | 'standard'
    /** 纹理质量（默认 'detailed'） */
    textureQuality?: 'detailed' | 'standard'
    /** 面数限制 */
    faceLimit?: number
    /** 负面提示词 */
    negativePrompt?: string
  }
): Promise<TripoTaskResponse> {
  return createTask({
    type: 'text_to_model',
    prompt,
    config: {
      modelVersion: 'v3.1-20260211',
      geometryQuality: options?.geometryQuality || 'detailed',
      textureQuality: options?.textureQuality || 'detailed',
      faceLimit: options?.faceLimit,
      negativePrompt: options?.negativePrompt,
      pbr: true,
      autoSize: true,
    },
  })
}

/**
 * 使用 base64 图片数据创建任务
 */
export async function createTaskWithBase64Image(options: {
  base64Image: string
  mimeType: string
  prompt?: string
  config?: Partial<TripoConfig>
}): Promise<TripoTaskResponse> {
  const { base64Image, mimeType, prompt, config: customConfig } = options

  if (!TRIPO_API_KEY) {
    throw new Error('Tripo API Key 未配置')
  }

  const config = { ...getTripoConfig(), ...customConfig }

  const requestBody: Record<string, unknown> = {
    type: 'image_to_model',
    file: {
      type: 'base64',
      data: base64Image,
      mime_type: mimeType,
    },
    model_version: config.modelVersion,
    pbr: config.pbr,
    auto_size: config.autoSize,
    negative_prompt: config.negativePrompt,
    ...(prompt && { prompt }),
  }

  // 只有支持的模型版本才添加质量参数
  if (isQualityParamsSupported(config.modelVersion)) {
    requestBody.geometry_quality = config.geometryQuality
    requestBody.texture_quality = config.textureQuality
    requestBody.texture_alignment = config.textureAlignment
  }

  console.log(`[Tripo] Creating image_to_model task with base64, model_version: ${config.modelVersion}`)

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

// 重新导出配置相关
export { getTripoConfig, validateTripoConfig, isMultiviewSupported, isQualityParamsSupported, type TripoConfig } from './config'