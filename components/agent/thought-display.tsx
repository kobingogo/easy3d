'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Wrench, Eye, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react'
import type { Thought } from '@/lib/agent/types'

interface ThoughtDisplayProps {
  thoughts: Thought[]
  className?: string
  isStreaming?: boolean
  currentThought?: string
}

const thoughtConfig = {
  reasoning: {
    icon: Brain,
    label: '推理',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  action: {
    icon: Wrench,
    label: '动作',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  observation: {
    icon: Eye,
    label: '观察',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  }
}

// 打字机效果 Hook
function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsComplete(false)

    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, enabled])

  return { displayedText, isComplete }
}

// 单个思维块组件（带打字机效果）
interface ThoughtBlockProps {
  thought: Thought
  index: number
  showTypewriter?: boolean
}

function ThoughtBlock({ thought, index, showTypewriter = true }: ThoughtBlockProps) {
  const config = thoughtConfig[thought.type]
  const Icon = config.icon
  const { displayedText, isComplete } = useTypewriter(thought.content, 25, showTypewriter)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* 状态指示器 */}
      <div className={`p-1.5 rounded ${config.bgColor} relative`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        {!isComplete && showTypewriter && (
          <motion.div
            className="absolute inset-0 rounded border-2 border-current opacity-50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ borderColor: 'currentColor' }}
          />
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(thought.timestamp).toLocaleTimeString()}
          </span>
          {isComplete && showTypewriter && (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          )}
        </div>

        {/* 打字机文本 */}
        <p className="text-sm text-foreground/90 break-words">
          {displayedText}
          {!isComplete && showTypewriter && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
            />
          )}
        </p>
      </div>
    </motion.div>
  )
}

export function ThoughtDisplay({
  thoughts,
  className = '',
  isStreaming = false,
  currentThought
}: ThoughtDisplayProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {thoughts.map((thought, index) => (
          <ThoughtBlock
            key={thought.id}
            thought={thought}
            index={index}
            showTypewriter={index === thoughts.length - 1}
          />
        ))}
      </AnimatePresence>

      {/* 流式输出中的当前思维 */}
      {isStreaming && currentThought && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5"
        >
          <div className="p-1.5 rounded bg-primary/10">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">思考中...</span>
            </div>
            <p className="text-sm text-foreground/90 break-words">
              {currentThought}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
              />
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// 简化版本，用于步骤内嵌
interface ThoughtItemProps {
  thought: Thought
}

export function ThoughtItem({ thought }: ThoughtItemProps) {
  const config = thoughtConfig[thought.type]
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-2 p-2 rounded ${config.bgColor}`}>
      <Icon className={`h-3.5 w-3.5 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground/80 break-words">
          {thought.content}
        </p>
      </div>
    </div>
  )
}

// 步骤进度指示器组件
interface StepIndicatorProps {
  steps: Array<{
    id: string
    name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
  }>
  className?: string
}

export function StepIndicator({ steps, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: step.status === 'running' ? [1, 1.05, 1] : 1,
              opacity: step.status === 'pending' ? 0.5 : 1
            }}
            transition={{ duration: 0.3 }}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
              ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
              ${step.status === 'running' ? 'bg-primary text-white ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
              ${step.status === 'failed' ? 'bg-red-500 text-white' : ''}
              ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
            `}
          >
            {step.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : step.status === 'running' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              index + 1
            )}
          </motion.div>

          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}