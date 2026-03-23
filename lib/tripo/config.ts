/**
 * Tripo API 配置
 * 可通过环境变量覆盖默认值
 */

export interface TripoConfig {
  /** 模型版本 */
  modelVersion: string
  /** 几何质量: detailed (Ultra Mode) | standard - 仅 v2.5+ 支持 */
  geometryQuality: 'detailed' | 'standard'
  /** 纹理质量: detailed (高分辨率) | standard */
  textureQuality: 'detailed' | 'standard'
  /** 纹理对齐策略: original_image (保真) | geometry (几何优先) */
  textureAlignment: 'original_image' | 'geometry'
  /** 是否启用 PBR 材质 */
  pbr: boolean
  /** 是否自动缩放到真实尺寸 */
  autoSize: boolean
  /** 默认负面提示词 */
  negativePrompt: string
  /** 轮询间隔 (ms) */
  pollInterval: number
  /** 轮询超时 (ms) */
  pollTimeout: number
  /** P1 专用: 面数限制 (48~20000) - 仅 P1 模型支持 */
  faceLimit?: number
  /** P1 专用: 启用图片自动修复 - 仅 P1 模型支持 */
  enableImageAutofix?: boolean
}

/**
 * 默认配置 - P1-20260311 高质量预设
 */
export const DEFAULT_TRIPO_CONFIG: TripoConfig = {
  // 模型版本：P1-20260311 是最新图生模型，提供最佳质量
  modelVersion: process.env.TRIPO_MODEL_VERSION || 'P1-20260311',

  // 几何质量：detailed = Ultra Mode，最高精度（v3.1 等版本使用）
  geometryQuality: (process.env.TRIPO_GEOMETRY_QUALITY as TripoConfig['geometryQuality']) || 'detailed',

  // 纹理质量：detailed = 高分辨率纹理
  textureQuality: (process.env.TRIPO_TEXTURE_QUALITY as TripoConfig['textureQuality']) || 'detailed',

  // 纹理对齐：original_image 优先保证与原图一致
  textureAlignment: (process.env.TRIPO_TEXTURE_ALIGNMENT as TripoConfig['textureAlignment']) || 'original_image',

  // PBR 材质 - P1 默认启用高质量 PBR
  pbr: process.env.TRIPO_PBR !== 'false',

  // 自动真实尺寸 - 推荐启用
  autoSize: process.env.TRIPO_AUTO_SIZE === 'true',

  // 负面提示词 - 过滤低质量结果
  negativePrompt: process.env.TRIPO_NEGATIVE_PROMPT || 'low quality, blurry, distorted, low polygon,粗糙，畸形',

  // 轮询配置
  pollInterval: parseInt(process.env.TRIPO_POLL_INTERVAL || '10000', 10),
  pollTimeout: parseInt(process.env.TRIPO_POLL_TIMEOUT || '1800000', 10),

  // P1 专用：面数限制（默认 15000，高质量）
  faceLimit: parseInt(process.env.TRIPO_FACE_LIMIT || '15000', 10),

  // P1 专用：启用图片自动修复（默认 true，提升输入质量）
  enableImageAutofix: process.env.TRIPO_ENABLE_IMAGE_AUTOFIX !== 'false',
}

/**
 * 获取当前配置
 */
export function getTripoConfig(): TripoConfig {
  return { ...DEFAULT_TRIPO_CONFIG }
}

/**
 * 验证配置是否有效
 */
export function validateTripoConfig(config: Partial<TripoConfig>): string[] {
  const errors: string[] = []

  const validModelVersions = [
    'P1-20260311',
    'v3.1-20260211',
    'v3.0-20250812',
    'v2.5-20250123',
    'v2.0-20240919',
    'v1.4-20240625',
    'Turbo-v1.0-20250506',
  ]

  if (config.modelVersion && !validModelVersions.includes(config.modelVersion)) {
    errors.push(`Invalid model_version: ${config.modelVersion}. Valid options: ${validModelVersions.join(', ')}`)
  }

  if (config.geometryQuality && !['detailed', 'standard'].includes(config.geometryQuality)) {
    errors.push(`Invalid geometry_quality: ${config.geometryQuality}. Must be 'detailed' or 'standard'`)
  }

  if (config.textureQuality && !['detailed', 'standard'].includes(config.textureQuality)) {
    errors.push(`Invalid texture_quality: ${config.textureQuality}. Must be 'detailed' or 'standard'`)
  }

  if (config.textureAlignment && !['original_image', 'geometry'].includes(config.textureAlignment)) {
    errors.push(`Invalid texture_alignment: ${config.textureAlignment}. Must be 'original_image' or 'geometry'`)
  }

  return errors
}

/**
 * 支持多视角输入的模型版本
 */
export const MULTIVIEW_SUPPORTED_VERSIONS = [
  'P1-20260311',
  'v3.1-20260211',
  'v3.0-20250812',
  'v2.5-20250123',
  'v2.0-20240919',
  'v1.4-20240625',
]

/**
 * 检查模型版本是否支持多视角
 */
export function isMultiviewSupported(modelVersion: string): boolean {
  return MULTIVIEW_SUPPORTED_VERSIONS.includes(modelVersion)
}

/**
 * 支持 geometry_quality/texture_quality 参数的模型版本
 * P1 模型不支持这些参数，使用自己的质量设置
 */
export const QUALITY_PARAMS_SUPPORTED_VERSIONS = [
  'v3.1-20260211',
  'v3.0-20250812',
  'v2.5-20250123',
  'v2.0-20240919',
  'v1.4-20240625',
]

/**
 * 检查模型版本是否支持质量参数 (geometry_quality, texture_quality, texture_alignment)
 */
export function isQualityParamsSupported(modelVersion: string): boolean {
  return QUALITY_PARAMS_SUPPORTED_VERSIONS.includes(modelVersion)
}