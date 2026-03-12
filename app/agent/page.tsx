'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cpu, Zap, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react'

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

interface ExecutionResult {
  stepId: string
  tool?: string
  status: 'pending' | 'running' | 'success' | 'failed'
  data?: any
  error?: any
  duration?: number
}

interface ExecutionTrace {
  workflowId: string
  status: string
  duration: number
  totalTokens: number
  totalCost: number
  steps: Array<{
    id: string
    tool: string
    status: string
    duration: number
    tokens: number
    cost: string
  }>
}

export default function AgentPage() {
  const [userInput, setUserInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [results, setResults] = useState<ExecutionResult[]>([])
  const [trace, setTrace] = useState<ExecutionTrace | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

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

  // 执行 Agent
  const handleRun = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    setPlan(null)
    setResults([])
    setTrace(null)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          userInput,
          imageUrl: imageUrl || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        setPlan(data.plan)
        setResults(data.results)
        setTrace(data.workflow.trace)
      } else {
        console.error('Agent error:', data.error)
      }
    } catch (error) {
      console.error('Request error:', error)
    } finally {
      setLoading(false)
    }
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

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Agent 控制台</h1>
        <p className="text-muted-foreground mb-8">
          输入一句话，Agent 自动完成 3D 生成全流程
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
                    className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="例如：帮我生成一个适合小红书的女包 3D 展示"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="商品图片 URL（可选）"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleRun}
                    disabled={loading || !userInput.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        执行中...
                      </>
                    ) : (
                      <>
                        <Cpu className="mr-2 h-4 w-4" />
                        开始执行
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 执行计划 */}
            {plan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    执行计划
                  </CardTitle>
                  <CardDescription>
                    预估时间：{plan.estimatedTime} 秒
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{plan.reasoning}</p>
                  <div className="space-y-2">
                    {plan.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-lg">{getToolIcon(step.tool)}</span>
                        <div className="flex-1">
                          <p className="font-medium">{step.description}</p>
                          <p className="text-xs text-muted-foreground">{step.tool}</p>
                        </div>
                        {results[index] && getStatusIcon(results[index].status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 执行结果 */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>执行结果</CardTitle>
                  {trace && (
                    <CardDescription>
                      总耗时：{trace.duration}ms | Token：{trace.totalTokens} | 成本：¥{trace.totalCost.toFixed(4)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.map((result) => (
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
                            {result.tool && <span>{getToolIcon(result.tool)}</span>}
                            <span className="font-medium">{result.stepId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">
                                {result.duration}ms
                              </span>
                            )}
                          </div>
                        </button>
                        {expandedSteps.has(result.stepId) && (
                          <div className="p-3 pt-0 border-t bg-muted/30">
                            <pre className="text-xs overflow-auto max-h-[300px]">
                              {JSON.stringify(result.data || result.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
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
                      {tool.name}
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