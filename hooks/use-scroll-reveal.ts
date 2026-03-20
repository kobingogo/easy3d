'use client'

import { useEffect, useRef, useState, RefObject } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
}

interface ScrollRevealState {
  isVisible: boolean
  hasTriggered: boolean
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): [RefObject<T | null>, ScrollRevealState] {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0
  } = options

  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Skip if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true)
              setHasTriggered(true)
            }, delay)
          } else {
            setIsVisible(true)
            setHasTriggered(true)
          }

          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, delay, hasTriggered])

  return [ref, { isVisible, hasTriggered }]
}

/**
 * Hook for mouse parallax effect
 */
export function useMouseParallax(intensity: number = 0.05) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * intensity
      const y = (e.clientY - window.innerHeight / 2) * intensity
      setOffset({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [intensity])

  return offset
}

/**
 * Hook for typewriter effect
 */
export function useTypewriter(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)
    setIsStarted(false)

    const startTimer = setTimeout(() => {
      setIsStarted(true)
    }, startDelay)

    return () => clearTimeout(startTimer)
  }, [text, startDelay])

  useEffect(() => {
    if (!isStarted) return

    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [isStarted, text, speed])

  return { displayText, isComplete, isStarted }
}

/**
 * Hook for counting animation
 */
export function useCountAnimation(end: number, duration: number = 2000, startDelay: number = 0) {
  const [count, setCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsComplete(true)
        }
      }
      requestAnimationFrame(animate)
    }, startDelay)

    return () => clearTimeout(startTimer)
  }, [end, duration, startDelay])

  return { count, isComplete }
}