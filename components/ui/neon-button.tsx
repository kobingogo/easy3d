'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef, useState, useCallback } from 'react'

export type NeonColor = 'blue' | 'purple' | 'pink' | 'green' | 'gradient'
export type NeonVariant = 'solid' | 'outline' | 'ghost'
export type NeonSize = 'sm' | 'md' | 'lg'

const neonColors: Record<NeonColor, { main: string; glow: string; text: string; bg?: string }> = {
  blue: {
    main: '#00D4FF',
    glow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
    text: '#00D4FF',
  },
  purple: {
    main: '#7C3AED',
    glow: '0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.3)',
    text: '#7C3AED',
  },
  pink: {
    main: '#FF006E',
    glow: '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
    text: '#FF006E',
  },
  green: {
    main: '#00FF88',
    glow: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
    text: '#00FF88',
  },
  gradient: {
    main: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
    glow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(124, 58, 237, 0.3)',
    text: '#fff',
    bg: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
  },
}

const sizeClasses: Record<NeonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
}

interface NeonButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: NeonVariant
  color?: NeonColor
  size?: NeonSize
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    {
      variant = 'outline',
      color = 'blue',
      size = 'md',
      loading = false,
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
    const colorConfig = neonColors[color]

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()

        setRipples((prev) => [...prev, { x, y, id }])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id))
        }, 600)

        onClick?.(e)
      },
      [disabled, loading, onClick]
    )

    const getButtonStyles = () => {
      if (variant === 'solid') {
        return {
          background: colorConfig.bg || colorConfig.main,
          border: 'none',
          color: colorConfig.text,
        }
      }
      if (variant === 'ghost') {
        return {
          background: 'transparent',
          border: 'none',
          color: colorConfig.text,
        }
      }
      // outline
      return {
        background: 'transparent',
        border: `2px solid ${colorConfig.main}`,
        color: colorConfig.text,
      }
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden font-semibold transition-colors duration-200',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={getButtonStyles()}
        whileHover={
          !disabled && !loading
            ? {
                boxShadow: colorConfig.glow,
                scale: 1.02,
              }
            : undefined
        }
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              background: colorConfig.main,
              opacity: 0.3,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.3 }}
            animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.span>
        )}

        {/* Content */}
        <span className={cn(loading && 'invisible')}>{children}</span>
      </motion.button>
    )
  }
)

NeonButton.displayName = 'NeonButton'