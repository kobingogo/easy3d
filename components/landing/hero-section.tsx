'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Play, Package, Layers3, BadgeCheck } from 'lucide-react'
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
              <span className="text-sm font-medium text-neon-blue">面向中小卖家的多平台商品素材包工作台</span>
            </motion.div>
          </ScrollReveal>

          {/* Main Title */}
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">
                一张产品图
              </span>
              <br />
              <span
                className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 40px rgba(0, 212, 255, 0.3)'
                }}
              >
                变成可预览的多平台素材包
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal variant="fadeUp" delay={0.3}>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              先把包袋、小皮具等商品图整理成可预览的素材包，再一键输出淘宝、小红书、抖音所需的主图、详情页和封面素材。先预览免费，确认后再解锁下载。
            </p>
          </ScrollReveal>

          {/* Focus chips */}
          <ScrollReveal variant="fadeIn" delay={0.35}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['包袋', '小皮具', '预览免费', '解锁下载'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
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
                免费预览素材包
              </NeonButton>
              <NeonButton
                variant="outline"
                color="blue"
                size="lg"
                onClick={onWatchDemo}
                className="min-w-[160px]"
              >
                <Play className="h-5 w-5 mr-2" />
                查看任务面板
              </NeonButton>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal variant="fadeUp" delay={0.5}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <GlowingCard glowColor="blue" className="p-4">
                <div className="flex items-center justify-center gap-2 text-neon-blue mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-[0.2em]">01 图</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter value={1} />
                </div>
                <div className="text-sm text-zinc-500 mt-1">一次上传</div>
              </GlowingCard>
              <GlowingCard glowColor="purple" className="p-4">
                <div className="flex items-center justify-center gap-2 text-neon-purple mb-2">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-[0.2em]">03 平台</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter value={3} />
                </div>
                <div className="text-sm text-zinc-500 mt-1">同步输出</div>
              </GlowingCard>
              <GlowingCard glowColor="green" className="p-4">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-[0.2em]">06 素材</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter value={6} />
                </div>
                <div className="text-sm text-zinc-500 mt-1">常用交付项</div>
              </GlowingCard>
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
      icon: '👜',
      title: '适用品类',
      description: '包袋、托特、斜挎、卡包、零钱包等轻小件商品，先从最常见的卖家场景开始。',
    },
    {
      icon: '📦',
      title: '输出内容',
      description: '主图、详情页长图、平台封面、标题卖点、短视频封面和上架备注，一次整理到位。',
    },
    {
      icon: '🎯',
      title: '交付方式',
      description: '先预览素材包，再决定是否解锁下载，适合小团队控制试错成本。',
    },
    {
      icon: '🚀',
      title: '上新节奏',
      description: '无需重新搭建拍摄链路，适合持续补款、上新和做平台首发图。',
    }
  ]

  return (
    <section className="relative py-20 px-4 bg-void overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 55%)'
        }}
      />
      <div className="container mx-auto">
        <ScrollReveal variant="fadeIn" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            适用品类与输出内容
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            先把卖家最常见的轻小件商品跑通，再按平台需要拆分出可预览、可解锁、可直接上架的素材包。
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1}>
              <GlowingCard glowColor={i % 4 === 0 ? 'blue' : i % 4 === 1 ? 'purple' : i % 4 === 2 ? 'pink' : 'green'} className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-2xl">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 leading-6">{feature.description}</p>
                  </div>
                </div>
                {i === 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['包袋', '托特', '斜挎', '卡包', '零钱包', '小皮具'].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                {i === 1 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['主图', '详情页', '封面图', '标题', '卖点短文案', '上架备注'].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </GlowingCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
