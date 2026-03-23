'use client'

import { AlertTriangle, CheckCircle2, Clock3, RotateCcw } from 'lucide-react'
import type { BatchItemSummary } from '@/lib/seller-workflow/batch-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BatchItemTableProps {
  items: BatchItemSummary[]
  retryingItemId?: string | null
  onRetry?: (itemId: string) => void
}

function statusMeta(status: BatchItemSummary['status']) {
  switch (status) {
    case 'completed':
      return {
        label: '完成',
        icon: CheckCircle2,
        classes: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
      }
    case 'failed':
      return {
        label: '失败',
        icon: AlertTriangle,
        classes: 'border-rose-400/30 bg-rose-500/10 text-rose-300',
      }
    case 'processing':
      return {
        label: '处理中',
        icon: Clock3,
        classes: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
      }
    case 'queued':
      return {
        label: '排队中',
        icon: Clock3,
        classes: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
      }
    default:
      return {
        label: status,
        icon: Clock3,
        classes: 'border-zinc-400/30 bg-zinc-500/10 text-zinc-300',
      }
  }
}

function shortId(value: string) {
  if (value.length <= 10) {
    return value
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function BatchItemTable({ items, retryingItemId, onRetry }: BatchItemTableProps) {
  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader>
        <CardTitle>批次子任务</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-6 text-sm text-zinc-400">
            当前页没有子任务数据
          </div>
        ) : null}

        {items.map((item, index) => {
          const meta = statusMeta(item.status)
          const StatusIcon = meta.icon

          return (
            <div
              key={item.id}
              className="rounded-lg border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">#{index + 1}</span>
                    <Badge variant="outline" className={`gap-1 ${meta.classes}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </Badge>
                    <span className="text-xs text-zinc-500">尝试 {item.attemptCount} 次</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    item: {shortId(item.id)} | model: {item.modelId ? shortId(item.modelId) : '未创建'}
                  </div>
                  <div className="text-xs text-zinc-400 break-all">{item.sourceImageUrl}</div>
                  {item.lastError ? (
                    <div className="text-xs text-rose-300">{item.lastError}</div>
                  ) : null}
                </div>

                {item.status === 'failed' && onRetry ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(item.id)}
                    disabled={retryingItemId === item.id}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {retryingItemId === item.id ? '重试中...' : '重试'}
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
