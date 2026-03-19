'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, TrendingUp, Loader2, Copy, Check, RefreshCw, Upload, FileText, X, Play, Download } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// 风格模板
const STYLE_TEMPLATES = [
  { id: 'minimal', name: '极简', description: '干净白色背景，柔和漫射光，极简构图', category: '通用' },
  { id: 'luxury', name: '奢华', description: '优雅渐变背景，高级摄影灯光，金色点缀', category: '珠宝、美妆' },
  { id: 'tech', name: '科技', description: '未来感深色背景，蓝色LED光效，金属反光表面', category: '3C 数码' },
  { id: 'natural', name: '自然', description: '自然日光，有机背景，木质纹理，生活化', category: '食品、家居' },
  { id: 'trendy', name: '潮流', description: '活力渐变背景，动态角度，多彩灯光', category: '服装、鞋帽' },
] as const

// 平台选项
const PLATFORMS = [
  { id: 'xiaohongshu', name: '小红书', description: '生活化、种草感、氛围感强' },
  { id: 'taobao', name: '淘宝', description: '专业、干净、突出商品' },
  { id: 'douyin', name: '抖音', description: '潮流、动感、吸引眼球' },
  { id: 'amazon', name: '亚马逊', description: '专业、简洁、标准化' },
] as const

// 优化结果类型
interface OptimizationResult {
  prompt: string
  style: string
  lighting: string
  background: string
  camera: string
  keywords: string[]
  productType?: string
  confidence: number
}

// 质量评分类型
interface QualityMetrics {
  professionalism: number
  detail: number
  executability: number
  overall: number
}

// 计算质量评分
function calculateMetrics(prompt: string): QualityMetrics {
  const words = prompt.split(' ').length
  const hasLighting = /lighting|light|illuminat|shadow|reflect/i.test(prompt)
  const hasBackground = /background|bg|surface|floor|gradient/i.test(prompt)
  const hasQuality = /4k|8k|hd|high.?quality|photorealistic|professional/i.test(prompt)
  const hasStyle = /minimal|luxury|tech|natural|trendy|elegant|modern|premium/i.test(prompt)
  const hasDetails = /texture|material|finish|detail|surface|matte|glossy/i.test(prompt)

  const score = (cond: boolean) => cond ? 10 : 5

  const professionalism = Math.min(10,
    score(hasLighting) * 0.3 +
    score(hasBackground) * 0.2 +
    score(hasQuality) * 0.3 +
    score(hasStyle) * 0.2
  )

  const detail = Math.min(10,
    words / 10 +
    score(hasDetails) * 0.3 +
    score(hasLighting) * 0.2
  )

  const executability = Math.min(10,
    score(hasLighting) * 0.25 +
    score(hasBackground) * 0.25 +
    score(hasQuality) * 0.25 +
    score(hasDetails) * 0.25
  )

  return {
    professionalism: Math.round(professionalism),
    detail: Math.round(detail),
    executability: Math.round(executability),
    overall: Math.round((professionalism + detail + executability) / 3)
  }
}

export default function FineTunePage() {
  // 状态管理
  const [description, setDescription] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('minimal')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('xiaohongshu')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 历史记录
  const [history, setHistory] = useState<Array<{
    input: string
    output: OptimizationResult
    timestamp: Date
  }>>([])

  // 批量优化状态
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<Array<{
    input: string
    output: OptimizationResult | null
    status: 'pending' | 'processing' | 'success' | 'error'
    error?: string
  }>>([])
  const [batchProgress, setBatchProgress] = useState(0)
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  // 调用优化 API
  const handleOptimize = useCallback(async () => {
    if (!description.trim()) {
      setError('请输入商品描述')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDescription: description,
          style: selectedStyle,
          platform: selectedPlatform
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '优化失败')
      }

      const optimized = data.data as OptimizationResult
      setResult(optimized)

      // 添加到历史记录
      setHistory(prev => [{
        input: description,
        output: optimized,
        timestamp: new Date()
      }, ...prev].slice(0, 10))

    } catch (err: any) {
      setError(err.message || '优化失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [description, selectedStyle, selectedPlatform])

  // 复制提示词
  const handleCopy = useCallback(async () => {
    if (!result?.prompt) return

    try {
      await navigator.clipboard.writeText(result.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }, [result])

  // 批量优化处理
  const processBatchItems = useCallback(async () => {
    const items = batchInput.split('\n').filter(line => line.trim())
    if (items.length === 0) {
      return
    }

    setIsBatchProcessing(true)
    setBatchProgress(0)
    setBatchResults(items.map(input => ({
      input: input.trim(),
      output: null,
      status: 'pending' as const
    })))

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i].trim()
      if (!currentItem) continue

      // 更新状态为 processing
      setBatchResults(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'processing' as const } : item
      ))

      try {
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userDescription: currentItem,
            style: selectedStyle,
            platform: selectedPlatform
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '优化失败')
        }

        // 更新状态为 success
        setBatchResults(prev => prev.map((item, idx) =>
          idx === i ? { ...item, output: data.data as OptimizationResult, status: 'success' as const } : item
        ))
      } catch (err: any) {
        // 更新状态为 error
        setBatchResults(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error' as const, error: err.message } : item
        ))
      }

      // 更新进度
      setBatchProgress(Math.round(((i + 1) / items.length) * 100))
    }

    setIsBatchProcessing(false)
  }, [batchInput, selectedStyle, selectedPlatform])

  // 导出批量结果
  const exportBatchResults = useCallback(() => {
    const successResults = batchResults.filter(r => r.status === 'success' && r.output)
    if (successResults.length === 0) return

    const csvContent = [
      ['原始描述', '优化提示词', '风格', '灯光', '背景', '相机', '置信度'].join(','),
      ...successResults.map(r => [
        `"${r.input}"`,
        `"${r.output!.prompt.replace(/"/g, '""')}"`,
        r.output!.style,
        r.output!.lighting,
        r.output!.background,
        r.output!.camera,
        `${(r.output!.confidence * 100).toFixed(0)}%`
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-optimization-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [batchResults])

  // 复制单个批量结果
  const copyBatchResult = useCallback(async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }, [])

  // 计算质量评分
  const originalMetrics = description ? calculateMetrics(description) : null
  const optimizedMetrics = result ? calculateMetrics(result.prompt) : null
  const improvement = originalMetrics && optimizedMetrics
    ? Math.round((optimizedMetrics.overall - originalMetrics.overall) / originalMetrics.overall * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Prompt 优化</h1>
        <p className="text-muted-foreground mb-8">
          电商提示词优化引擎，质量提升 40%+
        </p>

        <Tabs defaultValue="optimize" className="space-y-6">
          <TabsList>
            <TabsTrigger value="optimize">提示词优化</TabsTrigger>
            <TabsTrigger value="compare">效果对比</TabsTrigger>
            <TabsTrigger value="templates">模板管理</TabsTrigger>
          </TabsList>

          {/* 提示词优化 Tab */}
          <TabsContent value="optimize">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  输入商品描述
                </CardTitle>
                <CardDescription>
                  输入简单的商品描述，生成专业的英文提示词
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 商品描述输入 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">商品描述</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="例如：女包，棕色，皮质，适合小红书种草"
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* 风格和平台选择 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">风格选择</label>
                      <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        {STYLE_TEMPLATES.map(style => (
                          <option key={style.id} value={style.id}>
                            {style.name} - {style.category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">目标平台</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        {PLATFORMS.map(platform => (
                          <option key={platform.id} value={platform.id}>
                            {platform.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* 生成按钮 */}
                  <Button
                    onClick={handleOptimize}
                    disabled={isLoading || !description.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        正在优化...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        生成优化提示词
                      </>
                    )}
                  </Button>

                  {/* 优化结果 */}
                  {result && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-green-600">优化结果</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDescription('')
                              setResult(null)
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            重新生成
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                复制
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <Card className="border-green-500">
                        <CardContent className="py-4">
                          <p className="text-sm font-mono whitespace-pre-wrap">
                            {result.prompt}
                          </p>

                          {/* 详细信息 */}
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">灯光：</span>
                              <span>{result.lighting}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">背景：</span>
                              <span>{result.background}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">相机：</span>
                              <span>{result.camera}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">置信度：</span>
                              <span>{(result.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>

                          {/* 关键词 */}
                          {result.keywords.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {result.keywords.map((keyword, i) => (
                                <Badge key={i} variant="secondary">{keyword}</Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 效果对比 Tab */}
          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  优化前后对比
                </CardTitle>
                <CardDescription>
                  直观展示优化效果
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-8 text-muted-foreground">
                    请先在&ldquo;提示词优化&rdquo;页面生成提示词
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      {/* 优化前 */}
                      <div>
                        <h3 className="font-medium mb-2 text-muted-foreground">优化前</h3>
                        <Card className="bg-muted/50">
                          <CardContent className="py-4">
                            <p className="text-sm font-mono">
                              {description}
                            </p>
                            <div className="mt-4 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>专业性</span>
                                  <span>{originalMetrics?.professionalism || 0}/10</span>
                                </div>
                                <Progress value={(originalMetrics?.professionalism || 0) * 10} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>详细度</span>
                                  <span>{originalMetrics?.detail || 0}/10</span>
                                </div>
                                <Progress value={(originalMetrics?.detail || 0) * 10} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>可执行性</span>
                                  <span>{originalMetrics?.executability || 0}/10</span>
                                </div>
                                <Progress value={(originalMetrics?.executability || 0) * 10} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* 优化后 */}
                      <div>
                        <h3 className="font-medium mb-2 text-green-600">优化后</h3>
                        <Card className="border-green-500">
                          <CardContent className="py-4">
                            <p className="text-sm font-mono line-clamp-4">
                              {result.prompt}
                            </p>
                            <div className="mt-4 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>专业性</span>
                                  <span className="text-green-600">{optimizedMetrics?.professionalism || 0}/10</span>
                                </div>
                                <Progress value={(optimizedMetrics?.professionalism || 0) * 10} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>详细度</span>
                                  <span className="text-green-600">{optimizedMetrics?.detail || 0}/10</span>
                                </div>
                                <Progress value={(optimizedMetrics?.detail || 0) * 10} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>可执行性</span>
                                  <span className="text-green-600">{optimizedMetrics?.executability || 0}/10</span>
                                </div>
                                <Progress value={(optimizedMetrics?.executability || 0) * 10} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* 质量提升 */}
                    <div className="mt-6 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {improvement > 0 ? '+' : ''}{improvement}%
                      </p>
                      <p className="text-sm text-muted-foreground">整体质量提升</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 历史记录 */}
            {history.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">历史记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => {
                          setDescription(item.input)
                          setResult(item.output)
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium truncate flex-1">{item.input}</p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {item.output.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 模板管理 Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STYLE_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedStyle === template.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => {
                    setSelectedStyle(template.id)
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {template.name}
                      {selectedStyle === template.id && (
                        <Badge variant="default">当前</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">适用：{template.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 平台风格说明 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">平台风格指南</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {PLATFORMS.map(platform => (
                    <div key={platform.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}