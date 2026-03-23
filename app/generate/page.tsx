'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ImageIcon, Layers, Loader2, PackageOpen, RefreshCw, Sparkles } from 'lucide-react'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { AssetPackPreview } from '@/components/generate/asset-pack-preview'
import { Phase1PresetCard } from '@/components/generate/phase1-preset-card'
import { UnlockRequestForm, type UnlockRequestSubmitResult } from '@/components/generate/unlock-request-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CelebrationEffect } from '@/components/ui/celebration-effect'
import { Progress } from '@/components/ui/progress'
import { StepProgress, type Step, type StepStatus } from '@/components/ui/step-progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MultiViewUploadZone, type MultiViewImage } from '@/components/upload/MultiViewUploadZone'
import { UploadZone } from '@/components/upload/UploadZone'
import type { Phase1AssetPackSnapshot } from '@/lib/seller-workflow/asset-pack'
import { downloadPhase1AssetPackZip } from '@/lib/seller-workflow/download-asset-pack'

type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'failed'
type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'
type UploadMode = 'single' | 'multiview'
type UnlockState = 'preview_only' | 'requested' | 'approved' | 'rejected' | 'unlocked'
type Platform = 'taobao' | 'xiaohongshu' | 'douyin'

interface GenerationState {
  status: GenerationStatus
  progress: number
  taskId: string | null
  modelId: string | null
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  startTime: number | null
  stepDurations: Record<string, number>
  taskType?: 'image_to_model' | 'multiview_to_model'
}

interface UnlockView {
  currentState: UnlockState
  currentRequestId: string | null
  latestRequestStatus: 'submitted' | 'approved' | 'rejected' | null
  submittedAt?: string
  rejectedAt?: string
  approvedAt?: string
  fulfilledAt?: string
}

interface PersistedModelMetadata {
  workflowType?: string
  category?: string
  presetKey?: string
  uploadMode?: UploadMode
  unlockStatus?: UnlockState
  analysisSummary?: {
    subcategory?: string
    materials?: string[]
    keyFeatures?: string[]
  }
  assetPackPreviewReady?: boolean
  assetPackSnapshotStatus?: 'idle' | 'materializing'
  assetPackSnapshot?: Phase1AssetPackSnapshot
  materializationFailedAt?: string
  materializationError?: string
}

interface PersistedModelDetail {
  id: string
  status: string
  metadata: PersistedModelMetadata | null
  model_3d_url: string | null
  thumbnail_url: string | null
  unlockStatus: UnlockState
  unlockView: UnlockView
  copySummary: {
    taobaoTitle?: string
    xiaohongshuTitle?: string
    douyinHook?: string
  } | null
  strategySummary: {
    recommendedPlatform?: string
    marketingHook?: string
    reasoningSummary?: string
    featureFocus?: string[]
  } | null
}

interface ModelDetailState {
  status: LoadStatus
  model: PersistedModelDetail | null
  error: string | null
}

interface UnlockRequestState {
  status: LoadStatus
  view: UnlockView | null
  error: string | null
}

interface DownloadState {
  status: 'idle' | 'downloading' | 'error'
  error: string | null
}

interface GenerationSession {
  runId: number
  taskId: string | null
}

const initialGenerationState: GenerationState = {
  status: 'idle',
  progress: 0,
  taskId: null,
  modelId: null,
  modelUrl: null,
  thumbnailUrl: null,
  error: null,
  startTime: null,
  stepDurations: {},
}

const initialModelDetailState: ModelDetailState = {
  status: 'idle',
  model: null,
  error: null,
}

const initialUnlockRequestState: UnlockRequestState = {
  status: 'idle',
  view: null,
  error: null,
}

const initialDownloadState: DownloadState = {
  status: 'idle',
  error: null,
}

export default function GeneratePage() {
  const [uploadMode, setUploadMode] = useState<UploadMode>('single')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [multiViewImages, setMultiViewImages] = useState<MultiViewImage[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [generation, setGeneration] = useState<GenerationState>(initialGenerationState)
  const [modelDetailState, setModelDetailState] = useState<ModelDetailState>(initialModelDetailState)
  const [unlockRequestState, setUnlockRequestState] = useState<UnlockRequestState>(initialUnlockRequestState)
  const [downloadState, setDownloadState] = useState<DownloadState>(initialDownloadState)
  const [multiViewZoneKey, setMultiViewZoneKey] = useState(0)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const detailPollingRef = useRef<NodeJS.Timeout | null>(null)
  const generationSessionRef = useRef<GenerationSession>({ runId: 0, taskId: null })
  const pollRequestControllerRef = useRef<AbortController | null>(null)
  const unlockFormRef = useRef<HTMLDivElement | null>(null)

  const clearRuntimeTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    if (detailPollingRef.current) {
      clearTimeout(detailPollingRef.current)
      detailPollingRef.current = null
    }

    if (pollRequestControllerRef.current) {
      pollRequestControllerRef.current.abort()
      pollRequestControllerRef.current = null
    }
  }, [])

  const isCurrentGenerationSession = useCallback((runId: number, taskId?: string | null) => {
    const currentSession = generationSessionRef.current
    if (currentSession.runId !== runId) {
      return false
    }

    if (typeof taskId === 'undefined') {
      return true
    }

    return currentSession.taskId === taskId
  }, [])

  useEffect(() => {
    return () => {
      clearRuntimeTimers()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [clearRuntimeTimers, previewUrl])

  const getSteps = (): Step[] => {
    const stepStatus = (
      activeStatus: GenerationStatus,
      completeStatuses: GenerationStatus[]
    ): StepStatus => {
      if (completeStatuses.includes(generation.status)) return 'completed'
      if (generation.status === activeStatus) return 'running'
      return 'pending'
    }

    return [
      {
        id: 'upload',
        name: '上传',
        description: '上传包袋 / 小皮具图片',
        status: stepStatus('uploading', ['generating', 'polling', 'completed']),
        duration: generation.stepDurations.upload,
      },
      {
        id: 'analyze',
        name: '识别',
        description: '识别包型、材质和卖点',
        status: stepStatus('generating', ['polling', 'completed']),
        duration: generation.stepDurations.analyze,
      },
      {
        id: 'generate',
        name: '整理',
        description:
          generation.taskType === 'multiview_to_model'
            ? '生成 3D 底模并整理多平台素材预览'
            : '生成 3D 底模并整理素材预览',
        status: stepStatus('polling', ['completed']),
        duration: generation.stepDurations.generate,
      },
      {
        id: 'complete',
        name: '交付',
        description: '查看素材包预览并进入解锁',
        status: generation.status === 'completed' ? 'completed' : 'pending',
        duration: generation.stepDurations.complete,
      },
    ]
  }

  const resetGeneration = useCallback(() => {
    generationSessionRef.current = {
      runId: generationSessionRef.current.runId + 1,
      taskId: null,
    }
    clearRuntimeTimers()
    setGeneration(initialGenerationState)
    setModelDetailState(initialModelDetailState)
    setUnlockRequestState(initialUnlockRequestState)
    setDownloadState(initialDownloadState)
    setShowCelebration(false)
  }, [clearRuntimeTimers])

  const fetchUnlockState = useCallback(async (modelId: string, silent = false, runId?: number) => {
    if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
      return
    }

    if (!silent) {
      setUnlockRequestState((prev) => ({
        ...prev,
        status: 'loading',
        error: null,
      }))
    }

    try {
      const response = await fetch(`/api/unlock-requests?modelId=${encodeURIComponent(modelId)}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取解锁状态失败')
      }

      if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
        return
      }

      setUnlockRequestState({
        status: 'ready',
        view: data.unlockView,
        error: null,
      })
    } catch (error: any) {
      if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
        return
      }

      setUnlockRequestState((prev) => ({
        status: 'error',
        view: prev.view,
        error: error?.message || '获取解锁状态失败',
      }))
    }
  }, [isCurrentGenerationSession])

  const fetchModelDetail = useCallback(async (modelId: string, attempt = 0, runId?: number) => {
    if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
      return
    }

    if (attempt === 0) {
      setModelDetailState((prev) => ({
        status: 'loading',
        model: prev.model,
        error: null,
      }))
    }

    try {
      const response = await fetch(`/api/models?id=${encodeURIComponent(modelId)}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取素材包详情失败')
      }

      if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
        return
      }

      const model = data.model as PersistedModelDetail
      const previewReady = Boolean(
        model.metadata?.assetPackPreviewReady && model.metadata?.assetPackSnapshot
      )

      setModelDetailState({
        status: 'ready',
        model,
        error: null,
      })

      setUnlockRequestState((prev) => ({
        status: prev.status === 'error' ? 'ready' : prev.status === 'idle' ? 'ready' : prev.status,
        view: model.unlockView,
        error: null,
      }))

      if (!previewReady && attempt < 4) {
        detailPollingRef.current = setTimeout(() => {
          void fetchModelDetail(modelId, attempt + 1, runId)
        }, 2500)
      }
    } catch (error: any) {
      if (typeof runId === 'number' && !isCurrentGenerationSession(runId)) {
        return
      }

      setModelDetailState((prev) => ({
        status: 'error',
        model: prev.model,
        error: error?.message || '获取素材包详情失败',
      }))
    }
  }, [isCurrentGenerationSession])

  const refreshPersistedResult = useCallback(async (modelId: string, runId?: number) => {
    clearRuntimeTimers()
    await Promise.all([
      fetchModelDetail(modelId, 0, runId),
      fetchUnlockState(modelId, true, runId),
    ])
  }, [clearRuntimeTimers, fetchModelDetail, fetchUnlockState])

  const pollStatus = useCallback(async (taskId: string, runId: number) => {
    if (!isCurrentGenerationSession(runId, taskId)) {
      return
    }

    pollRequestControllerRef.current?.abort()
    const controller = new AbortController()
    pollRequestControllerRef.current = controller

    try {
      const response = await fetch(`/api/tripo/status/${taskId}`, {
        cache: 'no-store',
        signal: controller.signal,
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取生成状态失败')
      }

      if (!isCurrentGenerationSession(runId, taskId)) {
        return
      }

      setGeneration((prev) => ({
        ...prev,
        progress: data.progress || prev.progress,
        modelId: data.modelId || prev.modelId,
      }))

      if (data.status === 'success') {
        clearRuntimeTimers()

        const now = Date.now()
        const resolvedModelId = data.modelId || generation.modelId

        generationSessionRef.current = {
          runId,
          taskId,
        }

        setGeneration((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          modelId: resolvedModelId || prev.modelId,
          modelUrl: data.modelUrl || prev.modelUrl,
          thumbnailUrl: data.thumbnailUrl || prev.thumbnailUrl,
          stepDurations: {
            ...prev.stepDurations,
            generate: now - (prev.startTime || now),
            complete: 0,
          },
        }))

        if (resolvedModelId) {
          await refreshPersistedResult(resolvedModelId, runId)
        }

        if (isCurrentGenerationSession(runId, taskId)) {
          setShowCelebration(true)
        }
      } else if (data.status === 'failed') {
        clearRuntimeTimers()
        setGeneration((prev) => ({
          ...prev,
          status: 'failed',
          error: data.error || '生成失败',
        }))
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return
      }

      if (!isCurrentGenerationSession(runId, taskId)) {
        return
      }

      console.error('Poll error:', error)
      setGeneration((prev) => ({
        ...prev,
        status: 'failed',
        error: error?.message || '获取生成状态失败',
      }))
      clearRuntimeTimers()
    } finally {
      if (pollRequestControllerRef.current === controller) {
        pollRequestControllerRef.current = null
      }
    }
  }, [clearRuntimeTimers, generation.modelId, isCurrentGenerationSession, refreshPersistedResult])

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || '上传失败')
    }

    const data = await response.json()
    return data.url
  }

  const handleSingleUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    resetGeneration()
    setUploadedFile(file)
    setMultiViewImages([])
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return URL.createObjectURL(file)
    })
  }, [resetGeneration])

  const handleMultiViewUpload = useCallback((images: MultiViewImage[]) => {
    resetGeneration()
    setUploadedFile(null)
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return null
    })
    setMultiViewImages(images)
  }, [resetGeneration])

  const handleSingleGenerate = useCallback(async () => {
    if (!uploadedFile) return

    const runId = generationSessionRef.current.runId
    const startTime = Date.now()

    try {
      setGeneration((prev) => ({
        ...prev,
        status: 'uploading',
        progress: 5,
        startTime,
      }))

      const imageUrl = await uploadFile(uploadedFile)
      if (!isCurrentGenerationSession(runId)) {
        return
      }

      const uploadDuration = Date.now() - startTime

      const analyzeStart = Date.now()
      setGeneration((prev) => ({
        ...prev,
        status: 'generating',
        progress: 12,
        stepDurations: { ...prev.stepDurations, upload: uploadDuration },
      }))

      const response = await fetch('/api/generate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          taskType: 'image_to_model',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '生成请求失败')
      }

      if (!isCurrentGenerationSession(runId)) {
        return
      }

      const analyzeDuration = Date.now() - analyzeStart

      setGeneration((prev) => ({
        ...prev,
        status: 'polling',
        progress: 18,
        taskId: data.taskId,
        modelId: data.modelId,
        taskType: 'image_to_model',
        stepDurations: { ...prev.stepDurations, analyze: analyzeDuration },
      }))

      generationSessionRef.current = {
        runId,
        taskId: data.taskId,
      }

      pollingRef.current = setInterval(() => {
        void pollStatus(data.taskId, runId)
      }, 3000)
    } catch (error: any) {
      setGeneration((prev) => ({
        ...prev,
        status: 'failed',
        error: error?.message || '生成失败，请重试',
      }))
    }
  }, [isCurrentGenerationSession, pollStatus, uploadedFile])

  const handleMultiviewGenerate = useCallback(async () => {
    if (multiViewImages.length < 2) return

    const runId = generationSessionRef.current.runId
    const startTime = Date.now()

    try {
      setGeneration((prev) => ({
        ...prev,
        status: 'uploading',
        progress: 5,
        startTime,
      }))

      const imageUrls = await Promise.all(multiViewImages.map((image) => uploadFile(image.file)))
      if (!isCurrentGenerationSession(runId)) {
        return
      }

      const uploadDuration = Date.now() - startTime

      const analyzeStart = Date.now()
      setGeneration((prev) => ({
        ...prev,
        status: 'generating',
        progress: 12,
        stepDurations: { ...prev.stepDurations, upload: uploadDuration },
      }))

      const response = await fetch('/api/generate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: multiViewImages.map((image, index) => ({
            url: imageUrls[index],
            type: image.file.type.split('/')[1] || 'jpg',
          })),
          taskType: 'multiview_to_model',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '生成请求失败')
      }

      if (!isCurrentGenerationSession(runId)) {
        return
      }

      const analyzeDuration = Date.now() - analyzeStart

      setGeneration((prev) => ({
        ...prev,
        status: 'polling',
        progress: 18,
        taskId: data.taskId,
        modelId: data.modelId,
        taskType: 'multiview_to_model',
        stepDurations: { ...prev.stepDurations, analyze: analyzeDuration },
      }))

      generationSessionRef.current = {
        runId,
        taskId: data.taskId,
      }

      pollingRef.current = setInterval(() => {
        void pollStatus(data.taskId, runId)
      }, 3000)
    } catch (error: any) {
      setGeneration((prev) => ({
        ...prev,
        status: 'failed',
        error: error?.message || '生成失败，请重试',
      }))
    }
  }, [isCurrentGenerationSession, multiViewImages, pollStatus])

  const handleReset = useCallback(() => {
    resetGeneration()
    setUploadedFile(null)
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return null
    })
    setMultiViewImages([])
    setMultiViewZoneKey((prev) => prev + 1)
  }, [resetGeneration])

  const handleUnlockSubmitted = useCallback(async (result: UnlockRequestSubmitResult) => {
    const activeModelId = generation.modelId || modelDetailState.model?.id
    const runId = generationSessionRef.current.runId

    if (result.unlockView) {
      if (!isCurrentGenerationSession(runId)) {
        return
      }

      setUnlockRequestState({
        status: 'ready',
        view: result.unlockView,
        error: null,
      })
    }

    if (activeModelId) {
      if (!isCurrentGenerationSession(runId)) {
        return
      }

      await Promise.all([
        fetchUnlockState(activeModelId, true, runId),
        fetchModelDetail(activeModelId, 0, runId),
      ])
    }
  }, [fetchModelDetail, fetchUnlockState, generation.modelId, isCurrentGenerationSession, modelDetailState.model?.id])

  const isProcessing = ['uploading', 'generating', 'polling'].includes(generation.status)
  const currentModelId = generation.modelId || modelDetailState.model?.id || null
  const currentUnlockView = unlockRequestState.view || modelDetailState.model?.unlockView || null
  const currentUnlockState = currentUnlockView?.currentState || modelDetailState.model?.unlockStatus || 'preview_only'
  const resolvedModelUrl = modelDetailState.model?.model_3d_url || generation.modelUrl
  const resolvedThumbnailUrl =
    modelDetailState.model?.thumbnail_url || generation.thumbnailUrl || previewUrl
  const assetPackSnapshot = modelDetailState.model?.metadata?.assetPackSnapshot || null
  const platformAssets = modelDetailState.model?.metadata?.assetPackSnapshot?.manifest?.assets || []
  const assetPackReady = Boolean(
    modelDetailState.model?.metadata?.assetPackPreviewReady && assetPackSnapshot
  )
  const canDownloadFullPack =
    currentUnlockState === 'unlocked' && assetPackReady && Boolean(currentModelId) && Boolean(assetPackSnapshot)
  const canOpenUnlockForm = generation.status === 'completed' && assetPackReady && Boolean(currentModelId)
  const canRequestUnlock =
    canOpenUnlockForm && (currentUnlockState === 'preview_only' || currentUnlockState === 'rejected')
  const handleOpenUnlockForm = useCallback(() => {
    if (!canOpenUnlockForm) {
      return
    }

    unlockFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [canOpenUnlockForm])

  const handleDownloadFullPack = useCallback(async () => {
    if (!currentModelId || !assetPackSnapshot || !canDownloadFullPack) {
      return
    }

    setDownloadState({
      status: 'downloading',
      error: null,
    })

    try {
      await downloadPhase1AssetPackZip({
        modelId: currentModelId,
        snapshot: {
          ...assetPackSnapshot,
          manifest: {
            ...assetPackSnapshot.manifest,
            model: {
              ...assetPackSnapshot.manifest.model,
              downloadUrl: resolvedModelUrl || assetPackSnapshot.manifest.model.downloadUrl,
            },
          },
        },
      })
      setDownloadState({
        status: 'idle',
        error: null,
      })
    } catch (error: any) {
      setDownloadState({
        status: 'error',
        error: error?.message || '完整素材包下载失败，请稍后再试。',
      })
    }
  }, [assetPackSnapshot, canDownloadFullPack, currentModelId, resolvedModelUrl])

  const getStatusBadge = () => {
    switch (generation.status) {
      case 'uploading':
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            上传中
          </Badge>
        )
      case 'generating':
        return (
          <Badge variant="secondary">
            <Sparkles className="mr-1 h-3 w-3" />
            识别中
          </Badge>
        )
      case 'polling':
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            整理素材包
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            可预览
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            失败
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            <PackageOpen className="mr-1 h-3 w-3" />
            Phase 1
          </Badge>
        )
    }
  }

  const getStatusText = () => {
    switch (generation.status) {
      case 'uploading':
        return '正在上传包袋图片...'
      case 'generating':
        return '正在识别包型、材质与卖点...'
      case 'polling':
        return `正在生成 3D 底模并整理素材包预览... ${generation.progress}%`
      case 'completed':
        return '素材包预览已生成，可按当前解锁状态继续下一步。'
      case 'failed':
        return generation.error || '生成失败'
      default:
        return '上传图片后生成卖家素材包预览'
    }
  }

  const renderResultPlaceholder = () => {
    if (generation.status === 'failed') {
      return (
        <div className="rounded-3xl border border-destructive/25 bg-destructive/10 p-6 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">这次素材包生成没有完成</p>
              <p className="mt-2 leading-6 text-destructive/90">{generation.error}</p>
            </div>
          </div>
        </div>
      )
    }

    if (isProcessing || generation.status === 'completed' || Boolean(currentModelId)) {
      return (
        <div className="space-y-4">
          <AssetPackPreview
            previewFallbackUrl={resolvedThumbnailUrl}
            platformAssets={platformAssets}
            copySummary={modelDetailState.model?.copySummary}
            strategySummary={modelDetailState.model?.strategySummary}
            unlockView={currentUnlockView}
            isLoading={isProcessing || modelDetailState.status === 'loading'}
            isReady={assetPackReady}
            isDownloadReady={canDownloadFullPack}
            isDownloading={downloadState.status === 'downloading'}
            onRequestUnlock={canOpenUnlockForm ? handleOpenUnlockForm : undefined}
            onDownloadFullPack={canDownloadFullPack ? handleDownloadFullPack : undefined}
          />
          {downloadState.error && (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {downloadState.error}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <PackageOpen className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">生成后的主结果会是卖家素材包预览</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          这里会展示淘宝主图、小红书封面、抖音竖图、文案摘要、策略摘要和当前解锁状态。
          3D 底模仍然保留，但它会退到辅助信息位。
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
              Phase 1 Seller Asset Pack
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">卖家素材包生成台</h1>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              先聚焦包袋 / 小皮具。上传一组图片，系统会生成 3D 底模并整理淘宝主图、小红书封面、
              抖音竖图与平台文案预览，再进入解锁交付流程。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Phase1PresetCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-6">
                <StepProgress steps={getSteps()} />
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">上传商品图片</CardTitle>
                  <CardDescription>
                    单图适合快速起稿；包袋更推荐多视角，更容易保留包型比例、五金与容量感。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={uploadMode}
                    onValueChange={(value) => setUploadMode(value as UploadMode)}
                    className="w-full"
                  >
                    <TabsList className="mb-4 grid w-full grid-cols-2">
                      <TabsTrigger value="single" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        单图起稿
                      </TabsTrigger>
                      <TabsTrigger value="multiview" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        多视角推荐
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="mt-0">
                      <UploadZone onUpload={handleSingleUpload} maxFiles={1} disabled={isProcessing} />
                    </TabsContent>

                    <TabsContent value="multiview" className="mt-0">
                      <MultiViewUploadZone
                        key={multiViewZoneKey}
                        onUpload={handleMultiViewUpload}
                        disabled={isProcessing}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <AnimatePresence>
                {uploadMode === 'single' && previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">主图预览</CardTitle>
                        <CardDescription>
                          单图会先生成一版素材包预览，确认方向后再决定是否解锁完整交付。
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                          <img src={previewUrl} alt="上传预览" className="h-full w-full object-contain" />
                          <AnimatePresence>
                            {generation.status === 'completed' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-emerald-500/20"
                              >
                                <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="flex gap-3">
                {uploadMode === 'single' && uploadedFile && generation.status === 'idle' && (
                  <Button className="flex-1" size="lg" onClick={handleSingleGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成素材包预览
                  </Button>
                )}

                {uploadMode === 'multiview' && multiViewImages.length >= 2 && generation.status === 'idle' && (
                  <Button className="flex-1" size="lg" onClick={handleMultiviewGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    使用 {multiViewImages.length} 张图生成素材包
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 }}
              className="space-y-4"
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">素材包结果</CardTitle>
                      <CardDescription>{getStatusText()}</CardDescription>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <Progress value={generation.progress} className="h-2" />
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          {generation.taskType === 'multiview_to_model'
                            ? '多视角模式正在整理更完整的包型与细节，预计 60-90 秒'
                            : `正在整理首版素材包预览，预计还需 ${Math.max(1, Math.round((100 - generation.progress) * 0.5))} 秒`}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {renderResultPlaceholder()}

                  {resolvedModelUrl && (
                    <div className="rounded-3xl border border-white/10 bg-background/35 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">3D 底模预览</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            3D 仅作为素材包的辅助底模参考，不再作为页面主交付物。
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!resolvedModelUrl) return
                            const viewUrl =
                              resolvedModelUrl.includes('tripo3d.com') || resolvedModelUrl.includes('tripo-data')
                                ? `/api/proxy/model?url=${encodeURIComponent(resolvedModelUrl)}`
                                : resolvedModelUrl
                            window.open(viewUrl, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          查看底模
                        </Button>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <div className="aspect-square">
                          <ModelViewer modelUrl={resolvedModelUrl} className="h-full w-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {modelDetailState.error && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                      素材包详情拉取异常：{modelDetailState.error}
                    </div>
                  )}

                  {unlockRequestState.error && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                      解锁状态同步异常：{unlockRequestState.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentModelId && canRequestUnlock && (
                <div ref={unlockFormRef}>
                  <UnlockRequestForm
                    modelId={currentModelId}
                    currentState={currentUnlockState}
                    onSubmitted={handleUnlockSubmitted}
                  />
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-3xl border border-border/50 bg-muted/30 p-5 backdrop-blur-sm"
          >
            <h3 className="mb-3 font-medium text-foreground">Phase 1 使用提示</h3>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              <li>当前只支持包袋 / 小皮具，不是报错限制，而是先把最常用卖家素材工作流做深。</li>
              <li>单图适合快速验证方向；包袋更推荐多视角，尤其适合保留侧边厚度、提手和五金细节。</li>
              <li>结果主区会先展示素材包预览与解锁状态，3D 底模会作为辅助信息保留在下方。</li>
              <li>未解锁时只开放预览和申请；已解锁时会切到完整素材包交付入口，即使 ZIP 仍在接通中也不会退回 GLB 主按钮。</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <CelebrationEffect
        isActive={showCelebration}
        duration={4000}
        onComplete={() => setShowCelebration(false)}
        message="素材包预览已生成"
      />
    </div>
  )
}
