'use client'

import { useState, useCallback, useRef } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'

type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'failed'

interface GenerationState {
  status: GenerationStatus
  progress: number
  taskId: string | null
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
}

export default function GeneratePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    taskId: null,
    modelUrl: null,
    thumbnailUrl: null,
    error: null
  })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const handleUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    // 停止之前的轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setGeneration({
      status: 'idle',
      progress: 0,
      taskId: null,
      modelUrl: null,
      thumbnailUrl: null,
      error: null
    })
  }, [])

  const pollStatus = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`/api/tripo/status/${taskId}`)
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to get status')
      }

      setGeneration(prev => ({
        ...prev,
        progress: data.progress || prev.progress
      }))

      if (data.status === 'success') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        setGeneration(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          modelUrl: data.modelUrl,
          thumbnailUrl: data.thumbnailUrl
        }))
      } else if (data.status === 'failed') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        setGeneration(prev => ({
          ...prev,
          status: 'failed',
          error: data.error || '生成失败'
        }))
      }
    } catch (error: any) {
      console.error('Poll error:', error)
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!uploadedFile) return

    try {
      // 1. 上传图片
      setGeneration(prev => ({ ...prev, status: 'uploading', progress: 5 }))

      const formData = new FormData()
      formData.append('file', uploadedFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json()
        throw new Error(uploadData.error || '上传失败')
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url

      // 2. 调用 Tripo API
      setGeneration(prev => ({ ...prev, status: 'generating', progress: 10 }))

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          quality: 'standard'
        })
      })

      if (!generateRes.ok) {
        const generateData = await generateRes.json()
        throw new Error(generateData.error || '生成请求失败')
      }

      const generateData = await generateRes.json()
      const taskId = generateData.taskId

      setGeneration(prev => ({
        ...prev,
        status: 'polling',
        taskId,
        progress: 15
      }))

      // 3. 开始轮询
      pollingRef.current = setInterval(() => pollStatus(taskId), 3000)

    } catch (error: any) {
      console.error('Generation error:', error)
      setGeneration(prev => ({
        ...prev,
        status: 'failed',
        error: error.message || '生成失败，请重试'
      }))
    }
  }, [uploadedFile, pollStatus])

  const handleReset = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setUploadedFile(null)
    setPreviewUrl(null)
    setGeneration({
      status: 'idle',
      progress: 0,
      taskId: null,
      modelUrl: null,
      thumbnailUrl: null,
      error: null
    })
  }, [])

  const handleDownload = useCallback(async () => {
    if (!generation.modelUrl) return

    try {
      // 使用代理 URL 解决 CORS 问题
      const downloadUrl = (generation.modelUrl.includes('tripo3d.com') || generation.modelUrl.includes('tripo-data'))
        ? `/api/proxy/model?url=${encodeURIComponent(generation.modelUrl)}`
        : generation.modelUrl

      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `model-${Date.now()}.glb`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }, [generation.modelUrl])

  const isProcessing = ['uploading', 'generating', 'polling'].includes(generation.status)

  const getStatusBadge = () => {
    switch (generation.status) {
      case 'uploading':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />上传中</Badge>
      case 'generating':
        return <Badge variant="default"><Sparkles className="w-3 h-3 mr-1" />创建任务</Badge>
      case 'polling':
        return <Badge variant="default"><Loader2 className="w-3 h-3 mr-1 animate-spin" />生成中</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />完成</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />失败</Badge>
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (generation.status) {
      case 'uploading':
        return '正在上传图片...'
      case 'generating':
        return '正在创建 3D 生成任务...'
      case 'polling':
        return `AI 正在生成 3D 模型... ${generation.progress}%`
      case 'completed':
        return '3D 模型生成完成！'
      case 'failed':
        return generation.error || '生成失败'
      default:
        return '上传图片后开始生成'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI 3D 模型生成</h1>
          <p className="text-muted-foreground">
            上传商品图片，AI 自动生成高质量 3D 模型
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：上传区域 */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">上传商品图片</CardTitle>
                <CardDescription>
                  支持 JPG、PNG、WebP 格式，最大 10MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone
                  onUpload={handleUpload}
                  maxFiles={1}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* 预览图 */}
            {previewUrl && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">原图预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {uploadedFile && generation.status === 'idle' && (
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleGenerate}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  开始生成 3D 模型
                </Button>
              )}

              {isProcessing && (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="flex-1"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {getStatusText()}
                </Button>
              )}

              {generation.status === 'completed' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新生成
                </Button>
              )}

              {generation.status === 'failed' && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                  >
                    重置
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重试
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <Card className="lg:min-h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">生成结果</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>{getStatusText()}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 进度条 */}
              {isProcessing && (
                <div className="mb-4">
                  <Progress value={generation.progress} className="h-2" />
                </div>
              )}

              {/* 3D 模型查看器 */}
              {generation.modelUrl ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
                    <ModelViewer modelUrl={generation.modelUrl} className="w-full h-full" />
                  </div>

                  {/* 缩略图预览 */}
                  {generation.thumbnailUrl && (
                    <div className="flex gap-2">
                      <img
                        src={generation.thumbnailUrl}
                        alt="模型预览"
                        className="w-20 h-20 rounded object-cover border"
                      />
                    </div>
                  )}

                  {/* 下载按钮 */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载 GLB 模型
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (generation.modelUrl) {
                          const viewUrl = (generation.modelUrl.includes('tripo3d.com') || generation.modelUrl.includes('tripo-data'))
                            ? `/api/proxy/model?url=${encodeURIComponent(generation.modelUrl)}`
                            : generation.modelUrl
                          window.open(viewUrl, '_blank')
                        }
                      }}
                    >
                      在新窗口查看
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                      <p className="text-sm">AI 正在生成模型...</p>
                      <p className="text-xs mt-1">预计需要 30-60 秒</p>
                    </>
                  ) : generation.status === 'failed' ? (
                    <>
                      <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
                      <p className="text-sm text-destructive">{generation.error}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <p>上传图片后开始生成</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">💡 使用提示</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 上传清晰的商品图片效果更佳</li>
            <li>• 建议使用白色或纯色背景的图片</li>
            <li>• 生成时间约 30-60 秒，请耐心等待</li>
            <li>• 生成的 GLB 模型可在各种 3D 软件中使用</li>
          </ul>
        </div>
      </div>
    </div>
  )
}