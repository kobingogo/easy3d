'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Plus,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CyberGrid } from '@/components/ui/cyber-grid'
import { GlowingCard } from '@/components/ui/glowing-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface TaskRecord {
  id: string
  status: string
  currentState?: string | null
  unlockStatus?: string | null
  model_3d_url?: string | null
  thumbnail_url?: string | null
  created_at: string
  copySummary?: {
    taobaoTitle?: string
    xiaohongshuTitle?: string
    douyinHook?: string
  } | null
  strategySummary?: {
    recommendedPlatform?: string
    marketingHook?: string
    reasoningSummary?: string
  } | null
}

type StatusTone = 'blue' | 'purple' | 'green' | 'pink'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getTaskState(task: TaskRecord) {
  const state = `${task.currentState ?? ''} ${task.unlockStatus ?? ''} ${task.status ?? ''}`.toLowerCase()

  if (state.includes('reject') || state.includes('fail')) {
    return { label: '需调整', tone: 'pink' as StatusTone, icon: Clock3 }
  }

  if (state.includes('unlocked')) {
    return { label: '已解锁', tone: 'green' as StatusTone, icon: CheckCircle2 }
  }

  if (
    state.includes('approved') ||
    state.includes('requested') ||
    state.includes('preview_only') ||
    state.includes('complete') ||
    state.includes('success') ||
    task.thumbnail_url
  ) {
    return { label: '待解锁', tone: 'purple' as StatusTone, icon: Sparkles }
  }

  return { label: '待预览', tone: 'blue' as StatusTone, icon: Loader2 }
}

function toneClasses(tone: StatusTone) {
  switch (tone) {
    case 'green':
      return 'border-green-500/30 bg-green-500/10 text-green-300'
    case 'pink':
      return 'border-pink-500/30 bg-pink-500/10 text-pink-300'
    case 'purple':
      return 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    default:
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
  }
}

function getTaskSummary(task: TaskRecord) {
  return (
    task.copySummary?.taobaoTitle ||
    task.copySummary?.xiaohongshuTitle ||
    task.copySummary?.douyinHook ||
    task.strategySummary?.marketingHook ||
    '预览通过后，这里会展示更完整的素材摘要。'
  )
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/models', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || '无法加载素材任务')
      }

      setTasks(Array.isArray(payload?.models) ? payload.models : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法加载素材任务')
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks()
  }, [])

  const completedCount = tasks.filter((task) => getTaskState(task).label === '已解锁').length
  const previewCount = tasks.filter((task) => getTaskState(task).label === '待解锁').length
  const pendingCount = Math.max(tasks.length - completedCount - previewCount, 0)
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-void">
      <CyberGrid color="purple" className="opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-10">
        <ScrollReveal variant="fadeIn">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit border-white/10 bg-white/5 text-zinc-200">
                我的素材任务
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">我的素材任务</h1>
                <p className="max-w-2xl text-zinc-400">
                  这里会汇总每次素材包的预览、解锁和交付状态。先看素材任务，再继续去生成页补齐新的商品包。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/generate">
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  新建素材任务
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={loadTasks} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                刷新
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: '总任务', value: tasks.length, hint: '素材包请求 / 生成记录' },
            { label: '待预览', value: pendingCount, hint: '等待生成预览或补齐卖点' },
            { label: '已解锁', value: completedCount, hint: '完整素材包可继续交付' },
          ].map((item, index) => (
            <ScrollReveal key={item.label} variant="fadeUp" delay={index * 0.05}>
              <GlowingCard glowColor={index === 0 ? 'blue' : index === 1 ? 'purple' : 'green'} className="p-5">
                <div className="text-sm text-zinc-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-white">{item.value}</div>
                <div className="mt-2 text-sm text-zinc-400">{item.hint}</div>
              </GlowingCard>
            </ScrollReveal>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <ScrollReveal variant="fadeUp">
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">素材任务列表</CardTitle>
                    <CardDescription>按时间倒序展示最近的素材包状态，未来可以直接接真实任务数据。</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">
                    只读视图
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                    <span>任务进度</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 animate-pulse"
                      >
                        <div className="h-20 w-20 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 w-1/3 rounded bg-white/5" />
                          <div className="h-3 w-2/3 rounded bg-white/5" />
                          <div className="h-3 w-1/2 rounded bg-white/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <Card className="border-dashed border-white/10 bg-white/[0.015]">
                    <CardContent className="p-6 text-center">
                      <p className="text-zinc-200">素材任务暂时加载失败</p>
                      <p className="mt-2 text-sm text-zinc-500">{error}</p>
                      <Button className="mt-4" onClick={loadTasks}>
                        重新加载
                      </Button>
                    </CardContent>
                  </Card>
                ) : tasks.length === 0 ? (
                  <div className="space-y-4">
                    <Card className="border-dashed border-white/10 bg-white/[0.015]">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                            <Package className="h-6 w-6 text-neon-blue" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">还没有素材任务</h3>
                              <p className="mt-1 text-sm text-zinc-400">
                                第一次上传后，这里会出现每一套素材包的预览、解锁和交付状态。
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Link href="/generate">
                                <Button>
                                  去生成页
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href="/generate">
                                <Button variant="outline">上传第一套素材</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-3">
                      {['上传产品图', '预览素材包', '解锁下载'].map((label, index) => (
                        <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.015] p-4 text-sm text-zinc-400">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200">
                            {index + 1}
                          </div>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => {
                      const status = getTaskState(task)
                      const StatusIcon = status.icon

                      return (
                        <Card key={task.id} className="border-white/10 bg-white/[0.02]">
                          <CardContent className="p-4 md:p-5">
                            <div className="flex flex-col gap-4 md:flex-row">
                              <div className="h-24 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 md:h-24 md:w-24 md:shrink-0">
                                {task.thumbnail_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={task.thumbnail_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-500">
                                    Task {index + 1}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-base font-semibold text-white">素材任务 {index + 1}</h3>
                                      <span className="text-xs text-zinc-500">{formatDate(task.created_at)}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-zinc-300">{getTaskSummary(task)}</p>
                                  </div>

                                  <Badge variant="outline" className={`gap-2 ${toneClasses(status.tone)}`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {status.label}
                                  </Badge>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                  <Link href="/generate">
                                    <Button size="sm">
                                      继续处理
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <span className="inline-flex items-center rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-500">
                                    {status.label === '已解锁'
                                      ? '完整素材包已解锁，请回到结果页继续下载'
                                      : status.label === '待解锁'
                                        ? '先确认预览，再进入解锁交付'
                                        : '生成完成后会在这里出现交付状态'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal variant="fadeUp">
              <GlowingCard glowColor="purple" className="p-6">
                <div className="space-y-3">
                  <div className="text-sm uppercase tracking-[0.3em] text-zinc-500">Next Step</div>
                  <h2 className="text-2xl font-semibold text-white">继续新增素材任务</h2>
                  <p className="text-sm leading-6 text-zinc-400">
                    先补一套包袋或小皮具素材，跑通预览和解锁流程，再逐步接入更多品类。
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/generate">
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      去生成页
                    </Button>
                  </Link>
                  <Link href="/generate">
                    <Button variant="outline" className="w-full">
                      查看上传流程
                    </Button>
                  </Link>
                </div>
              </GlowingCard>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.05}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">当前工作方式</CardTitle>
                  <CardDescription>这是一个轻量只读版本，但信息架构已经按真实任务流组织。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 md:p-5">
                  {[
                    '先上传产品图，再把预览素材包整理出来。',
                    '预览阶段免费，确认方向后再解锁下载。',
                    '未来这里可以继续接真实任务、筛选和状态更新。',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-neon-blue" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </main>
  )
}
