/**
 * Qdrant 向量数据库模块
 */

import { QdrantClient } from '@qdrant/js-client-rest'
import { createHash } from 'crypto'
import type { KnowledgeEntry, KnowledgeCategory, SearchResult } from './types'

const COLLECTION_NAME = 'product-knowledge'
const VECTOR_SIZE = 1024

// UUID namespace for deterministic ID conversion
const KNOWLEDGE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID namespace for DNS

/**
 * 将字符串 ID 转换为确定性 UUID v5
 * Qdrant Cloud 要求 point ID 必须是 UUID 或无符号整数
 */
function stringToUuid(id: string): string {
  // 使用 SHA-1 生成 20 字节哈希（UUID v5 要求）
  const hash = createHash('sha1')
    .update(KNOWLEDGE_NAMESPACE + id)
    .digest()

  // 设置 UUID v5 版本标志（第 6 字节高 4 位 = 5）
  hash[6] = (hash[6] & 0x0f) | 0x50
  // 设置 UUID 变体标志（第 8 字节高 2 位 = 10）
  hash[8] = (hash[8] & 0x3f) | 0x80

  // 格式化为 UUID 字符串
  const hex = hash.toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-')
}

// Lazy initialization - client created on first use, not at module load time
// This ensures env vars are loaded before client creation
let _client: QdrantClient | null = null

/**
 * Get or create the Qdrant client (lazy initialization)
 */
function getClient(): QdrantClient {
  if (_client) {
    return _client
  }

  const url = process.env.QDRANT_URL || 'http://localhost:6333'
  const apiKey = process.env.QDRANT_API_KEY

  _client = new QdrantClient({
    url,
    apiKey
  })

  console.log(`[Qdrant] Connecting to ${url}${apiKey ? ' with API key' : ' (no auth)'}`)

  return _client
}

/**
 * 初始化 Collection
 */
export async function initCollection(): Promise<void> {
  const client = getClient()
  const collections = await client.getCollections()

  if (!collections.collections.find(c => c.name === COLLECTION_NAME)) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine'
      }
    })
    console.log(`Collection ${COLLECTION_NAME} created`)
  }

  // 创建 payload 索引（Qdrant Cloud 要求过滤前必须创建索引）
  try {
    await client.createPayloadIndex(COLLECTION_NAME, {
      wait: true,
      field_name: 'category',
      field_schema: 'keyword'
    })
    console.log('Payload index created for: category')
  } catch (e: any) {
    if (!e.message?.includes('already exists')) {
      console.log('Note: category index may already exist')
    }
  }

  try {
    await client.createPayloadIndex(COLLECTION_NAME, {
      wait: true,
      field_name: 'tags',
      field_schema: 'keyword'
    })
    console.log('Payload index created for: tags')
  } catch (e: any) {
    if (!e.message?.includes('already exists')) {
      console.log('Note: tags index may already exist')
    }
  }
}

/**
 * 检查 Collection 是否存在
 */
export async function collectionExists(): Promise<boolean> {
  const client = getClient()
  const collections = await client.getCollections()
  return collections.collections.some(c => c.name === COLLECTION_NAME)
}

/**
 * 获取 Collection 信息
 */
export async function getCollectionInfo() {
  try {
    const client = getClient()
    return await client.getCollection(COLLECTION_NAME)
  } catch {
    return null
  }
}

/**
 * 插入知识条目
 */
export async function upsertEntries(entries: KnowledgeEntry[]): Promise<void> {
  const client = getClient()
  const points = entries.map(entry => ({
    id: stringToUuid(entry.id),  // Qdrant Cloud requires UUID format
    vector: entry.vector!,
    payload: {
      originalId: entry.id,  // Store original ID for reference
      text: entry.text,
      category: entry.category,
      tags: entry.tags,
      keywords: entry.keywords,
      priority: entry.priority,
      source: entry.source,
      examples: entry.examples || [],
      metadata: entry.metadata || {}
    }
  }))

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points
  })
}

/**
 * 删除知识条目
 */
export async function deleteEntries(ids: string[]): Promise<void> {
  const client = getClient()
  await client.delete(COLLECTION_NAME, {
    wait: true,
    points: ids
  })
}

/**
 * 向量检索
 */
export async function vectorSearch(
  queryVector: number[],
  options: {
    limit?: number
    threshold?: number
    category?: KnowledgeCategory
    tags?: string[]
  } = {}
): Promise<SearchResult[]> {

  const { limit = 5, threshold = 0.7, category, tags } = options

  // 构建过滤条件
  const filter: any = { must: [] }

  if (category) {
    filter.must.push({
      key: 'category',
      match: { value: category }
    })
  }

  if (tags && tags.length > 0) {
    filter.must.push({
      key: 'tags',
      match: { any: tags }
    })
  }

  const client = getClient()
  const response = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    score_threshold: threshold,
    filter: filter.must.length > 0 ? filter : undefined
  })

  return response.map(r => ({
    entry: {
      id: r.id as string,
      text: r.payload?.text as string,
      category: r.payload?.category as KnowledgeCategory,
      tags: r.payload?.tags as string[] || [],
      keywords: r.payload?.keywords as string[] || [],
      priority: r.payload?.priority as number || 3,
      source: r.payload?.source as string || 'manual',
      examples: r.payload?.examples as string[] || [],
      metadata: r.payload?.metadata as Record<string, any> || {}
    },
    score: r.score
  }))
}

/**
 * 获取所有条目（用于管理）
 */
export async function getAllEntries(options: {
  limit?: number
  offset?: number
  category?: KnowledgeCategory
} = {}): Promise<{ entries: KnowledgeEntry[], total: number }> {

  const { limit = 100, offset = 0, category } = options

  const filter = category ? {
    must: [{
      key: 'category',
      match: { value: category }
    }]
  } : undefined

  const client = getClient()
  const response = await client.scroll(COLLECTION_NAME, {
    limit,
    offset,
    with_payload: true,
    with_vector: false,
    filter
  })

  const entries: KnowledgeEntry[] = response.points.map(p => ({
    id: p.id as string,
    text: p.payload?.text as string,
    category: p.payload?.category as KnowledgeCategory,
    tags: p.payload?.tags as string[] || [],
    keywords: p.payload?.keywords as string[] || [],
    priority: p.payload?.priority as number || 3,
    source: p.payload?.source as string || 'manual',
    examples: p.payload?.examples as string[] || [],
    metadata: p.payload?.metadata as Record<string, any> || {}
  }))

  return {
    entries,
    total: entries.length // Qdrant scroll 不返回 total，需要单独查询
  }
}

/**
 * 获取统计信息
 */
export async function getStats(): Promise<{
  total: number
  byCategory: Record<KnowledgeCategory, number>
}> {
  const info = await getCollectionInfo()

  // 获取各分类数量
  const categories: KnowledgeCategory[] = [
    'product_category', 'scene_design', 'lighting', 'style_template', 'platform_spec'
  ]

  const byCategory: Record<KnowledgeCategory, number> = {} as any

  const client = getClient()
  for (const category of categories) {
    const result = await client.scroll(COLLECTION_NAME, {
      limit: 1,
      with_payload: false,
      with_vector: false,
      filter: {
        must: [{
          key: 'category',
          match: { value: category }
        }]
      }
    })
    byCategory[category] = result.points.length
  }

  return {
    total: info?.points_count || 0,
    byCategory
  }
}

export { COLLECTION_NAME, VECTOR_SIZE }