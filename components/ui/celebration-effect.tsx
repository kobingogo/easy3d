'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, PartyPopper } from 'lucide-react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocity: { x: number; y: number }
  rotation: number
}

interface CelebrationEffectProps {
  isActive: boolean
  duration?: number
  onComplete?: () => void
  message?: string
}

const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4']

export function CelebrationEffect({
  isActive,
  duration = 3000,
  onComplete,
  message = '生成成功!'
}: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      setShowMessage(false)
      return
    }

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 50, // Start from center (percentage)
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocity: {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20 - 5
      },
      rotation: Math.random() * 360
    }))
    setParticles(newParticles)
    setShowMessage(true)

    // Auto dismiss
    const timer = setTimeout(() => {
      setShowMessage(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [isActive, duration, onComplete])

  if (!isActive) return null

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: `calc(${particle.x}vw - ${particle.size / 2}px)`,
                  y: `calc(${particle.y}vh - ${particle.size / 2}px)`,
                  scale: 0,
                  rotate: 0
                }}
                animate={{
                  x: `calc(${particle.x}vw + ${particle.velocity.x * 20}px)`,
                  y: `calc(${particle.y}vh + ${particle.velocity.y * 30}px)`,
                  scale: [0, 1, 0],
                  rotate: particle.rotation + 360
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                }}
              />
            ))}
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="h-6 w-6 text-amber-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground"
            >
              {message}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              您的 3D 模型已准备就绪
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Confetti effect (simpler version)
export function ConfettiEffect({ isActive }: { isActive: boolean }) {
  const [confetti, setConfetti] = useState<Array<{ id: number; delay: number; x: number }>>([])

  useEffect(() => {
    if (isActive) {
      setConfetti(
        Array.from({ length: 30 }, (_, i) => ({
          id: i,
          delay: Math.random() * 0.5,
          x: Math.random() * 100
        }))
      )
    } else {
      setConfetti([])
    }
  }, [isActive])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          initial={{ y: -20, x: `${c.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: Math.random() * 720 - 360,
            opacity: 0
          }}
          transition={{
            duration: 3,
            delay: c.delay,
            ease: 'easeIn'
          }}
          className="absolute w-3 h-3 bg-primary"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  )
}