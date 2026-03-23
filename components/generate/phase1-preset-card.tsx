'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BriefcaseBusiness, Handbag, ImageIcon, Layers3, MessageSquareText, Sparkles } from 'lucide-react'

const OUTPUTS = [
  '淘宝主图',
  '小红书封面',
  '抖音竖图',
  '平台文案',
]

const RECOMMENDATIONS = [
  'Phase 1 只聚焦包袋 / 小皮具，先把高频卖家素材链路打透。',
  '单图可快速起稿，包袋更推荐多视角，能更稳定识别包型、五金和开合结构。',
  '建议拍干净背景、正面主视角；多视角补充侧面、背面与提手细节。',
]

export function Phase1PresetCard() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-card/60 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="mr-1 h-3 w-3" />
            Phase 1 Seller Workflow
          </Badge>
          <Badge variant="secondary" className="bg-white/5 text-foreground">
            <Handbag className="mr-1 h-3 w-3" />
            包袋 / 小皮具
          </Badge>
        </div>
        <CardTitle className="text-xl">
          当前预设先服务卖家素材包，不再把 GLB 作为唯一交付物
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6">
          这一阶段不是“什么都能做”的技术展示，而是先把包袋商家最常用的一套内容跑顺：
          先生成可预览的素材包，再进入解锁与交付。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              输出交付
            </div>
            <div className="flex flex-wrap gap-2">
              {OUTPUTS.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                >
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Layers3 className="h-4 w-4 text-primary" />
              上传建议
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              包袋更适合使用多视角输入。除了正面主图，补充侧面与背面后，素材包会更容易保留轮廓比例、
              容量感和五金细节。
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquareText className="h-4 w-4 text-primary" />
            本阶段聚焦方式
          </div>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {RECOMMENDATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
