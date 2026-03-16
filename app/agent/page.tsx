'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ModelViewer } from '@/components/3d/ModelViewer'
import {
  Cpu, Zap, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight,
  Play, RefreshCw, StopCircle, Download, Box, ExternalLink,
  AlertTriangle, ThumbsUp, ThumbsDown
} from 'lucide-react'

interface Tool {
  name: string
  description: string
  parameters: any
}

interface PlanStep {
  id: string
  tool: string
  description: string
  input: Record<string, any>
  dependencies: string[]
}

interface Plan {
  reasoning: string
  steps: PlanStep[]
  estimatedTime: number
}

interface StepResult {
  stepId: string
  status: 'pending' | 'success' | 'failed'
  data?: any
  error?: { code: string; message: string; recoverable: boolean }
}

interface WorkflowStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  startedAt: string
  completedAt?: string
  error?: string
  results: StepResult[]
  workflow?: {
    trace?: {
      totalDuration: number
      totalTokens: number
      totalCost: number
      steps: Array<{
        stepId: string
        toolName: string
        status: string
        duration: number
        tokensUsed: number
      }>
    }
  }
}

export default function AgentPage() {
  const [userInput, setUserInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // 加载工具列表
  useEffect(() => {
    fetch('/api/agent?action=tools')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTools(data.tools)
        }
      })
      .catch(console.error)
  }, [])

  // 轮询工作流状态
  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agent?workflowId=${id}`)
      const data = await res.json()

      if (data.success) {
        setWorkflowStatus(data)

        // 完成或失败时停止轮询
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [])

  // 启动轮询
  useEffect(() => {
    if (workflowId && workflowStatus?.status === 'running') {
      pollingRef.current = setInterval(() => pollStatus(workflowId), 2000)
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [workflowId, workflowStatus?.status, pollStatus])

  // 启动异步工作流
  const handleStart = async () => {
    if (!userInput.trim()) return

    setPlan(null)
    setWorkflowId(null)
    setWorkflowStatus(null)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userInput,
          imageUrl: imageUrl || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        setPlan(data.plan)
        setWorkflowId(data.workflowId)
        setWorkflowStatus({
          id: data.workflowId,
          status: 'pending',
          currentStep: 0,
          totalSteps: data.plan.steps.length,
          startedAt: new Date().toISOString(),
          results: []
        })
        // 立即查询一次状态
        setTimeout(() => pollStatus(data.workflowId), 500)
      } else {
        console.error('Start error:', data.error)
      }
    } catch (error) {
      console.error('Request error:', error)
    }
  }

  // 取消工作流
  const handleCancel = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setWorkflowId(null)
    setWorkflowStatus(null)
  }

  // 重新执行
  const handleRetry = () => {
    handleStart()
  }

  // 切换步骤展开状态
  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  // 获取工具图标
  const getToolIcon = (toolName: string) => {
    const icons: Record<string, string> = {
      analyze_product: '🔍',
      optimize_prompt: '✨',
      generate_3d: '🎮',
      quality_check: '✅',
      export_model: '📦'
    }
    return icons[toolName] || '🔧'
  }

  // 获取工具名称中文
  const getToolName = (toolName: string) => {
    const names: Record<string, string> = {
      analyze_product: '商品分析',
      optimize_prompt: '提示词优化',
      generate_3d: '3D 生成',
      quality_check: '质量检查',
      export_model: '模型导出'
    }
    return names[toolName] || toolName
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '等待中', variant: 'secondary' },
      running: { label: '执行中', variant: 'default' },
      completed: { label: '已完成', variant: 'outline' },
      failed: { label: '失败', variant: 'destructive' }
    }
    const { label, variant } = config[status] || { label: status, variant: 'secondary' }
    return <Badge variant={variant}>{label}</Badge>
  }

  // 计算进度
  const getProgress = () => {
    if (!workflowStatus) return 0
    const completedSteps = workflowStatus.results?.filter(r => r.status === 'success' || r.status === 'failed').length || 0
    return Math.round((completedSteps / workflowStatus.totalSteps) * 100)
  }

  // 格式化时间
  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : Date.now()
    const seconds = Math.round((endTime - startTime) / 1000)
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  // 获取生成的 3D 模型数据
  const getGeneratedModel = useCallback(() => {
    if (!workflowStatus?.results) return null

    const generateStep = workflowStatus.results.find(
      r => r.status === 'success' && r.data?.modelUrl
    )

    return generateStep?.data || null
  }, [workflowStatus?.results])

  // 获取质量检查结果
  const getQualityResult = useCallback(() => {
    if (!workflowStatus?.results) return null

    const qualityStep = workflowStatus.results.find(
      r => r.stepId === 'step_4' && r.status === 'success'
    )

    return qualityStep?.data || null
  }, [workflowStatus?.results])

  // 下载模型
  const handleDownloadModel = useCallback(async () => {
    const modelData = getGeneratedModel()
    if (!modelData?.modelUrl) return

    try {
      const downloadUrl = (modelData.modelUrl.includes('tripo3d.com') || modelData.modelUrl.includes('tripo-data'))
        ? `/api/proxy/model?url=${encodeURIComponent(modelData.modelUrl)}`
        : modelData.modelUrl

      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `3d-model-${Date.now()}.glb`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }, [getGeneratedModel])

  const isRunning = workflowStatus?.status === 'running' || workflowStatus?.status === 'pending'
  const modelData = getGeneratedModel()
  const qualityResult = getQualityResult()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Agent 控制台</h1>
        <p className="text-muted-foreground mb-8">
          输入一句话，Agent 自动完成 3D 生成全流程（含质量检查）
        </p>

        <Tabs defaultValue="console" className="space-y-6">
          <TabsList>
            <TabsTrigger value="console">控制台</TabsTrigger>
            <TabsTrigger value="tools">工具列表</TabsTrigger>
          </TabsList>

          <TabsContent value="console" className="space-y-6">
            {/* 输入区域 */}
            <Card>
              <CardHeader>
                <CardTitle>输入任务</CardTitle>
                <CardDescription>
                  用自然语言描述你的需求，Agent 会自动规划并执行
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    className="w-full min-h-[100px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="例如：帮我生成一个适合小红书的女包 3D 展示"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isRunning}
                  />
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="商品图片 URL（可选）"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isRunning}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleStart}
                      disabled={isRunning || !userInput.trim()}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          执行中...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          开始执行
                        </>
                      )}
                    </Button>
                    {isRunning && (
                      <Button variant="outline" onClick={handleCancel}>
                        <StopCircle className="mr-2 h-4 w-4" />
                        取消
                      </Button>
                    )}
                    {workflowStatus?.status === 'failed' && (
                      <Button variant="secondary" onClick={handleRetry}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重试
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 执行进度 */}
            {workflowStatus && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      执行进度
                    </CardTitle>
                    {getStatusBadge(workflowStatus.status)}
                  </div>
                  <CardDescription>
                    {workflowStatus.status === 'running' ? (
                      <>正在执行第 {workflowStatus.currentStep + 1} / {workflowStatus.totalSteps} 步</>
                    ) : workflowStatus.status === 'completed' ? (
                      <>完成！耗时 {formatDuration(workflowStatus.startedAt, workflowStatus.completedAt)}</>
                    ) : workflowStatus.status === 'failed' ? (
                      workflowStatus.error || '执行失败'
                    ) : (
                      '等待执行...'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={getProgress()} className="mb-4" />
                  {workflowStatus.workflow?.trace && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Token: {workflowStatus.workflow.trace.totalTokens}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 执行计划 */}
            {plan && (
              <Card>
                <CardHeader>
                  <CardTitle>执行计划</CardTitle>
                  <CardDescription>
                    预估时间：{plan.estimatedTime} 秒
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{plan.reasoning}</p>
                  <div className="space-y-2">
                    {plan.steps.map((step, index) => {
                      const result = workflowStatus?.results?.find(r => r.stepId === step.id)
                      const isCurrentStep = workflowStatus?.currentStep === index && workflowStatus?.status === 'running'

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isCurrentStep ? 'bg-primary/10 border border-primary/30' :
                            result?.status === 'success' ? 'bg-green-500/10' :
                            result?.status === 'failed' ? 'bg-red-500/10' :
                            'bg-muted/50'
                          }`}
                        >
                          <span className="text-lg">{getToolIcon(step.tool)}</span>
                          <div className="flex-1">
                            <p className="font-medium">{step.description}</p>
                            <p className="text-xs text-muted-foreground">{getToolName(step.tool)}</p>
                          </div>
                          {isCurrentStep && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                          {result?.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {result?.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 质量检查结果 */}
            {workflowStatus?.status === 'completed' && qualityResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {qualityResult.typeMatch?.matched ? (
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    质量检查结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 类型匹配 */}
                    {qualityResult.typeMatch && (
                      <div className={`p-4 rounded-lg ${qualityResult.typeMatch.matched ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {qualityResult.typeMatch.matched ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="font-medium">
                            {qualityResult.typeMatch.matched ? '类型匹配' : '类型不匹配'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>预期类型：{qualityResult.typeMatch.expectedType}</p>
                          <p>检测类型：{qualityResult.typeMatch.detectedType}</p>
                          <p>置信度：{Math.round(qualityResult.typeMatch.confidence * 100)}%</p>
                        </div>
                      </div>
                    )}

                    {/* 质量分数 */}
                    <div className="grid grid-cols-4 gap-4">
                      {qualityResult.dimensions && Object.entries(qualityResult.dimensions).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold">{value as number}</div>
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* 综合评分 */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>综合评分</span>
                      <span className="text-2xl font-bold">{qualityResult.overallScore}</span>
                    </div>

                    {/* 建议 */}
                    {qualityResult.recommendation && (
                      <p className="text-sm text-muted-foreground">{qualityResult.recommendation}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3D 模型预览 */}
            {workflowStatus?.status === 'completed' && modelData?.modelUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    3D 模型预览
                  </CardTitle>
                  <CardDescription>
                    模型已生成完成，可以在线预览或下载
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
                      <ModelViewer modelUrl={modelData.modelUrl} className="w-full h-full" />
                    </div>

                    {/* 缩略图 */}
                    {modelData.thumbnailUrl && (
                      <div className="flex gap-2">
                        <img
                          src={modelData.thumbnailUrl}
                          alt="模型缩略图"
                          className="w-20 h-20 rounded object-cover border"
                        />
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handleDownloadModel}>
                        <Download className="mr-2 h-4 w-4" />
                        下载 GLB 模型
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const viewUrl = (modelData.modelUrl.includes('tripo3d.com') || modelData.modelUrl.includes('tripo-data'))
                            ? `/api/proxy/model?url=${encodeURIComponent(modelData.modelUrl)}`
                            : modelData.modelUrl
                          window.open(viewUrl, '_blank')
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        新窗口查看
                      </Button>
                    </div>

                    {/* 模型信息 */}
                    <div className="text-sm text-muted-foreground">
                      <p>生成模式：{modelData.mode === 'image_to_model' ? '图片转3D' : '文字转3D'}</p>
                      {modelData.taskId && <p>任务 ID：{modelData.taskId}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 执行结果详情 */}
            {workflowStatus?.results && workflowStatus.results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>执行结果详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflowStatus.results.map((result) => {
                      const step = plan?.steps.find(s => s.id === result.stepId)
                      return (
                        <div key={result.stepId} className="border rounded-lg">
                          <button
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
                            onClick={() => toggleStep(result.stepId)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedSteps.has(result.stepId) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              {step && <span>{getToolIcon(step.tool)}</span>}
                              <span className="font-medium">{step?.description || result.stepId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.status === 'success' && <Badge variant="outline" className="text-green-600">成功</Badge>}
                              {result.status === 'failed' && <Badge variant="destructive">失败</Badge>}
                            </div>
                          </button>
                          {expandedSteps.has(result.stepId) && (
                            <div className="p-3 pt-0 border-t bg-muted/30">
                              {result.error ? (
                                <div className="text-sm">
                                  <p className="text-red-500 font-medium">{result.error.code}</p>
                                  <p className="text-muted-foreground">{result.error.message}</p>
                                </div>
                              ) : (
                                <pre className="text-xs overflow-auto max-h-[300px]">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool) => (
                <Card key={tool.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{getToolIcon(tool.name)}</span>
                      {getToolName(tool.name)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    <details className="mt-3">
                      <summary className="text-xs cursor-pointer text-primary">
                        查看参数定义
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
                        {JSON.stringify(tool.parameters, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}