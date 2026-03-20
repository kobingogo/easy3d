'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Play } from 'lucide-react'
import { ScrollReveal, AnimatedCounter } from '@/components/ui/scroll-reveal'
import { AnimatedBackground, CSSAnimatedBackground } from '@/components/ui/animated-background'
import { NeonButton } from '@/components/ui/neon-button'
import { GlowingCard } from '@/components/ui/glowing-card'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  onGetStarted?: () => void
  onWatchDemo?: () => void
}

export function HeroSection({ onGetStarted, onWatchDemo }: HeroSectionProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void">
      {/* Background */}
      {isMobile ? (
        <CSSAnimatedBackground />
      ) : (
        <AnimatedBackground />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal variant="fadeIn" delay={0.1}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/30 mb-8"
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
              style={{
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.1)'
              }}
            >
              <Sparkles className="h-4 w-4 text-neon-blue" />
              <span className="text-sm font-medium text-neon-blue">AI 驱动的 3D 生成平台</span>
            </motion.div>
          </ScrollReveal>

          {/* Main Title */}
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">
                30 秒生成
              </span>
              <br />
              <span
                className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 40px rgba(0, 212, 255, 0.3)'
                }}
              >
                专业级 3D 展示
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal variant="fadeUp" delay={0.3}>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              让电商卖家告别高昂的拍摄成本，一键生成淘宝、小红书、抖音多平台适配的产品 3D 展示
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal variant="fadeUp" delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <NeonButton
                variant="solid"
                color="gradient"
                size="lg"
                onClick={onGetStarted}
                className="min-w-[160px]"
              >
                免费开始
              </NeonButton>
              <NeonButton
                variant="outline"
                color="blue"
                size="lg"
                onClick={onWatchDemo}
                className="min-w-[160px]"
              >
                <Play className="h-5 w-5 mr-2" />
                观看演示
              </NeonButton>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal variant="fadeUp" delay={0.5}>
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: '#00D4FF',
                    textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
                  }}
                >
                  <AnimatedCounter value={99} suffix="%" />
                </div>
                <div className="text-sm text-zinc-500">成本降低</div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: '#7C3AED',
                    textShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
                  }}
                >
                  <AnimatedCounter value={1000} suffix="x" />
                </div>
                <div className="text-sm text-zinc-500">速度提升</div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: '#FF006E',
                    textShadow: '0 0 20px rgba(255, 0, 110, 0.5)'
                  }}
                >
                  <AnimatedCounter value={80} suffix="%" />
                </div>
                <div className="text-sm text-zinc-500">专业质量</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-zinc-500"
        >
          <span className="text-sm">向下滚动探索更多</span>
          <ArrowDown className="h-5 w-5 text-neon-blue" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Value proposition cards section
export function ValuePropSection() {
  const features = [
    {
      icon: '🎯',
      title: '30 秒快速生成',
      description: '上传产品图，AI 自动分析并生成专业 3D 展示'
    },
    {
      icon: '💰',
      title: '成本降低 99%',
      description: '告别传统拍摄的昂贵成本，AI 生成每个仅需几元'
    },
    {
      icon: '📱',
      title: '多平台适配',
      description: '一键输出淘宝、小红书、抖音等平台尺寸'
    },
    {
      icon: '🎨',
      title: '材质语义对齐',
      description: '说"丝滑"系统就懂，RAG 精准匹配 3D 材质'
    }
  ]

  return (
    <section className="py-20 px-4 bg-void">
      <div className="container mx-auto">
        <ScrollReveal variant="fadeIn" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            为什么选择 easy3d?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            专为电商卖家设计的 AI 3D 展示生成平台，让产品展示更专业、更高效
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
              <GlowingCard
                glowColor={i % 4 === 0 ? 'blue' : i % 4 === 1 ? 'purple' : i % 4 === 2 ? 'pink' : 'green'}
                className="p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </GlowingCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}