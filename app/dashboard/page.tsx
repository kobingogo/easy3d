'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Layers3, Loader2, RefreshCcw, Sparkles, SwatchBook } from 'lucide-react'
import type { BatchJobSummary } from '@/lib/seller-workflow/batch-types'
import { BatchCreateForm } from '@/components/batch/batch-create-form'
import { BatchProgressPanel } from '@/components/batch/batch-progress-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ModelsPayload {
  models?: Array<{ id: string }>
}

export default function DashboardPage() {
  const [batches, setBatches] = useState<BatchJobSummary[]>([])
  const [singleTaskCount, setSingleTaskCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)

    try {
      const [batchRes, modelsRes] = await Promise.all([
        fetch('/api/batches?limit=30', { cache: 'no-store' }),
        fetch('/api/models', { cache: 'no-store' }),
      ])

      const batchPayload = await batchRes.json()
      const modelsPayload = (await modelsRes.json()) as ModelsPayload

      if (!batchRes.ok) {
        throw new Error(batchPayload?.error || '读取批次列表失败')
      }

      setBatches(Array.isArray(batchPayload?.batches) ? batchPayload.batches : [])
      setSingleTaskCount(Array.isArray(modelsPayload?.models) ? modelsPayload.models.length : 0)
    } catch (loadError: any) {
      setError(loadError?.message || '加载工作台失败')
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  return (
    <main className="relative min-h-screen bg-void">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <section className="space-y-4">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200">
            Phase 2A 批量上新工作台
          </Badge>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">批量上新工作台</h1>
              <p className="max-w-2xl text-sm text-zinc-400">
                以批次为主入口管理 SKU 生成流程：批量上传、受控并发、失败重试、批量导出。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/templates">
                <Button variant="outline">
                  <SwatchBook className="mr-2 h-4 w-4" />
                  模板与品牌资产
                </Button>
              </Link>
              <Link href="/generate">
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  单任务入口
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => void loadDashboard()} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                刷新
              </Button>
            </div>
          </div>
        </section>

        <BatchCreateForm
          onCreated={(batchId) => {
            void loadDashboard()
            window.location.href = `/dashboard/batches/${batchId}`
          }}
        />

        {error ? (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="py-4 text-sm text-rose-200">{error}</CardContent>
          </Card>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              <span>最近批次（{batches.length}）</span>
            </div>
            <span>历史单任务 {singleTaskCount} 条</span>
          </div>

          {loading ? (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="flex items-center gap-3 py-8 text-zinc-300">
                <Loader2 className="h-5 w-5 animate-spin" />
                正在加载批次列表...
              </CardContent>
            </Card>
          ) : null}

          {!loading && batches.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-white/[0.02]">
              <CardContent className="py-8 text-sm text-zinc-400">
                还没有批次。先在上方创建第一批 SKU，系统会自动进入队列。
              </CardContent>
            </Card>
          ) : null}

          {!loading
            ? batches.map((batch) => (
                <BatchProgressPanel
                  key={batch.id}
                  batch={batch}
                  showDetailLink
                  onRefresh={() => void loadDashboard()}
                />
              ))
            : null}
        </section>
      </div>
    </main>
  )
}
