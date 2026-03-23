'use client'

import { HeroSection, ValuePropSection } from '@/components/landing/hero-section'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { GlowingCard } from '@/components/ui/glowing-card'
import { NeonButton } from '@/components/ui/neon-button'
import { CyberGrid } from '@/components/ui/cyber-grid'
import { ArrowRight, BadgeCheck, Clock3, Layers3, Package, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/generate'
  }

  const handleWatchDemo = () => {
    window.location.href = '/dashboard'
  }

  const workflowSteps = [
    {
      step: '01',
      icon: Package,
      title: '上传产品图并选品类',
      description: '先从包袋、小皮具等轻小件开始，把单张图整理成一个能预览的素材包。',
      detail: '支持主图、细节图和多角度补图，先把基础素材收拢。',
    },
    {
      step: '02',
      icon: Sparkles,
      title: '预览素材包并补齐卖点',
      description: '自动整理成主图、详情页、平台封面和标题卖点，先确认方向再往下走。',
      detail: '预览阶段免费，适合先试款、再决定是否解锁。',
    },
    {
      step: '03',
      icon: Layers3,
      title: '解锁下载并交给上架',
      description: '按淘宝、小红书、抖音的常用尺寸输出，拿去直接排版、投放或上架。',
      detail: '把素材、文案和尺寸一起交付给运营或设计。',
    },
  ]

  const sellerReasons = [
    {
      icon: ShieldCheck,
      title: '更少试错',
      description: '先预览，再解锁，不用一上来就把整套成本都押进去。',
      glowColor: 'blue' as const,
    },
    {
      icon: Clock3,
      title: '更快上新',
      description: '把产品图和卖点一起整理，适合补款、上新和平台首发。',
      glowColor: 'purple' as const,
    },
    {
      icon: BadgeCheck,
      title: '更适合小团队',
      description: '一个人也能跑通素材整理、预览和下载，不需要重搭一整条拍摄链路。',
      glowColor: 'green' as const,
    },
  ]

  return (
    <main className="min-h-screen bg-void">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} onWatchDemo={handleWatchDemo} />

      {/* Value Proposition Section */}
      <ValuePropSection />

      {/* Workflow Section */}
      <section id="workflow" className="relative py-20 px-4 bg-void overflow-hidden">
        <CyberGrid color="blue" className="opacity-30" />

        <div className="container mx-auto relative z-10">
          <ScrollReveal variant="fadeIn" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              素材任务怎么跑
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              把一次素材生产拆成 3 步：上传、预览、解锁。每一步都能继续往下走，不会卡在空白页。
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {workflowSteps.map((step) => (
              <StaggerItem key={step.step}>
                <GlowingCard glowColor={step.step === '01' ? 'blue' : step.step === '02' ? 'purple' : 'green'} className="h-full p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">{step.step}</div>
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <step.icon className="h-6 w-6 text-neon-blue" />
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-6">{step.description}</p>
                  <p className="mt-4 text-sm text-zinc-500 leading-6">{step.detail}</p>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Why Section */}
      <section className="relative py-20 px-4 bg-void overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 50%)'
          }}
        />

        <div className="container mx-auto relative z-10">
          <ScrollReveal variant="fadeIn" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              为什么适合中小卖家
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              不追求大而全，先把最常见、最刚需的素材流程做顺，重点是让小团队能真的用起来。
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sellerReasons.map((feature, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                <GlowingCard glowColor={feature.glowColor} className="p-6 h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-4 border border-white/10">
                    <feature.icon className="h-7 w-7 text-neon-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-6">{feature.description}</p>
                </GlowingCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-void overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)'
          }}
        />

        <div className="container mx-auto relative z-10">
          <ScrollReveal variant="fadeUp">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white"
                style={{
                  textShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
                }}
              >
                现在就把第一套素材包跑起来
              </h2>
              <p className="text-zinc-400 mb-8">
                先预览免费，确认方向后再解锁下载。非常适合包袋、小皮具和其他轻小件商品。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NeonButton
                  variant="solid"
                  color="gradient"
                  size="lg"
                  onClick={handleGetStarted}
                >
                  免费预览素材包
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </NeonButton>
                <NeonButton
                  variant="outline"
                  color="blue"
                  size="lg"
                  onClick={handleWatchDemo}
                >
                  查看任务面板
                </NeonButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 bg-void">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-zinc-500">
              © 2026 easy3d - 多平台商品素材包工作台
            </div>
            <div className="flex gap-6">
              <Link href="/generate" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
                开始生成
              </Link>
              <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-neon-purple transition-colors">
                素材任务
              </Link>
              <Link href="/#workflow" className="text-sm text-zinc-500 hover:text-neon-pink transition-colors">
                工作流
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
