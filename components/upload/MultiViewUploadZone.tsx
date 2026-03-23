'use client'

import { useCallback, useState } from 'react'
import { Upload, Camera, RotateCcw, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiViewImage {
  id: string
  file: File
  preview: string
  position: 'front' | 'left' | 'back' | 'right'
  label: string
}

interface MultiViewUploadZoneProps {
  onUpload: (images: MultiViewImage[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSize?: number // MB
}

const VIEW_POSITIONS = [
  { position: 'front' as const, label: '正面', description: '产品正面照片' },
  { position: 'left' as const, label: '左侧', description: '产品左侧照片' },
  { position: 'back' as const, label: '背面', description: '产品背面照片' },
  { position: 'right' as const, label: '右侧', description: '产品右侧照片' },
]

export function MultiViewUploadZone({
  onUpload,
  disabled = false,
  maxFiles = 4,
  maxSize = 10,
}: MultiViewUploadZoneProps) {
  const [images, setImages] = useState<MultiViewImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取已上传的位置
  const uploadedPositions = images.map(img => img.position)

  // 获取下一个待上传的位置
  const nextPosition = VIEW_POSITIONS.find(v => !uploadedPositions.includes(v.position))

  const validateFile = useCallback((file: File): boolean => {
    const accept = ['image/jpeg', 'image/png', 'image/webp']
    if (!accept.includes(file.type)) {
      setError(`${file.name} 格式不支持，请使用 JPG/PNG/WebP`)
      return false
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`${file.name} 超过 ${maxSize}MB`)
      return false
    }
    return true
  }, [maxSize])

  const addImage = useCallback((file: File, position: 'front' | 'left' | 'back' | 'right') => {
    if (uploadedPositions.includes(position)) {
      setError('该位置已有图片')
      return
    }

    const newImage: MultiViewImage = {
      id: `${position}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      position,
      label: VIEW_POSITIONS.find(v => v.position === position)?.label || position,
    }

    setImages(prev => {
      const updated = [...prev, newImage]
      // 按位置顺序排序
      const order = ['front', 'left', 'back', 'right']
      updated.sort((a, b) => order.indexOf(a.position) - order.indexOf(b.position))
      return updated
    })
    setError(null)
  }, [uploadedPositions])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // 验证文件
    const validFiles = files.filter(validateFile)
    if (validFiles.length === 0) return

    // 如果有多张图，按顺序分配位置
    if (validFiles.length > 1) {
      const availablePositions = VIEW_POSITIONS
        .filter(v => !uploadedPositions.includes(v.position))
        .map(v => v.position)

      validFiles.slice(0, availablePositions.length).forEach((file, index) => {
        addImage(file, availablePositions[index])
      })
    } else {
      // 单张图，分配到下一个位置
      if (nextPosition) {
        addImage(validFiles[0], nextPosition.position)
      }
    }
  }, [disabled, validateFile, uploadedPositions, nextPosition, addImage])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, position?: 'front' | 'left' | 'back' | 'right') => {
    setError(null)
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFile = files.find(validateFile)
    if (!validFile) return

    // 如果指定了位置，使用该位置；否则使用下一个可用位置
    const targetPosition = position || nextPosition?.position
    if (targetPosition) {
      addImage(validFile, targetPosition)
    }

    // 重置 input
    e.target.value = ''
  }, [validateFile, nextPosition, addImage])

  const handleSubmit = useCallback(() => {
    if (images.length >= 2) {
      onUpload(images)
    }
  }, [images, onUpload])

  const canSubmit = images.length >= 2

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-base font-medium">拖拽多视角图片到这里</p>
            <p className="text-sm text-muted-foreground mt-1">
              支持 2-4 张图片，自动分配位置
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            正面必填，其他视角可选
          </p>
        </div>
      </div>

      {/* 视角卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VIEW_POSITIONS.map(({ position, label, description }) => {
          const uploadedImage = images.find(img => img.position === position)

          return (
            <div
              key={position}
              className={cn(
                'relative aspect-square rounded-lg border-2 overflow-hidden transition-all',
                uploadedImage
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-dashed border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              {uploadedImage ? (
                <>
                  <img
                    src={uploadedImage.preview}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-sm font-medium text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {label}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(uploadedImage.id)
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer p-3">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e, position)}
                    disabled={disabled}
                  />
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </label>
              )}
            </div>
          )
        })}
      </div>

      {/* 提示信息 */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          已上传 {images.length}/4 张图片
          {images.length < 2 && '（至少需要 2 张）'}
        </p>

        {images.length > 0 && (
          <button
            onClick={() => {
              images.forEach(img => URL.revokeObjectURL(img.preview))
              setImages([])
            }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            清空重选
          </button>
        )}
      </div>

      {/* 提交按钮 */}
      {canSubmit && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          使用 {images.length} 张图片生成 3D 模型
        </button>
      )}
    </div>
  )
}