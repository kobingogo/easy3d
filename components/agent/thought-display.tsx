'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Wrench, Eye, Lightbulb } from 'lucide-react'
import type { Thought } from '@/lib/agent/types'

interface ThoughtDisplayProps {
  thoughts: Thought[]
  className?: string
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

export function ThoughtDisplay({ thoughts, className = '' }: ThoughtDisplayProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {thoughts.map((thought, index) => {
          const config = thoughtConfig[thought.type]
          const Icon = config.icon

          return (
            <motion.div
              key={thought.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className={`p-1.5 rounded ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(thought.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 break-words">
                  {thought.content}
                </p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
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