'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Tag, Hash } from 'lucide-react'
import type { SearchResult, KnowledgeCategory } from '@/lib/rag/types'

interface SourceAttributionProps {
  sources: SearchResult[]
  className?: string
  onSourceClick?: (source: SearchResult) => void
}

const categoryColors: Record<KnowledgeCategory, { bg: string; text: string; border: string }> = {
  product_category: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  scene_design: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  lighting: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  style_template: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  platform_spec: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
}

const categoryLabels: Record<KnowledgeCategory, string> = {
  product_category: '商品品类',
  scene_design: '场景设计',
  lighting: '光照摄影',
  style_template: '风格模板',
  platform_spec: '平台规范'
}

export function SourceAttribution({ sources, className = '', onSourceClick }: SourceAttributionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (sources.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Hash className="h-4 w-4" />
        <span>引用来源 ({sources.length}条)</span>
      </div>

      <div className="space-y-2">
        {sources.map((source, index) => {
          const colors = categoryColors[source.entry.category]
          const isExpanded = expandedId === source.entry.id
          const score = source.rerankScore || source.score

          return (
            <motion.div
              key={source.entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : source.entry.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Category Badge */}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.text} ${colors.bg} border ${colors.border}`}>
                    {categoryLabels[source.entry.category]}
                  </span>

                  {/* Relevance Score */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.text.replace('text', 'bg')} transition-all duration-300`}
                        style={{ width: `${Math.min(score * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-3 space-y-3">
                      {/* Knowledge Text */}
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {source.entry.text}
                      </p>

                      {/* Tags */}
                      {source.entry.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {source.entry.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action */}
                      {onSourceClick && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSourceClick(source)
                          }}
                          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          查看原文
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Compact version for inline display
interface SourceBadgeProps {
  sources: SearchResult[]
  maxDisplay?: number
  className?: string
}

export function SourceBadge({ sources, maxDisplay = 3, className = '' }: SourceBadgeProps) {
  const displaySources = sources.slice(0, maxDisplay)
  const remaining = sources.length - maxDisplay

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {displaySources.map((source, index) => {
        const colors = categoryColors[source.entry.category]
        return (
          <span
            key={source.entry.id}
            className={`px-2 py-0.5 rounded text-xs ${colors.text} ${colors.bg} border ${colors.border}`}
            title={source.entry.text.slice(0, 100)}
          >
            {categoryLabels[source.entry.category]}
          </span>
        )
      })}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  )
}