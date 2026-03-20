'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type GridColor = 'blue' | 'purple' | 'green'

const gridColors: Record<GridColor, { line: string; glow: string }> = {
  blue: {
    line: 'rgba(0, 212, 255, 0.1)',
    glow: '#00D4FF',
  },
  purple: {
    line: 'rgba(124, 58, 237, 0.1)',
    glow: '#7C3AED',
  },
  green: {
    line: 'rgba(0, 255, 136, 0.1)',
    glow: '#00FF88',
  },
}

interface CyberGridProps {
  color?: GridColor
  perspective?: number
  fadeToHorizon?: boolean
  className?: string
  gridSize?: number
  showHorizonGlow?: boolean
}

export function CyberGrid({
  color = 'blue',
  perspective = 500,
  fadeToHorizon = true,
  className,
  gridSize = 60,
  showHorizonGlow = true,
}: CyberGridProps) {
  const colors = gridColors[color]

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />

      {/* Grid */}
      <div
        className="absolute inset-0 origin-center"
        style={{
          backgroundImage: `
            linear-gradient(${colors.line} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.line} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          transform: `perspective(${perspective}px) rotateX(60deg)`,
          transformOrigin: 'center center',
          maskImage: fadeToHorizon
            ? 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)'
            : undefined,
        }}
      />

      {/* Horizon glow */}
      {showHorizonGlow && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
          <motion.div
            className="h-[2px] w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
              boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      )}

      {/* Radial glow in center */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.line.replace('0.1', '0.15')} 0%, transparent 50%)`,
        }}
      />

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
          boxShadow: `0 0 10px ${colors.glow}`,
        }}
        animate={{
          top: ['0%', '100%'],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}