'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TEASER_ITEMS = [
  {
    id: 'taobao',
    title: '淘宝主图',
    subtitle: '1:1 · 800 × 800',
    description: '白底电商主图，突出产品主体与质感。',
  },
  {
    id: 'xiaohongshu',
    title: '小红书封面',
    subtitle: '3:4 · 1242 × 1660',
    description: '偏生活感构图，适合种草封面展示。',
  },
  {
    id: 'douyin',
    title: '抖音竖图',
    subtitle: '9:16 · 1080 × 1920',
    description: '竖屏抓眼版本，强化前几秒注意力。',
  },
]

export function InitialWorkbenchTeaser() {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">上传后你会先看到这些预览</CardTitle>
        <CardDescription>
          先确认三平台方向，再决定是否进入完整交付。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {TEASER_ITEMS.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <Badge variant="secondary" className="bg-white/5 text-foreground">
                预览
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
            <div className="mt-3 h-20 rounded-xl border border-dashed border-white/15 bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/10" />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
