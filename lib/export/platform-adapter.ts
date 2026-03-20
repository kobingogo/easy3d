/**
 * 平台适配器
 * 为不同电商平台提供尺寸适配功能
 */

export type Platform = 'taobao' | 'xiaohongshu' | 'douyin'

export interface PlatformSpec {
  name: string
  width: number
  height: number
  aspectRatio: string
  format: 'jpg' | 'png'
  maxSizeBytes: number
  backgroundColor?: string
  description: string
}

export interface AdaptedImage {
  url: string
  width: number
  height: number
  format: string
  sizeBytes: number
  platform: Platform
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 平台规格配置
 */
export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  taobao: {
    name: '淘宝主图',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    format: 'jpg',
    maxSizeBytes: 3 * 1024 * 1024, // 3MB
    backgroundColor: '#FFFFFF',
    description: '白底、产品占比>70%'
  },
  xiaohongshu: {
    name: '小红书',
    width: 1242,
    height: 1660,
    aspectRatio: '3:4',
    format: 'jpg',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    description: '竖图优先、可加文字'
  },
  douyin: {
    name: '抖音',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    format: 'jpg',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    description: '竖图、前3秒吸引眼球'
  }
}

/**
 * 获取平台规格
 */
export function getPlatformSpec(platform: Platform): PlatformSpec {
  return PLATFORM_SPECS[platform]
}

/**
 * 获取所有平台规格
 */
export function getAllPlatformSpecs(): PlatformSpec[] {
  return Object.values(PLATFORM_SPECS)
}

/**
 * 客户端图片适配
 * 使用 Canvas 进行图片缩放
 */
export async function adaptImageForPlatform(
  imageUrl: string,
  platform: Platform
): Promise<AdaptedImage> {
  const spec = PLATFORM_SPECS[platform]

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = spec.width
        canvas.height = spec.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // 填充背景色
        if (spec.backgroundColor) {
          ctx.fillStyle = spec.backgroundColor
          ctx.fillRect(0, 0, spec.width, spec.height)
        }

        // 计算缩放和居中
        const { drawWidth, drawHeight, offsetX, offsetY } = calculateDrawDimensions(
          img.width,
          img.height,
          spec.width,
          spec.height
        )

        // 绘制图片
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // 导出
        const format = spec.format === 'jpg' ? 'image/jpeg' : 'image/png'
        const quality = spec.format === 'jpg' ? 0.92 : 1

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            const adaptedUrl = URL.createObjectURL(blob)

            resolve({
              url: adaptedUrl,
              width: spec.width,
              height: spec.height,
              format: spec.format,
              sizeBytes: blob.size,
              platform
            })
          },
          format,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

/**
 * 批量适配多平台
 */
export async function adaptForAllPlatforms(
  imageUrl: string
): Promise<Record<Platform, AdaptedImage>> {
  const platforms: Platform[] = ['taobao', 'xiaohongshu', 'douyin']

  const results = await Promise.all(
    platforms.map(async (platform) => {
      const adapted = await adaptImageForPlatform(imageUrl, platform)
      return [platform, adapted] as const
    })
  )

  return Object.fromEntries(results) as Record<Platform, AdaptedImage>
}

/**
 * 验证图片是否符合平台规范
 */
export async function validateForPlatform(
  imageUrl: string,
  platform: Platform
): Promise<ValidationResult> {
  const spec = PLATFORM_SPECS[platform]
  const errors: string[] = []
  const warnings: string[] = []

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // 检查尺寸
      const expectedRatio = spec.width / spec.height
      const actualRatio = img.width / img.height
      const ratioDiff = Math.abs(expectedRatio - actualRatio)

      if (ratioDiff > 0.1) {
        warnings.push(
          `宽高比不符合推荐值。推荐 ${spec.aspectRatio}，当前 ${img.width}:${img.height}`
        )
      }

      // 检查最小尺寸
      if (img.width < spec.width || img.height < spec.height) {
        errors.push(
          `分辨率过低。推荐 ${spec.width}x${spec.height}，当前 ${img.width}x${img.height}`
        )
      }

      resolve({
        valid: errors.length === 0,
        errors,
        warnings
      })
    }

    img.onerror = () => {
      resolve({
        valid: false,
        errors: ['无法加载图片'],
        warnings: []
      })
    }

    img.src = imageUrl
  })
}

/**
 * 下载适配后的图片
 */
export function downloadAdaptedImage(adapted: AdaptedImage, filename?: string): void {
  const link = document.createElement('a')
  link.href = adapted.url
  link.download = filename || `${adapted.platform}-${adapted.width}x${adapted.height}.${adapted.format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 计算绘制尺寸（保持宽高比，居中）
 */
function calculateDrawDimensions(
  srcWidth: number,
  srcHeight: number,
  destWidth: number,
  destHeight: number
): { drawWidth: number; drawHeight: number; offsetX: number; offsetY: number } {
  const srcRatio = srcWidth / srcHeight
  const destRatio = destWidth / destHeight

  let drawWidth: number
  let drawHeight: number

  if (srcRatio > destRatio) {
    // 宽度受限
    drawWidth = destWidth
    drawHeight = destWidth / srcRatio
  } else {
    // 高度受限
    drawHeight = destHeight
    drawWidth = destHeight * srcRatio
  }

  const offsetX = (destWidth - drawWidth) / 2
  const offsetY = (destHeight - drawHeight) / 2

  return { drawWidth, drawHeight, offsetX, offsetY }
}

/**
 * 计算文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}