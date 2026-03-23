'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadZone } from '@/components/upload/UploadZone'
import { MultiViewUploadZone, type MultiViewImage } from '@/components/upload/MultiViewUploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, RefreshCw, Loader2, AlertCircle, CheckCircle2, Sparkles, ImageIcon, Layers } from 'lucide-react'
import { StepProgress, type Step, type StepStatus } from '@/components/ui/step-progress'
import { CelebrationEffect } from '@/components/ui/celebration-effect'

type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'failed'
type UploadMode = 'single' | 'multiview'

interface GenerationState {
  status: GenerationStatus
  progress: number
  taskId: string | null
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  startTime: number | null
  stepDurations: Record<string, number>
  taskType?: 'image_to_model' | 'multiview_to_model'
}

export default function GeneratePage() {
  // 上传模式
  const [uploadMode, setUploadMode] = useState<UploadMode>('single')

  // 单图模式状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 多视角模式状态
  const [multiViewImages, setMultiViewImages] = useState<MultiViewImage[]>([])

  // 生成状态
  const [showCelebration, setShowCelebration] = useState(false)
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    taskId: null,
    modelUrl: null,
    thumbnailUrl: null,
    error: null,
    startTime: null,
    stepDurations: {}
  })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // 计算步骤
  const getSteps = (): Step[] => {
    const stepStatus = (stepId: string, activeStatus: GenerationStatus, completeStatuses: GenerationStatus[]): StepStatus => {
      if (completeStatuses.includes(generation.status)) return 'completed'
      if (generation.status === activeStatus) return 'running'
      return 'pending'
    }

    return [
      {
        id: 'upload',
        name: '上传',
        description: '上传产品图片',
        status: stepStatus('upload', 'uploading', ['generating', 'polling', 'completed']),
        duration: generation.stepDurations['upload']
      },
      {
        id: 'analyze',
        name: '分析',
        description: 'AI 分析产品属性',
        status: stepStatus('analyze', 'generating', ['polling', 'completed']),
        duration: generation.stepDurations['analyze']
      },
      {
        id: 'generate',
        name: '生成',
        description: generation.taskType === 'multiview_to_model' ? '多视角生成 3D 模型' : '生成 3D 模型',
        status: stepStatus('generate', 'polling', ['completed']),
        duration: generation.stepDurations['generate']
      },
      {
        id: 'complete',
        name: '完成',
        description: '导出结果',
        status: generation.status === 'completed' ? 'completed' : 'pending',
        duration: generation.stepDurations['complete']
      }
    ]
  }

  // 单图上传处理
  const handleSingleUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    resetGeneration()
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  // 多视角上传处理
  const handleMultiViewUpload = useCallback((images: MultiViewImage[]) => {
    resetGeneration()
    setMultiViewImages(images)
  }, [])

  // 重置生成状态
  const resetGeneration = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setGeneration({
      status: 'idle',
      progress: 0,
      taskId: null,
      modelUrl: null,
      thumbnailUrl: null,
      error: null,
      startTime: null,
      stepDurations: {}
    })
    setShowCelebration(false)
  }, [])

  // 轮询状态
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
        const now = Date.now()
        setGeneration(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          modelUrl: data.modelUrl,
          thumbnailUrl: data.thumbnailUrl,
          stepDurations: {
            ...prev.stepDurations,
            generate: now - (prev.startTime || now)
          }
        }))
        setShowCelebration(true)
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

  // 上传单个文件到服务器
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!uploadRes.ok) {
      const uploadData = await uploadRes.json()
      throw new Error(uploadData.error || '上传失败')
    }

    const uploadData = await uploadRes.json()
    return uploadData.url
  }

  // 单图生成（使用智能分析流程）
  const handleSingleGenerate = useCallback(async () => {
    if (!uploadedFile) return

    const startTime = Date.now()

    try {
      setGeneration(prev => ({ ...prev, status: 'uploading', progress: 5, startTime }))

      // 上传图片
      const imageUrl = await uploadFile(uploadedFile)
      const uploadDuration = Date.now() - startTime

      // 调用智能生成 API（包含产品分析和提示词优化）
      const analyzeStart = Date.now()
      setGeneration(prev => ({
        ...prev,
        status: 'generating',
        progress: 10,
        stepDurations: { ...prev.stepDurations, upload: uploadDuration }
      }))

      const generateRes = await fetch('/api/generate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          taskType: 'image_to_model'
        })
      })

      if (!generateRes.ok) {
        const generateData = await generateRes.json()
        throw new Error(generateData.error || '生成请求失败')
      }

      const generateData = await generateRes.json()
      const taskId = generateData.taskId
      const analyzeDuration = Date.now() - analyzeStart

      // 打印智能分析结果（调试用）
      console.log('[Generate] Smart analysis:', {
        category: generateData.analysis?.category,
        subcategory: generateData.analysis?.subcategory,
        keyFeatures: generateData.analysis?.keyFeatures,
        optimizedPrompt: generateData.optimizedPrompt,
        structuralHints: generateData.structuralHints,
      })

      setGeneration(prev => ({
        ...prev,
        status: 'polling',
        taskId,
        taskType: 'image_to_model',
        progress: 15,
        stepDurations: { ...prev.stepDurations, analyze: analyzeDuration }
      }))

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

  // 多视角生成（使用智能分析流程）
  const handleMultiviewGenerate = useCallback(async () => {
    if (multiViewImages.length < 2) return

    const startTime = Date.now()

    try {
      setGeneration(prev => ({ ...prev, status: 'uploading', progress: 5, startTime }))

      // 上传所有图片
      const uploadPromises = multiViewImages.map(img => uploadFile(img.file))
      const imageUrls = await Promise.all(uploadPromises)
      const uploadDuration = Date.now() - startTime

      // 构建图片数组
      const images = multiViewImages.map((img, index) => ({
        url: imageUrls[index],
        type: img.file.type.split('/')[1] || 'jpg'
      }))

      // 调用智能生成 API
      const analyzeStart = Date.now()
      setGeneration(prev => ({
        ...prev,
        status: 'generating',
        progress: 10,
        stepDurations: { ...prev.stepDurations, upload: uploadDuration }
      }))

      const generateRes = await fetch('/api/generate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          taskType: 'multiview_to_model'
        })
      })

      if (!generateRes.ok) {
        const generateData = await generateRes.json()
        throw new Error(generateData.error || '生成请求失败')
      }

      const generateData = await generateRes.json()
      const taskId = generateData.taskId
      const analyzeDuration = Date.now() - analyzeStart

      // 打印智能分析结果（调试用）
      console.log('[Generate] Smart analysis:', {
        category: generateData.analysis?.category,
        subcategory: generateData.analysis?.subcategory,
        keyFeatures: generateData.analysis?.keyFeatures,
        optimizedPrompt: generateData.optimizedPrompt,
      })

      setGeneration(prev => ({
        ...prev,
        status: 'polling',
        taskId,
        taskType: 'multiview_to_model',
        progress: 15,
        stepDurations: { ...prev.stepDurations, analyze: analyzeDuration }
      }))

      pollingRef.current = setInterval(() => pollStatus(taskId), 3000)

    } catch (error: any) {
      console.error('Generation error:', error)
      setGeneration(prev => ({
        ...prev,
        status: 'failed',
        error: error.message || '生成失败，请重试'
      }))
    }
  }, [multiViewImages, pollStatus])

  // 重置
  const handleReset = useCallback(() => {
    resetGeneration()
    setUploadedFile(null)
    setPreviewUrl(null)
    setMultiViewImages([])
  }, [resetGeneration])

  // 下载
  const handleDownload = useCallback(async () => {
    if (!generation.modelUrl) return

    try {
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
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              AI 3D 模型生成
            </h1>
            <p className="text-muted-foreground">
              上传商品图片，AI 自动生成高质量 3D 模型
            </p>
          </motion.div>

          {/* Step Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-6">
                <StepProgress steps={getSteps()} />
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：上传区域 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">上传商品图片</CardTitle>
                  <CardDescription>
                    选择上传模式：单图快速生成或多视角精准生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 模式切换 */}
                  <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as UploadMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="single" className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        单图模式
                      </TabsTrigger>
                      <TabsTrigger value="multiview" className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        多视角模式
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="mt-0">
                      <UploadZone
                        onUpload={handleSingleUpload}
                        maxFiles={1}
                        disabled={isProcessing}
                      />
                    </TabsContent>

                    <TabsContent value="multiview" className="mt-0">
                      <MultiViewUploadZone
                        onUpload={handleMultiViewUpload}
                        disabled={isProcessing}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 预览图 */}
              <AnimatePresence>
                {uploadMode === 'single' && previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">原图预览</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={previewUrl} alt="预览" className="w-full h-full object-contain" />
                          <AnimatePresence>
                            {generation.status === 'completed' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                              >
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 操作按钮 */}
              <motion.div className="flex gap-3">
                {uploadMode === 'single' && uploadedFile && generation.status === 'idle' && (
                  <Button className="flex-1" size="lg" onClick={handleSingleGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始生成 3D 模型
                  </Button>
                )}

                {uploadMode === 'multiview' && multiViewImages.length >= 2 && generation.status === 'idle' && (
                  <Button className="flex-1" size="lg" onClick={handleMultiviewGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    使用 {multiViewImages.length} 张图片生成
                  </Button>
                )}

                {isProcessing && (
                  <Button variant="outline" size="lg" disabled className="flex-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getStatusText()}
                  </Button>
                )}

                {(generation.status === 'completed' || generation.status === 'failed') && (
                  <Button variant="outline" size="lg" onClick={handleReset} className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重新生成
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* 右侧：生成结果 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="lg:min-h-[600px] bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">生成结果</CardTitle>
                    {getStatusBadge()}
                  </div>
                  <CardDescription>{getStatusText()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 进度条 */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                      >
                        <Progress value={generation.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {generation.taskType === 'multiview_to_model'
                            ? '多视角生成中，预计 60-90 秒'
                            : '预计还需 ' + Math.max(1, Math.round((100 - generation.progress) * 0.5)) + ' 秒'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 3D 模型查看器 */}
                  {generation.modelUrl ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden relative">
                        <ModelViewer modelUrl={ generation.modelUrl} className="w-full h-full" />
                        <div className="absolute inset-0 pointer-events-none border-2 border-green-500/30 rounded-lg animate-pulse" />
                      </div>

                      {generation.thumbnailUrl && (
                        <div className="flex gap-2">
                          <img
                            src={generation.thumbnailUrl}
                            alt="模型预览"
                            className="w-20 h-20 rounded object-cover border"
                          />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button className="flex-1" onClick={handleDownload}>
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
                    </motion.div>
                  ) : (
                    <div className="aspect-square bg-muted/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground relative overflow-hidden">
                      {isProcessing ? (
                        <motion.div className="flex flex-col items-center relative z-10">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-12 h-12 mb-4 text-primary" />
                          </motion.div>
                          <p className="text-sm">AI 正在生成模型...</p>
                          <p className="text-xs mt-1">
                            {generation.taskType === 'multiview_to_model' ? '多视角模式，预计 60-90 秒' : '预计需要 30-60 秒'}
                          </p>
                        </motion.div>
                      ) : generation.status === 'failed' ? (
                        <div className="flex flex-col items-center">
                          <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
                          <p className="text-sm text-destructive">{generation.error}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                            <Sparkles className="w-8 h-8" />
                          </div>
                          <p>上传图片后开始生成</p>
                          <p className="text-xs mt-2 text-muted-foreground">
                            {uploadMode === 'multiview' ? '多视角模式可获得更精准的模型' : '单图模式快速生成'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 提示信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50 backdrop-blur-sm"
          >
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span> 使用提示
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>单图模式：</strong>上传一张清晰的正面图，快速生成 3D 模型</li>
              <li>• <strong>多视角模式：</strong>上传 2-4 张不同角度的照片，生成更精准的模型</li>
              <li>• 建议使用白色或纯色背景的图片，效果更佳</li>
              <li>• 多视角图片请按正/左/背/右顺序上传</li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Celebration Effect */}
      <CelebrationEffect
        isActive={showCelebration}
        duration={4000}
        onComplete={() => setShowCelebration(false)}
        message="生成成功！"
      />
    </div>
  )
}