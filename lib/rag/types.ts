/**
 * RAG 类型定义
 */

export type KnowledgeCategory =
  | 'product_category'    // 商品品类
  | 'scene_design'        // 场景设计
  | 'lighting'            // 光照摄影
  | 'style_template'      // 风格模板
  | 'platform_spec'       // 平台规范

export interface KnowledgeEntry {
  id: string                    // UUID
  text: string                  // 知识内容 (核心检索字段)
  vector?: number[]             // 嵌入向量 (入库后生成)
  category: KnowledgeCategory   // 分类
  tags: string[]                // 标签 (辅助过滤)
  keywords: string[]            // 关键词 (辅助检索)
  priority: number              // 优先级 1-5 (影响排序)
  source: string                // 来源 ("llm-generated" | "manual")
  examples?: string[]           // 示例商品
  metadata?: Record<string, any> // 扩展元数据
}

export interface SearchResult {
  entry: KnowledgeEntry
  score: number              // 相似度 0-1
  rerankScore?: number       // 重排序分数
  highlights?: string[]      // 高亮片段
}

export interface SearchOptions {
  category?: KnowledgeCategory
  tags?: string[]
  limit?: number
  threshold?: number
  enableRerank?: boolean     // 是否启用重排序
}

export interface RerankResult {
  index: number
  relevanceScore: number
}

// API 响应类型
export interface SearchAPIResponse {
  success: boolean
  results: SearchResult[]
  query: string
  latency: number
}