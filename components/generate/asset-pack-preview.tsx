'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPlatformSpec, type Platform } from '@/lib/export/platform-adapter'
import { ArrowRight, CheckCircle2, Clock3, Eye, Lock, PackageOpen, Sparkles } from 'lucide-react'

type UnlockState = 'preview_only' | 'requested' | 'approved' | 'rejected' | 'unlocked'

interface CopySummary {
  taobaoTitle?: string
  xiaohongshuTitle?: string
  douyinHook?: string
}

interface StrategySummary {
  recommendedPlatform?: string
  marketingHook?: string
  reasoningSummary?: string
  featureFocus?: string[]
}

interface UnlockView {
  currentState: UnlockState
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  fulfilledAt?: string
}

interface PlatformAssetPreview {
  platform: Platform
  previewUrl?: string | null
  downloadUrl?: string | null
  width?: number
  height?: number
}

interface AssetPackPreviewProps {
  previewFallbackUrl?: string | null
  platformAssets?: PlatformAssetPreview[]
  copySummary?: CopySummary | null
  strategySummary?: StrategySummary | null
  unlockView?: UnlockView | null
  isLoading?: boolean
  isReady?: boolean
  isDownloadReady?: boolean
  onRequestUnlock?: () => void
  onDownloadFullPack?: () => void
}

const PLATFORM_ORDER: Platform[] = ['taobao', 'xiaohongshu', 'douyin']

function formatTimeLabel(value?: string) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

function getUnlockMeta(unlockView?: UnlockView | null) {
  const state = unlockView?.currentState ?? 'preview_only'
  const labels: Record<
    UnlockState,
    { badge: string; description: string; accent: string; icon: typeof Lock }
  > = {
    preview_only: {
      badge: '预览模式',
      description: '当前开放素材包预览，提交联系方式后可申请完整交付。',
      accent: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
      icon: Lock,
    },
    requested: {
      badge: '申请处理中',
      description: '解锁申请已提交，审核通过后会进入完整素材包交付。',
      accent: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
      icon: Clock3,
    },
    approved: {
      badge: '已审核通过',
      description: '资格已通过，完整素材包下载链路正在接通。',
      accent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
      icon: CheckCircle2,
    },
    rejected: {
      badge: '可重新申请',
      description: '最近一次申请未通过，补充更明确的渠道与备注后可再次提交。',
      accent: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
      icon: Lock,
    },
    unlocked: {
      badge: '已解锁',
      description: '完整素材包权限已开启，下载入口将作为主交付动作出现。',
      accent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
      icon: PackageOpen,
    },
  }

  return labels[state]
}

function getTimelineText(unlockView?: UnlockView | null) {
  if (!unlockView) {
    return '尚未提交解锁申请'
  }

  if (unlockView.currentState === 'requested') {
    return formatTimeLabel(unlockView.submittedAt)
      ? `提交于 ${formatTimeLabel(unlockView.submittedAt)}`
      : '申请已提交'
  }

  if (unlockView.currentState === 'approved') {
    return formatTimeLabel(unlockView.approvedAt)
      ? `通过于 ${formatTimeLabel(unlockView.approvedAt)}`
      : '资格已通过'
  }

  if (unlockView.currentState === 'rejected') {
    return formatTimeLabel(unlockView.rejectedAt)
      ? `拒绝于 ${formatTimeLabel(unlockView.rejectedAt)}`
      : '可重新补充信息'
  }

  if (unlockView.currentState === 'unlocked') {
    return formatTimeLabel(unlockView.fulfilledAt)
      ? `解锁于 ${formatTimeLabel(unlockView.fulfilledAt)}`
      : '完整包已解锁'
  }

  return '先预览，再决定是否申请完整素材包'
}

function getPrimaryActionLabel(state: UnlockState) {
  switch (state) {
    case 'requested':
      return '解锁申请已提交'
    case 'approved':
      return '完整素材包接通中'
    case 'rejected':
      return '重新提交解锁申请'
    case 'unlocked':
      return '下载完整素材包（即将接通）'
    default:
      return '提交解锁申请'
  }
}

export function AssetPackPreview({
  previewFallbackUrl,
  platformAssets = [],
  copySummary,
  strategySummary,
  unlockView,
  isLoading = false,
  isReady = false,
  isDownloadReady = false,
  onRequestUnlock,
  onDownloadFullPack,
}: AssetPackPreviewProps) {
  const currentState = unlockView?.currentState ?? 'preview_only'
  const unlockMeta = getUnlockMeta(unlockView)
  const UnlockIcon = unlockMeta.icon

  const mergedPlatforms = PLATFORM_ORDER.map((platform) => {
    const spec = getPlatformSpec(platform)
    const asset = platformAssets.find((item) => item.platform === platform)
    return {
      platform,
      label: spec.name,
      dimensions: `${asset?.width || spec.width} × ${asset?.height || spec.height}`,
      aspectRatio: spec.aspectRatio,
      description: spec.description,
      previewUrl: asset?.previewUrl || previewFallbackUrl || null,
      downloadUrl: asset?.downloadUrl || null,
    }
  })

  const handlePrimaryAction = () => {
    if (currentState === 'unlocked') {
      onDownloadFullPack?.()
      return
    }

    if (currentState === 'preview_only' || currentState === 'rejected') {
      onRequestUnlock?.()
    }
  }

  const primaryActionDisabled =
    currentState === 'requested' ||
    currentState === 'approved' ||
    (currentState === 'unlocked' && !isDownloadReady && !onDownloadFullPack)

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/80 to-background/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3 w-3" />
                卖家素材包预览
              </Badge>
              <Badge variant="outline" className={unlockMeta.accent}>
                <UnlockIcon className="mr-1 h-3 w-3" />
                {unlockMeta.badge}
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                先看交付长什么样，再决定是否解锁完整素材包
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {unlockMeta.description}
              </p>
            </div>
          </div>

          <div className="min-w-[240px] rounded-2xl border border-white/10 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              当前状态
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{getTimelineText(unlockView)}</p>
            <Button
              className="mt-4 w-full"
              disabled={primaryActionDisabled}
              onClick={handlePrimaryAction}
            >
              {getPrimaryActionLabel(currentState)}
              {!primaryActionDisabled && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            {currentState === 'unlocked' && !isDownloadReady && (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                ZIP 下载路由尚未接通，入口已预留，不再退回 GLB 主按钮。
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mergedPlatforms.map((platform) => (
          <Card key={platform.platform} className="border-white/10 bg-background/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{platform.label}</CardTitle>
                  <CardDescription>
                    {platform.aspectRatio} · {platform.dimensions}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-white/5 text-foreground">
                  {platform.platform}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                {platform.previewUrl ? (
                  <img
                    src={platform.previewUrl}
                    alt={platform.label}
                    className="aspect-[4/5] w-full object-cover opacity-90"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-gradient-to-br from-primary/15 via-transparent to-cyan-400/10" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-sm font-medium text-white">{platform.label}</p>
                  <p className="text-xs text-white/70">{platform.description}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5"
                disabled={!platform.previewUrl}
                onClick={() => {
                  if (platform.previewUrl) {
                    window.open(platform.previewUrl, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {platform.previewUrl ? '预览样张' : '素材整理中'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-background/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">平台文案摘要</CardTitle>
            <CardDescription>
              预览阶段先展示三端标题 / Hook，完整文案会跟随素材包一起交付。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">淘宝主图标题</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {copySummary?.taobaoTitle || (isLoading ? '正在整理淘宝主图标题…' : '生成完成后会在这里显示淘宝主图标题摘要。')}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">小红书封面标题</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {copySummary?.xiaohongshuTitle || (isLoading ? '正在整理小红书封面标题…' : '生成完成后会在这里显示小红书封面标题摘要。')}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">抖音竖图 Hook</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {copySummary?.douyinHook || (isLoading ? '正在整理抖音竖图 Hook…' : '生成完成后会在这里显示抖音封面 Hook。')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">策略摘要</CardTitle>
            <CardDescription>
              用来解释这套素材包应该先打哪一个平台、主卖点怎么讲。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">推荐平台</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {strategySummary?.recommendedPlatform || (isLoading ? 'AI 正在整理' : '待生成')}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">主卖点角度</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {strategySummary?.marketingHook || (isLoading ? '素材策略整理中…' : '生成完成后会在这里显示卖点方向。')}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">策略说明</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {strategySummary?.reasoningSummary || (isLoading ? '正在生成多平台策略说明…' : '等待素材包预览就绪后展示。')}
              </p>
              {strategySummary?.featureFocus && strategySummary.featureFocus.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {strategySummary.featureFocus.map((feature) => (
                    <Badge key={feature} variant="secondary" className="bg-white/5 text-foreground">
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!isReady && (
        <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
          {isLoading
            ? '正在从持久化结果中整理素材包预览，平台卡片会优先亮起，文案与策略摘要会随后补齐。'
            : '素材包快照尚未完全就绪，当前先展示结构化预览位。'}
        </div>
      )}
    </div>
  )
}
