'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, PlusCircle, SwatchBook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface BrandProfileSummary {
  id: string
  name: string
  category: 'bags'
  toneProfile: Record<string, unknown>
  visualRules: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface WorkflowTemplateSummary {
  id: string
  name: string
  category: 'bags'
  brandProfileId: string | null
  templatePayload: Record<string, unknown>
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardTemplatesPage() {
  const [profiles, setProfiles] = useState<BrandProfileSummary[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplateSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)

  const [profileName, setProfileName] = useState('')
  const [toneNotes, setToneNotes] = useState('')
  const [visualNotes, setVisualNotes] = useState('')

  const [templateName, setTemplateName] = useState('')
  const [templateBrandProfileId, setTemplateBrandProfileId] = useState('')
  const [templateNotes, setTemplateNotes] = useState('')
  const [templateIsDefault, setTemplateIsDefault] = useState(false)

  const profileNameMap = useMemo(
    () => new Map(profiles.map((item) => [item.id, item.name])),
    [profiles]
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [profilesRes, templatesRes] = await Promise.all([
        fetch('/api/brand-profiles?limit=100', { cache: 'no-store' }),
        fetch('/api/workflow-templates?limit=100', { cache: 'no-store' }),
      ])
      const profilesPayload = await profilesRes.json()
      const templatesPayload = await templatesRes.json()

      if (!profilesRes.ok) {
        throw new Error(profilesPayload?.error || '读取品牌资产失败')
      }
      if (!templatesRes.ok) {
        throw new Error(templatesPayload?.error || '读取工作流模板失败')
      }

      setProfiles(Array.isArray(profilesPayload?.profiles) ? profilesPayload.profiles : [])
      setTemplates(Array.isArray(templatesPayload?.templates) ? templatesPayload.templates : [])
    } catch (loadError: any) {
      setError(loadError?.message || '加载模板中心失败')
      setProfiles([])
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleCreateProfile() {
    setSavingProfile(true)
    setError(null)

    try {
      const response = await fetch('/api/brand-profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          toneProfile: {
            notes: toneNotes.trim(),
          },
          visualRules: {
            notes: visualNotes.trim(),
          },
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || '创建品牌资产失败')
      }

      setProfileName('')
      setToneNotes('')
      setVisualNotes('')
      await loadData()
    } catch (saveError: any) {
      setError(saveError?.message || '创建品牌资产失败')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleCreateTemplate() {
    setSavingTemplate(true)
    setError(null)

    try {
      const response = await fetch('/api/workflow-templates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          brandProfileId: templateBrandProfileId || null,
          templatePayload: {
            notes: templateNotes.trim(),
          },
          isDefault: templateIsDefault,
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || '创建模板失败')
      }

      setTemplateName('')
      setTemplateBrandProfileId('')
      setTemplateNotes('')
      setTemplateIsDefault(false)
      await loadData()
    } catch (saveError: any) {
      setError(saveError?.message || '创建模板失败')
    } finally {
      setSavingTemplate(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <main className="relative min-h-screen bg-void">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <section className="space-y-3">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回批次工作台
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <SwatchBook className="h-7 w-7" />
              模板与品牌资产（Phase 2B）
            </h1>
            <p className="max-w-3xl text-sm text-zinc-400">
              先沉淀品牌语气和视觉规则，再把它们绑定成可复用模板，供批量上新工作台直接套用。
            </p>
          </div>
        </section>

        {error ? (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="py-4 text-sm text-rose-200">{error}</CardContent>
          </Card>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle>新建品牌资产</CardTitle>
              <CardDescription>记录品牌语气和视觉约束，后续可被多个模板复用。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">名称</label>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="例如：通勤女包品牌语气"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">语气规则（可选）</label>
                <Textarea
                  value={toneNotes}
                  onChange={(event) => setToneNotes(event.target.value)}
                  placeholder="例如：强调高级感、避免夸张营销词、句子简洁。"
                  className="min-h-[96px] border-white/10 bg-black/20 text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">视觉规则（可选）</label>
                <Textarea
                  value={visualNotes}
                  onChange={(event) => setVisualNotes(event.target.value)}
                  placeholder="例如：偏白底、强调五金与皮纹，不使用高饱和背景。"
                  className="min-h-[96px] border-white/10 bg-black/20 text-zinc-200"
                />
              </div>
              <Button onClick={handleCreateProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    创建品牌资产
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle>新建工作流模板</CardTitle>
              <CardDescription>模板可以绑定品牌资产，并在批次创建时一键套用。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">模板名称</label>
                <input
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="例如：通勤包袋-白底电商优先"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">关联品牌资产（可选）</label>
                <select
                  value={templateBrandProfileId}
                  onChange={(event) => setTemplateBrandProfileId(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                >
                  <option value="">不绑定品牌资产</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">模板说明（可选）</label>
                <Textarea
                  value={templateNotes}
                  onChange={(event) => setTemplateNotes(event.target.value)}
                  placeholder="例如：主打淘宝主图，封面文案偏克制，抖音首屏强调容量卖点。"
                  className="min-h-[96px] border-white/10 bg-black/20 text-zinc-200"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={templateIsDefault}
                  onChange={(event) => setTemplateIsDefault(event.target.checked)}
                />
                设为默认模板（同品类仅保留一个默认）
              </label>

              <Button onClick={handleCreateTemplate} disabled={savingTemplate}>
                {savingTemplate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    创建工作流模板
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle>品牌资产列表</CardTitle>
              <CardDescription>{profiles.length} 条</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-zinc-400">加载中...</p>
              ) : null}
              {!loading && profiles.length === 0 ? (
                <p className="text-sm text-zinc-400">暂无品牌资产</p>
              ) : null}
              {profiles.map((profile) => (
                <div key={profile.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-medium text-white">{profile.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    语气：{String(profile.toneProfile?.notes || '未设置')}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    视觉：{String(profile.visualRules?.notes || '未设置')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle>模板列表</CardTitle>
              <CardDescription>{templates.length} 条</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm text-zinc-400">加载中...</p> : null}
              {!loading && templates.length === 0 ? (
                <p className="text-sm text-zinc-400">暂无模板</p>
              ) : null}
              {templates.map((template) => (
                <div key={template.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    {template.isDefault ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                        默认
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    绑定品牌资产：
                    {template.brandProfileId
                      ? profileNameMap.get(template.brandProfileId) || template.brandProfileId
                      : '无'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    说明：{String(template.templatePayload?.notes || '未设置')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
