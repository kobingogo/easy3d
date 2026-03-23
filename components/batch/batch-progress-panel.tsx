'use client'

import Link from 'next/link'
import { ArrowRight, Loader2, PlayCircle, RefreshCcw } from 'lucide-react'
import type { BatchJobSummary } from '@/lib/seller-workflow/batch-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BatchProgressPanelProps {
  batch: BatchJobSummary
  onRefresh?: () => void
  onProcess?: () => void
  processing?: boolean
  showDetailLink?: boolean
}

function statusTone(status: BatchJobSummary['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
    case 'partial_failed':
      return 'border-amber-400/30 bg-amber-500/10 text-amber-300'
    case 'running':
      return 'border-sky-400/30 bg-sky-500/10 text-sky-300'
    case 'canceled':
      return 'border-zinc-400/30 bg-zinc-500/10 text-zinc-300'
    default:
      return 'border-violet-400/30 bg-violet-500/10 text-violet-300'
  }
}

function statusLabel(status: BatchJobSummary['status']) {
  switch (status) {
    case 'queued':
      return '排队中'
    case 'running':
      return '执行中'
    case 'partial_failed':
      return '部分失败'
    case 'completed':
      return '已完成'
    case 'canceled':
      return '已取消'
    default:
      return status
  }
}

export function BatchProgressPanel({
  batch,
  onRefresh,
  onProcess,
  processing = false,
  showDetailLink = false,
}: BatchProgressPanelProps) {
  const progress =
    batch.totalCount > 0 ? Math.round((batch.completedCount / batch.totalCount) * 100) : 0

  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{batch.name}</CardTitle>
            <CardDescription>{batch.totalCount} 个 SKU 子任务</CardDescription>
          </div>
          <Badge variant="outline" className={statusTone(batch.status)}>
            {statusLabel(batch.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>完成进度</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-zinc-400">总数</div>
            <div className="mt-1 text-lg font-semibold text-white">{batch.totalCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-zinc-400">排队</div>
            <div className="mt-1 text-lg font-semibold text-white">{batch.queuedCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-zinc-400">处理中</div>
            <div className="mt-1 text-lg font-semibold text-white">{batch.processingCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-zinc-400">完成</div>
            <div className="mt-1 text-lg font-semibold text-emerald-300">{batch.completedCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-zinc-400">失败</div>
            <div className="mt-1 text-lg font-semibold text-rose-300">{batch.failedCount}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {onProcess ? (
            <Button onClick={onProcess} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  推进中...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  推进队列
                </>
              )}
            </Button>
          ) : null}

          {onRefresh ? (
            <Button variant="outline" onClick={onRefresh} disabled={processing}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          ) : null}

          {showDetailLink ? (
            <Link href={`/dashboard/batches/${batch.id}`}>
              <Button variant="ghost">
                查看详情
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
