'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import type { BatchItemSummary, BatchJobSummary } from '@/lib/seller-workflow/batch-types'
import { BatchItemTable } from '@/components/batch/batch-item-table'
import { BatchProgressPanel } from '@/components/batch/batch-progress-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BatchDetailResponse {
  batch: BatchJobSummary
  items: BatchItemSummary[]
}

function resolveBatchId(raw: string | string[] | undefined) {
  if (Array.isArray(raw)) {
    return raw[0] || ''
  }
  return raw || ''
}

function resolveFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) {
    return fallback
  }
  const match = contentDisposition.match(/filename="(.+?)"/)
  return match?.[1] || fallback
}

export default function BatchDetailPage() {
  const params = useParams()
  const batchId = resolveBatchId(params?.id as string | string[] | undefined)

  const [batch, setBatch] = useState<BatchJobSummary | null>(null)
  const [items, setItems] = useState<BatchItemSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [retryingItemId, setRetryingItemId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const loadBatchDetail = useCallback(async (silent = false) => {
    if (!batchId) {
      return
    }

    if (!silent) {
      setLoading(true)
      setError(null)
    }

    try {
      const response = await fetch(`/api/batches/${batchId}?page=1&pageSize=50`, {
        cache: 'no-store',
      })
      const payload = (await response.json()) as Partial<BatchDetailResponse> & { error?: string }
      if (!response.ok) {
        throw new Error(payload?.error || '加载批次详情失败')
      }
      setBatch(payload.batch as BatchJobSummary)
      setItems(Array.isArray(payload.items) ? payload.items : [])
    } catch (loadError: any) {
      setError(loadError?.message || '加载批次详情失败')
      if (!silent) {
        setBatch(null)
        setItems([])
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [batchId])

  async function handleProcess() {
    if (!batchId) {
      return
    }
    setProcessing(true)
    try {
      const response = await fetch(`/api/batches/${batchId}/process`, {
        method: 'POST',
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || '推进队列失败')
      }
      await loadBatchDetail(true)
    } catch (processError: any) {
      setError(processError?.message || '推进队列失败')
    } finally {
      setProcessing(false)
    }
  }

  async function handleRetry(itemId: string) {
    if (!batchId) {
      return
    }
    setRetryingItemId(itemId)
    try {
      const response = await fetch(`/api/batches/${batchId}/items/${itemId}/retry`, {
        method: 'POST',
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || '重试失败')
      }
      await loadBatchDetail(true)
    } catch (retryError: any) {
      setError(retryError?.message || '重试失败')
    } finally {
      setRetryingItemId(null)
    }
  }

  async function handleDownload() {
    if (!batchId) {
      return
    }
    setDownloading(true)
    try {
      const response = await fetch(`/api/batches/${batchId}/download`, { cache: 'no-store' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || '批量下载失败')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const fileName = resolveFilename(
        response.headers.get('content-disposition'),
        `easy3d-phase2a-${batchId}.zip`
      )

      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (downloadError: any) {
      setError(downloadError?.message || '批量下载失败')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    void loadBatchDetail()
  }, [loadBatchDetail])

  useEffect(() => {
    const processingCount = batch?.processingCount || 0
    if (processingCount === 0) {
      return
    }

    const timer = setInterval(() => {
      void loadBatchDetail(true)
    }, 6000)

    return () => clearInterval(timer)
  }, [batch?.processingCount, loadBatchDetail])

  return (
    <main className="relative min-h-screen bg-void">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回批次工作台
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleDownload} disabled={!batch || downloading}>
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                打包中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                批量下载完成项
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="flex items-center gap-3 py-10 text-zinc-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在加载批次详情...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="py-4 text-sm text-rose-200">{error}</CardContent>
          </Card>
        ) : null}

        {batch ? (
          <BatchProgressPanel
            batch={batch}
            onRefresh={() => void loadBatchDetail(true)}
            onProcess={() => void handleProcess()}
            processing={processing}
          />
        ) : null}

        <BatchItemTable
          items={items}
          retryingItemId={retryingItemId}
          onRetry={(itemId) => void handleRetry(itemId)}
        />
      </div>
    </main>
  )
}
