'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TypewriterTextProps {
  text: string
  speed?: number
  cursor?: boolean
  cursorChar?: string
  onComplete?: () => void
  className?: string
  startDelay?: number
}

export function TypewriterText({
  text,
  speed = 50,
  cursor = true,
  cursorChar = '|',
  onComplete,
  className,
  startDelay = 0,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isStarted, setIsStarted] = useState(false)

  // Start after delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsStarted(true)
      setCurrentIndex(0)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [startDelay])

  // Typing effect
  useEffect(() => {
    if (!isStarted) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length) {
      onComplete?.()
    }
  }, [currentIndex, text, speed, isStarted, onComplete])

  const isComplete = currentIndex === text.length

  return (
    <span className={cn('inline', className)}>
      <span>{displayText}</span>
      {cursor && (
        <motion.span
          className="inline-block ml-[1px]"
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'stepEnd',
          }}
          style={{
            visibility: isComplete ? 'visible' : 'visible',
          }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  )
}

// Hook for programmatic use
export function useTypewriter(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isStarted, setIsStarted] = useState(false)

  const start = useCallback(() => {
    setIsStarted(true)
    setCurrentIndex(0)
    setDisplayText('')
  }, [])

  useEffect(() => {
    if (!isStarted) return

    if (currentIndex < 0) {
      const timeout = setTimeout(() => {
        setCurrentIndex(0)
      }, startDelay)
      return () => clearTimeout(timeout)
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed, isStarted, startDelay])

  return {
    displayText,
    isComplete: currentIndex === text.length,
    start,
    reset: () => {
      setDisplayText('')
      setCurrentIndex(-1)
      setIsStarted(false)
    },
  }
}