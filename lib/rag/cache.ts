/**
 * RAG 查询缓存模块
 * 减少 Embedding 和 Rerank API 调用频率
 */

import { createHash } from 'crypto'
import type { SearchResult, SearchOptions } from './types'

interface CacheEntry {
  results: SearchResult[]
  timestamp: number
  query: string
  options: Partial<SearchOptions>
}

// 缓存配置
const CACHE_TTL = 1000 * 60 * 60 // 1小时
const MAX_CACHE_SIZE = 1000

// 内存缓存
const cache = new Map<string, CacheEntry>()

/**
 * 生成查询缓存 key
 */
function generateCacheKey(
  query: string,
  options: SearchOptions
): string {
  const normalizedQuery = query.toLowerCase().trim()
  const optionsKey = JSON.stringify({
    category: options.category,
    tags: options.tags,
    limit: options.limit,
    threshold: options.threshold,
    enableRerank: options.enableRerank,
    enableRewrite: options.enableRewrite,
    rewriteMode: options.rewriteMode
  })

  return createHash('md5')
    .update(normalizedQuery + optionsKey)
    .digest('hex')
}

/**
 * 获取缓存
 */
export function getCachedResults(
  query: string,
  options: SearchOptions
): SearchResult[] | null {
  const key = generateCacheKey(query, options)
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  // 检查是否过期
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  console.log(`[Cache] Hit for query "${query.slice(0, 30)}..."`)
  return entry.results
}

/**
 * 设置缓存
 */
export function setCachedResults(
  query: string,
  options: SearchOptions,
  results: SearchResult[]
): void {
  // 清理过期缓存
  cleanupExpiredCache()

  // 检查缓存大小
  if (cache.size >= MAX_CACHE_SIZE) {
    // 删除最旧的条目
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }

  const key = generateCacheKey(query, options)
  cache.set(key, {
    results,
    timestamp: Date.now(),
    query,
    options: {
      category: options.category,
      tags: options.tags,
      limit: options.limit,
      threshold: options.threshold,
      enableRerank: options.enableRerank,
      enableRewrite: options.enableRewrite,
      rewriteMode: options.rewriteMode
    }
  })

  console.log(`[Cache] Stored ${results.length} results for query "${query.slice(0, 30)}..."`)
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`[Cache] Cleaned ${cleaned} expired entries`)
  }
}

/**
 * 清空缓存
 */
export function clearCache(): void {
  cache.clear()
  console.log('[Cache] Cleared all entries')
}

/**
 * 获取缓存统计
 */
export function getCacheStats(): {
  size: number
  hitRate: number
  oldestEntry: number | null
} {
  let oldestTimestamp: number | null = null

  for (const entry of cache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp
    }
  }

  return {
    size: cache.size,
    hitRate: 0, // 需要额外追踪
    oldestEntry: oldestTimestamp ? Date.now() - oldestTimestamp : null
  }
}

/**
 * 批量查询优化
 * 将多个查询合并处理，减少 API 调用
 */
export class BatchQueryProcessor {
  private pending: Map<string, {
    query: string
    options: SearchOptions
    resolve: (results: SearchResult[]) => void
    reject: (error: Error) => void
  }[]> = new Map()

  private timeout: NodeJS.Timeout | null = null
  private batchDelay = 50 // 50ms 批量窗口

  /**
   * 添加查询到批处理队列
   */
  add(
    query: string,
    options: SearchOptions,
    executor: (query: string, options: SearchOptions) => Promise<SearchResult[]>
  ): Promise<SearchResult[]> {
    // 先检查缓存
    const cached = getCachedResults(query, options)
    if (cached) {
      return Promise.resolve(cached)
    }

    // 检查是否有相同的查询正在处理
    const key = generateCacheKey(query, options)

    if (!this.pending.has(key)) {
      this.pending.set(key, [])
    }

    return new Promise((resolve, reject) => {
      this.pending.get(key)!.push({ query, options, resolve, reject })

      // 延迟执行，等待更多查询
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => {
        this.executeBatch(executor)
      }, this.batchDelay)
    })
  }

  /**
   * 执行批量查询
   */
  private async executeBatch(
    executor: (query: string, options: SearchOptions) => Promise<SearchResult[]>
  ): Promise<void> {
    const pending = new Map(this.pending)
    this.pending.clear()
    this.timeout = null

    console.log(`[Batch] Processing ${pending.size} unique queries`)

    // 并行执行所有查询
    const promises = Array.from(pending.entries()).map(async ([key, items]) => {
      const { query, options } = items[0]

      try {
        const results = await executor(query, options)

        // 缓存结果
        setCachedResults(query, options, results)

        // 解析所有等待的 Promise
        items.forEach(item => item.resolve(results))
      } catch (error) {
        // 拒绝所有等待的 Promise
        items.forEach(item => item.reject(error as Error))
      }
    })

    await Promise.all(promises)
  }
}

// 全局批量处理器实例
export const batchProcessor = new BatchQueryProcessor()