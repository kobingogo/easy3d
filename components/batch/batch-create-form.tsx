'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, PlusCircle, Settings2, UploadCloud } from 'lucide-react'
import { UploadZone } from '@/components/upload/UploadZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface BatchCreateFormProps {
  onCreated?: (batchId: string) => void
}

interface BrandProfileOption {
  id: string
  name: string
}

interface WorkflowTemplateOption {
  id: string
  name: string
  brandProfileId: string | null
  isDefault: boolean
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
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [brandProfiles, setBrandProfiles] = useState<BrandProfileOption[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplateOption[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const combinedUrls = Array.from(new Set([...uploadedUrls, ...normalizeUrls(manualUrls)]))
  const selectedTemplate = templates.find((item) => item.id === selectedTemplateId) || null

  const selectedBrandName = useMemo(() => {
    if (!selectedTemplate?.brandProfileId) {
      return null
    }
    const profile = brandProfiles.find((item) => item.id === selectedTemplate.brandProfileId)
    return profile?.name || null
  }, [brandProfiles, selectedTemplate?.brandProfileId])

  useEffect(() => {
    async function loadTemplateOptions() {
      setOptionsLoading(true)
      setOptionsError(null)

      try {
        const [profilesRes, templatesRes] = await Promise.all([
          fetch('/api/brand-profiles?limit=50', { cache: 'no-store' }),
          fetch('/api/workflow-templates?limit=50', { cache: 'no-store' }),
        ])
        const profilesPayload = await profilesRes.json()
        const templatesPayload = await templatesRes.json()

        if (!profilesRes.ok) {
          throw new Error(profilesPayload?.error || '品牌资产加载失败')
        }
        if (!templatesRes.ok) {
          throw new Error(templatesPayload?.error || '模板加载失败')
        }

        const nextProfiles = Array.isArray(profilesPayload?.profiles)
          ? (profilesPayload.profiles as BrandProfileOption[])
          : []
        const nextTemplates = Array.isArray(templatesPayload?.templates)
          ? (templatesPayload.templates as WorkflowTemplateOption[])
          : []
        setBrandProfiles(nextProfiles)
        setTemplates(nextTemplates)

        if (nextTemplates.length > 0) {
          const defaultTemplateId =
            typeof templatesPayload?.defaultTemplateId === 'string'
              ? templatesPayload.defaultTemplateId
              : nextTemplates.find((item) => item.isDefault)?.id || ''
          setSelectedTemplateId(defaultTemplateId || '')
        } else {
          setSelectedTemplateId('')
        }
      } catch (loadError: any) {
        setBrandProfiles([])
        setTemplates([])
        setOptionsError(loadError?.message || '模板配置加载失败')
      } finally {
        setOptionsLoading(false)
      }
    }

    void loadTemplateOptions()
  }, [])

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
          workflowTemplateId: selectedTemplateId || null,
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

        <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-zinc-300">工作流模板（Phase 2B）</label>
            <Link href="/dashboard/templates" className="text-xs text-zinc-400 hover:text-zinc-200">
              <span className="inline-flex items-center gap-1">
                <Settings2 className="h-3.5 w-3.5" />
                管理模板/品牌资产
              </span>
            </Link>
          </div>
          <select
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
            disabled={optionsLoading || submitting}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">基础流程（不套模板）</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
                {template.isDefault ? '（默认）' : ''}
              </option>
            ))}
          </select>
          {optionsError ? <p className="text-xs text-rose-300">{optionsError}</p> : null}
          {!optionsError && selectedTemplate ? (
            <p className="text-xs text-zinc-400">
              已选模板：{selectedTemplate.name}
              {selectedBrandName ? ` · 绑定品牌资产：${selectedBrandName}` : ' · 未绑定品牌资产'}
            </p>
          ) : null}
          {!optionsError && !selectedTemplate ? (
            <p className="text-xs text-zinc-400">未套模板，批次将使用 Phase 1 默认策略。</p>
          ) : null}
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
