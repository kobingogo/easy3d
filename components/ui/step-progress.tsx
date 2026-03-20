'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Upload, Search, Cpu, CheckCircle2 } from 'lucide-react'

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Step {
  id: string
  name: string
  description: string
  status: StepStatus
  duration?: number
}

interface StepProgressProps {
  steps: Step[]
  className?: string
}

const stepIcons = {
  upload: Upload,
  analyze: Search,
  generate: Cpu,
  complete: CheckCircle2
}

export function StepProgress({ steps, className = '' }: StepProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop: Horizontal Steps */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <StepNode step={step} index={index} />
            {index < steps.length - 1 && (
              <StepConnector isComplete={step.status === 'completed'} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical Steps */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <StepNodeMobile step={step} index={index} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  step.status === 'running' ? 'text-primary' :
                  step.status === 'completed' ? 'text-green-500' :
                  step.status === 'failed' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {step.name}
                </span>
                {step.duration && (
                  <span className="text-xs text-muted-foreground">
                    {(step.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StepNode({ step, index }: { step: Step; index: number }) {
  const isActive = step.status === 'running'
  const isComplete = step.status === 'completed'
  const isFailed = step.status === 'failed'

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
          ${isComplete ? 'bg-green-500 text-white' : ''}
          ${isActive ? 'bg-primary text-white' : ''}
          ${isFailed ? 'bg-red-500 text-white' : ''}
          ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
        `}
        animate={isActive ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(var(--primary), 0.4)',
            '0 0 0 8px rgba(var(--primary), 0)',
            '0 0 0 0 rgba(var(--primary), 0)'
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.div>
          ) : (
            <motion.span
              key="number"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {index + 1}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <span className={`mt-2 text-xs font-medium ${
        isActive ? 'text-primary' : isComplete ? 'text-green-500' : 'text-muted-foreground'
      }`}>
        {step.name}
      </span>

      {step.duration && isComplete && (
        <span className="text-xs text-muted-foreground">
          {(step.duration / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  )
}

function StepNodeMobile({ step, index }: { step: Step; index: number }) {
  const isActive = step.status === 'running'
  const isComplete = step.status === 'completed'
  const isFailed = step.status === 'failed'

  return (
    <motion.div
      className={`
        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
        ${isComplete ? 'bg-green-500 text-white' : ''}
        ${isActive ? 'bg-primary text-white' : ''}
        ${isFailed ? 'bg-red-500 text-white' : ''}
        ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
      `}
      animate={isActive ? {
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
    >
      {isComplete ? <Check className="h-4 w-4" /> :
       isActive ? <Loader2 className="h-4 w-4 animate-spin" /> :
       index + 1}
    </motion.div>
  )
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="flex-1 mx-2 h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: isComplete ? '100%' : '0%' }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

// Preset steps for 3D generation
export const defaultSteps: Step[] = [
  { id: 'upload', name: '上传', description: '上传产品图片', status: 'pending' },
  { id: 'analyze', name: '分析', description: 'AI 分析产品属性', status: 'pending' },
  { id: 'generate', name: '生成', description: '生成 3D 模型', status: 'pending' },
  { id: 'complete', name: '完成', description: '导出结果', status: 'pending' }
]