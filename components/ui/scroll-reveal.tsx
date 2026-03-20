'use client'

import { motion, MotionProps } from 'framer-motion'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { ReactNode } from 'react'

type AnimationVariant = 'fadeUp' | 'fadeIn' | 'scale' | 'slideLeft' | 'slideRight' | 'blur'

interface ScrollRevealProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  threshold?: number
  triggerOnce?: boolean
}

const variants: Record<AnimationVariant, MotionProps> = {
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' }
  }
}

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.5,
  className = '',
  threshold = 0.1,
  triggerOnce = true
}: ScrollRevealProps) {
  const [ref, { isVisible }] = useScrollReveal<HTMLDivElement>({
    threshold,
    triggerOnce
  })

  const variantProps = variants[variant]

  return (
    <div ref={ref} className={className}>
      <motion.div
        {...variantProps}
        initial={variantProps.initial}
        animate={isVisible ? variantProps.animate : variantProps.initial}
        exit={variantProps.exit}
        transition={{
          duration,
          delay,
          ease: [0.25, 0.4, 0.25, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Stagger children animation container
interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
  threshold?: number
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
  threshold = 0.1
}: StaggerContainerProps) {
  const [ref, { isVisible }] = useScrollReveal<HTMLDivElement>({
    threshold,
    triggerOnce: true
  })

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerDelay
            }
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Stagger child item
interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter component
interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = ''
}: AnimatedCounterProps) {
  const [ref, { isVisible }] = useScrollReveal<HTMLSpanElement>({
    threshold: 0.5,
    triggerOnce: true
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      >
        {isVisible ? (
          <CountUp end={value} duration={duration} />
        ) : (
          0
        )}
      </motion.span>
      {suffix}
    </span>
  )
}

function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return <>{count}</>
}

import { useState, useEffect } from 'react'