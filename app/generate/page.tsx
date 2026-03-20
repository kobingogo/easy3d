'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadZone } from '@/components/upload/UploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Loader2, AlertCircle, CheckCircle2, Sparkles, Upload, Search, Cpu } from 'lucide-react'
import { StepProgress, type Step, type StepStatus } from '@/components/ui/step-progress'
import { CelebrationEffect } from '@/components/ui/celebration-effect'

type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'failed'

interface GenerationState {
  status: GenerationStatus
  progress: number
  taskId: string | null
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  startTime: number | null
  stepDurations: Record<string, number>
}

export default function GeneratePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

  // Calculate steps based on generation status
  const getSteps = (): Step[] => {
    const now = Date.now()
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
        description: '生成 3D 模型',
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
      error: null,
      startTime: null,
      stepDurations: {}
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

  const handleGenerate = useCallback(async () => {
    if (!uploadedFile) return

    const startTime = Date.now()

    try {
      // 1. 上传图片
      setGeneration(prev => ({ ...prev, status: 'uploading', progress: 5, startTime }))

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
      const uploadDuration = Date.now() - startTime

      // 2. 调用 Tripo API
      const analyzeStart = Date.now()
      setGeneration(prev => ({
        ...prev,
        status: 'generating',
        progress: 10,
        stepDurations: { ...prev.stepDurations, upload: uploadDuration }
      }))

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
      const analyzeDuration = Date.now() - analyzeStart

      setGeneration(prev => ({
        ...prev,
        status: 'polling',
        taskId,
        progress: 15,
        stepDurations: { ...prev.stepDurations, analyze: analyzeDuration }
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
    setShowCelebration(false)
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
  }, [])

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
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

        {/* Grid pattern */}
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

        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
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
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <motion.div
                      animate={generation.status === 'idle' ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="h-5 w-5 text-primary" />
                    </motion.div>
                    上传商品图片
                  </CardTitle>
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
              <AnimatePresence>
                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
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
                          {/* Success overlay */}
                          <AnimatePresence>
                            {generation.status === 'completed' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', damping: 10 }}
                                >
                                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                                </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3"
              >
                {uploadedFile && generation.status === 'idle' && (
                  <Button
                    className="flex-1 group relative overflow-hidden"
                    size="lg"
                    onClick={handleGenerate}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                    />
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
                          预计还需 {Math.max(1, Math.round((100 - generation.progress) * 0.5))} 秒
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
                        <ModelViewer modelUrl={generation.modelUrl} className="w-full h-full" />

                        {/* Success glow effect */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-green-500/30 rounded-lg animate-pulse" />
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
                          className="flex-1 group"
                          onClick={handleDownload}
                        >
                          <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
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
                      {/* Background animation for processing state */}
                      {isProcessing && (
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            background: [
                              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.05) 0%, transparent 50%)',
                              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.1) 0%, transparent 60%)',
                              'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.05) 0%, transparent 50%)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {isProcessing ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center relative z-10"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-12 h-12 mb-4 text-primary" />
                          </motion.div>
                          <p className="text-sm">AI 正在生成模型...</p>
                          <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs mt-1"
                          >
                            预计需要 30-60 秒
                          </motion.p>
                        </motion.div>
                      ) : generation.status === 'failed' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            animate={{ x: [0, -5, 5, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
                          </motion.div>
                          <p className="text-sm text-destructive">{generation.error}</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            className="w-16 h-16 mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center relative"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Sparkles className="w-8 h-8" />
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-primary/20"
                              animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <p>上传图片后开始生成</p>
                        </motion.div>
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
              <li>• 上传清晰的商品图片效果更佳</li>
              <li>• 建议使用白色或纯色背景的图片</li>
              <li>• 生成时间约 30-60 秒，请耐心等待</li>
              <li>• 生成的 GLB 模型可在各种 3D 软件中使用</li>
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