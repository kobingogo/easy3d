'use client'

import { useState } from 'react'
import { Loader2, PlusCircle, UploadCloud } from 'lucide-react'
import { UploadZone } from '@/components/upload/UploadZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface BatchCreateFormProps {
  onCreated?: (batchId: string) => void
}

function normalizeUrls(input: string) {
  return input
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function BatchCreateForm({ onCreated }: BatchCreateFormProps) {
  const [name, setName] = useState('')
  const [manualUrls, setManualUrls] = useState('')
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const combinedUrls = Array.from(new Set([...uploadedUrls, ...normalizeUrls(manualUrls)]))

  async function handleUpload(files: File[]) {
    setUploading(true)
    setError(null)

    try {
      const urls: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.error || '上传失败')
        }
        urls.push(payload.url)
      }

      setUploadedUrls((prev) => Array.from(new Set([...prev, ...urls])))
    } catch (uploadError: any) {
      setError(uploadError?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleCreate() {
    setSubmitting(true)
    setError(null)

    try {
      if (!name.trim()) {
        throw new Error('请先填写批次名称')
      }

      if (combinedUrls.length === 0) {
        throw new Error('请至少上传或粘贴 1 张商品图')
      }

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          items: combinedUrls.map((sourceImageUrl) => ({ sourceImageUrl })),
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || '批次创建失败')
      }

      setName('')
      setManualUrls('')
      setUploadedUrls([])
      onCreated?.(payload.batchId)
    } catch (submitError: any) {
      setError(submitError?.message || '批次创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>新建批次</CardTitle>
            <CardDescription>
              面向包袋/小皮具，一次提交 1-20 张主图，进入受控并发队列。
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">
            Phase 2A
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">批次名称</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：春季通勤包袋第 1 批"
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <UploadCloud className="h-4 w-4" />
            上传商品图（最多 20 张）
          </div>
          <UploadZone onUpload={handleUpload} maxFiles={20} disabled={uploading || submitting} />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">或粘贴图片 URL（每行一个）</label>
          <Textarea
            value={manualUrls}
            onChange={(event) => setManualUrls(event.target.value)}
            placeholder="https://.../sku-a.jpg"
            className="min-h-[110px] border-white/10 bg-black/20 text-zinc-200"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>当前待入队 {combinedUrls.length} 项</span>
          <span>上限 20 项</span>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button
          onClick={handleCreate}
          disabled={uploading || submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              创建批次并进入队列
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
