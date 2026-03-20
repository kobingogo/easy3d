'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HologramEffectProps {
  scanline?: boolean
  glitch?: boolean
  colorShift?: boolean
  children: React.ReactNode
  className?: string
  color?: 'blue' | 'purple' | 'green'
}

const hologramColors = {
  blue: {
    primary: 'rgba(0, 212, 255, 0.05)',
    secondary: 'rgba(0, 212, 255, 0.03)',
    scanline: 'rgba(0, 212, 255, 0.03)',
  },
  purple: {
    primary: 'rgba(124, 58, 237, 0.05)',
    secondary: 'rgba(124, 58, 237, 0.03)',
    scanline: 'rgba(124, 58, 237, 0.03)',
  },
  green: {
    primary: 'rgba(0, 255, 136, 0.05)',
    secondary: 'rgba(0, 255, 136, 0.03)',
    scanline: 'rgba(0, 255, 136, 0.03)',
  },
}

export function HologramEffect({
  scanline = true,
  glitch = false,
  colorShift = false,
  children,
  className,
  color = 'blue',
}: HologramEffectProps) {
  const colors = hologramColors[color]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-lg',
        glitch && 'animate-[glitch_0.3s_ease_infinite]',
        className
      )}
      style={{
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      }}
    >
      {/* Scanlines */}
      {scanline && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${colors.scanline} 2px, ${colors.scanline} 4px)`,
          }}
        />
      )}

      {/* Scanning animation */}
      {scanline && (
        <motion.div
          className="absolute left-0 right-0 h-[4px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.8), transparent)`,
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
          }}
          animate={{
            top: ['-10%', '110%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Color shift effect */}
      {colorShift && (
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1))',
              'linear-gradient(45deg, rgba(0,255,0,0.1), rgba(0,0,255,0.1), rgba(255,0,0,0.1))',
              'linear-gradient(45deg, rgba(0,0,255,0.1), rgba(255,0,0,0.1), rgba(0,255,0,0.1))',
              'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1))',
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}