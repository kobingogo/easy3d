'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export type GlowColor = 'blue' | 'purple' | 'pink' | 'green'
export type GlowIntensity = 'low' | 'medium' | 'high'

const glowColors: Record<GlowColor, { border: string; shadow: string; hoverShadow: string }> = {
  blue: {
    border: 'rgba(0, 212, 255, 0.3)',
    shadow: '0 0 20px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.1)',
    hoverShadow: '0 0 30px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.2)',
  },
  purple: {
    border: 'rgba(124, 58, 237, 0.3)',
    shadow: '0 0 20px rgba(124, 58, 237, 0.15), 0 0 40px rgba(124, 58, 237, 0.1)',
    hoverShadow: '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
  },
  pink: {
    border: 'rgba(255, 0, 110, 0.3)',
    shadow: '0 0 20px rgba(255, 0, 110, 0.15), 0 0 40px rgba(255, 0, 110, 0.1)',
    hoverShadow: '0 0 30px rgba(255, 0, 110, 0.3), 0 0 60px rgba(255, 0, 110, 0.2)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.3)',
    shadow: '0 0 20px rgba(0, 255, 136, 0.15), 0 0 40px rgba(0, 255, 136, 0.1)',
    hoverShadow: '0 0 30px rgba(0, 255, 136, 0.3), 0 0 60px rgba(0, 255, 136, 0.2)',
  },
}

const glowIntensity: Record<GlowIntensity, { opacity: number; hoverOpacity: number }> = {
  low: { opacity: 0.5, hoverOpacity: 0.8 },
  medium: { opacity: 1, hoverOpacity: 1.5 },
  high: { opacity: 1.5, hoverOpacity: 2 },
}

interface GlowingCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  glowColor?: GlowColor
  intensity?: GlowIntensity
  children: React.ReactNode
  className?: string
}

export function GlowingCard({
  glowColor = 'blue',
  intensity = 'medium',
  children,
  className,
  ...props
}: GlowingCardProps) {
  const colors = glowColors[glowColor]
  const intensityVal = glowIntensity[intensity]

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl bg-elevated/80 backdrop-blur-sm overflow-hidden',
        className
      )}
      style={{
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
      }}
      whileHover={{
        y: -4,
        boxShadow: colors.hoverShadow,
        borderColor: colors.border.replace('0.3', '0.6'),
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor === 'blue' ? 'rgba(0, 212, 255, 0.05)' : glowColor === 'purple' ? 'rgba(124, 58, 237, 0.05)' : glowColor === 'pink' ? 'rgba(255, 0, 110, 0.05)' : 'rgba(0, 255, 136, 0.05)'} 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}