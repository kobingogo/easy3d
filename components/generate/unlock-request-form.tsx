'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2, Send, ShieldCheck } from 'lucide-react'

type UnlockState = 'preview_only' | 'requested' | 'approved' | 'rejected' | 'unlocked'
type ContactChannel = 'wechat' | 'phone' | 'xiaohongshu'

interface UnlockView {
  currentState: UnlockState
  currentRequestId: string | null
  latestRequestStatus: 'submitted' | 'approved' | 'rejected' | null
  submittedAt?: string
  rejectedAt?: string
  approvedAt?: string
  fulfilledAt?: string
}

export interface UnlockRequestSubmitResult {
  success: boolean
  unlockView?: UnlockView
}

interface UnlockRequestFormProps {
  modelId: string
  currentState: UnlockState
  onSubmitted?: (result: UnlockRequestSubmitResult) => void | Promise<void>
}

const CHANNEL_OPTIONS: Array<{ value: ContactChannel; label: string; placeholder: string }> = [
  { value: 'wechat', label: '微信', placeholder: '填写微信号，方便后续跟进' },
  { value: 'phone', label: '手机号', placeholder: '填写常用手机号' },
  { value: 'xiaohongshu', label: '小红书', placeholder: '填写小红书账号 / 昵称' },
]

const fieldClassName =
  'flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50'

export function UnlockRequestForm({
  modelId,
  currentState,
  onSubmitted,
}: UnlockRequestFormProps) {
  const [contactName, setContactName] = useState('')
  const [contactChannel, setContactChannel] = useState<ContactChannel>('wechat')
  const [contactValue, setContactValue] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const activeOption = useMemo(
    () => CHANNEL_OPTIONS.find((item) => item.value === contactChannel) ?? CHANNEL_OPTIONS[0],
    [contactChannel]
  )

  const isLockedForSubmission = currentState === 'requested' || currentState === 'approved' || currentState === 'unlocked'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLockedForSubmission) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/unlock-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          contactName,
          contactChannel,
          contactValue,
          note,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '提交解锁申请失败')
      }

      setSuccessMessage('申请已提交，我们会基于你填写的联系方式继续跟进。')
      setContactName('')
      setContactValue('')
      setNote('')
      await onSubmitted?.({
        success: true,
        unlockView: data.unlockView,
      })
    } catch (submitError: any) {
      const message = submitError?.message || '提交解锁申请失败'
      setError(message)
      await onSubmitted?.({
        success: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <ShieldCheck className="mr-1 h-3 w-3" />
            解锁完整素材包
          </Badge>
          {currentState === 'rejected' && (
            <Badge variant="outline" className="border-rose-400/30 bg-rose-400/10 text-rose-100">
              建议补充更明确的渠道备注
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">
          {currentState === 'rejected' ? '重新提交解锁申请' : '提交联系方式，申请完整交付'}
        </CardTitle>
        <CardDescription className="leading-6">
          预览阶段先确认素材方向，完整素材包的下载与交付会在审核通过后跟进。
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground">
              <span>联系人</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="怎么称呼你"
                className={fieldClassName}
                disabled={isSubmitting || isLockedForSubmission}
              />
            </label>

            <label className="space-y-2 text-sm text-foreground">
              <span>联系方式渠道</span>
              <select
                value={contactChannel}
                onChange={(event) => setContactChannel(event.target.value as ContactChannel)}
                className={fieldClassName}
                disabled={isSubmitting || isLockedForSubmission}
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-background text-foreground">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-foreground">
            <span>联系方式</span>
            <input
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
              placeholder={activeOption.placeholder}
              className={fieldClassName}
              disabled={isSubmitting || isLockedForSubmission}
            />
          </label>

          <label className="space-y-2 text-sm text-foreground">
            <span>备注</span>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可补充店铺定位、目标平台、想优先解锁的素材用途"
              className="min-h-24"
              disabled={isSubmitting || isLockedForSubmission}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || isLockedForSubmission}>
            <Send className="mr-2 h-4 w-4" />
            {isLockedForSubmission ? '当前状态暂不需要重复提交' : isSubmitting ? '提交中...' : '提交解锁申请'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
