'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BeamDirection = 'horizontal' | 'vertical' | 'diagonal'
export type BeamSpeed = 'slow' | 'medium' | 'fast'

interface LightBeamProps {
  direction?: BeamDirection
  color?: string
  speed?: BeamSpeed
  width?: number
  className?: string
}

const speedValues: Record<BeamSpeed, number> = {
  slow: 8,
  medium: 4,
  fast: 2,
}

const directionStyles: Record<BeamDirection, React.CSSProperties> = {
  horizontal: {
    width: '200%',
    height: '2px',
    left: '-50%',
  },
  vertical: {
    width: '2px',
    height: '200%',
    top: '-50%',
  },
  diagonal: {
    width: '300%',
    height: '2px',
    left: '-100%',
    transform: 'rotate(45deg)',
    transformOrigin: 'center center',
  },
}

const directionAnimations: Record<BeamDirection, { x?: string[]; y?: string[] }> = {
  horizontal: { x: ['-50%', '50%'] },
  vertical: { y: ['-50%', '50%'] },
  diagonal: { x: ['-100%', '100%'] },
}

export function LightBeam({
  direction = 'horizontal',
  color = '#00D4FF',
  speed = 'medium',
  width = 100,
  className,
}: LightBeamProps) {
  const duration = speedValues[speed]
  const styles = directionStyles[direction]
  const animation = directionAnimations[direction]

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <motion.div
        className="absolute"
        style={{
          ...styles,
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.6,
        }}
        animate={animation}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}