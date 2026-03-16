'use client'

import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // MB
  accept?: string[]
  disabled?: boolean
}

export function UploadZone({
  onUpload,
  maxFiles = 10,
  maxSize = 10,
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      // 检查格式
      if (!accept.includes(file.type)) {
        errors.push(`${file.name} 格式不支持`)
        continue
      }

      // 检查大小
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} 超过 ${maxSize}MB`)
        continue
      }

      validFiles.push(file)
    }

    if (errors.length > 0) {
      setError(errors.join(', '))
    }

    return validFiles.slice(0, maxFiles)
  }, [accept, maxSize, maxFiles])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(files)

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      await onUpload(validFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }, [validateFiles, onUpload])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])
    const validFiles = validateFiles(files)

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      await onUpload(validFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }, [validateFiles, onUpload])

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8
        transition-colors cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isUploading || disabled ? 'pointer-events-none opacity-50' : ''}
      `}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={disabled ? undefined : handleDrop}
      onClick={disabled ? undefined : () => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept={accept.join(',')}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">
            {isUploading ? '上传中...' : '拖拽图片到这里'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            或点击选择文件
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          支持 JPG、PNG、WebP，最大 {maxSize}MB，最多 {maxFiles} 张
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive text-center">
          {error}
        </p>
      )}
    </div>
  )
}