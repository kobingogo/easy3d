'use client'

import { HeroSection, ValuePropSection } from '@/components/landing/hero-section'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { GlowingCard } from '@/components/ui/glowing-card'
import { NeonButton } from '@/components/ui/neon-button'
import { CyberGrid } from '@/components/ui/cyber-grid'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Bot, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/generate'
  }

  const handleWatchDemo = () => {
    // TODO: Open demo video modal
    console.log('Watch demo clicked')
  }

  const capabilities = [
    {
      icon: Brain,
      title: 'RAG 智能检索',
      description: '508 条专业知识库，Precision@5 达 88%，精准匹配材质与场景',
      href: '/knowledge',
      glowColor: 'blue' as const,
      iconColor: 'text-neon-blue',
    },
    {
      icon: Bot,
      title: 'Agent 自动化',
      description: 'ReAct 模式工作流，自动分析、生成、质检，一键完成 3D 展示',
      href: '/agent',
      glowColor: 'purple' as const,
      iconColor: 'text-neon-purple',
    },
    {
      icon: Sparkles,
      title: 'Prompt 优化',
      description: '电商场景优化，质量提升 40%，专业级文案一键生成',
      href: '/fine-tune',
      glowColor: 'pink' as const,
      iconColor: 'text-neon-pink',
    }
  ]

  const features = [
    {
      icon: Zap,
      title: '极速生成',
      description: '30 秒完成从图片到 3D 模型的全流程',
      glowColor: 'blue' as const,
    },
    {
      icon: Shield,
      title: '质量保障',
      description: 'AI 自动质检，确保生成效果专业可靠',
      glowColor: 'green' as const,
    },
    {
      icon: Globe,
      title: '多平台适配',
      description: '一键输出淘宝、小红书、抖音多尺寸',
      glowColor: 'purple' as const,
    }
  ]

  return (
    <main className="min-h-screen bg-void">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} onWatchDemo={handleWatchDemo} />

      {/* Value Proposition Section */}
      <ValuePropSection />

      {/* Capabilities Section */}
      <section className="relative py-20 px-4 bg-void overflow-hidden">
        {/* Cyber grid background */}
        <CyberGrid color="blue" className="opacity-30" />

        <div className="container mx-auto relative z-10">
          <ScrollReveal variant="fadeIn" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              三大核心能力展示
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              作为 AI 前端工程师能力展示平台，我们实现了 RAG、Agent、Prompt 优化三大技术能力
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap, i) => (
              <StaggerItem key={i}>
                <Link href={cap.href}>
                  <GlowingCard glowColor={cap.glowColor} className="h-full p-6 cursor-pointer">
                    <cap.icon className={`h-10 w-10 mb-4 ${cap.iconColor}`} />
                    <h3 className="text-xl font-semibold mb-2 text-white">{cap.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{cap.description}</p>
                    <div className="flex items-center text-sm text-neon-blue">
                      查看演示 <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </GlowingCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 bg-void overflow-hidden">
        {/* Radial glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)'
          }}
        />

        <div className="container mx-auto relative z-10">
          <ScrollReveal variant="fadeIn" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              为电商卖家量身打造
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              告别传统拍摄的繁琐与高昂，让 AI 帮您轻松搞定产品展示
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
                <GlowingCard glowColor={feature.glowColor} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/10 mb-4 border border-neon-blue/30">
                    <feature.icon className="h-8 w-8 text-neon-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
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
                开始你的第一次 3D 生成
              </h2>
              <p className="text-zinc-400 mb-8">
                上传一张产品图，30 秒后见证 AI 的魔法
              </p>
              <NeonButton
                variant="solid"
                color="gradient"
                size="lg"
                onClick={handleGetStarted}
              >
                立即开始
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </NeonButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 bg-void">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-zinc-500">
              © 2026 easy3d - AI 前端工程师能力展示平台
            </div>
            <div className="flex gap-6">
              <Link href="/knowledge" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
                知识库
              </Link>
              <Link href="/agent" className="text-sm text-zinc-500 hover:text-neon-purple transition-colors">
                Agent
              </Link>
              <Link href="/fine-tune" className="text-sm text-zinc-500 hover:text-neon-pink transition-colors">
                Prompt 优化
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}