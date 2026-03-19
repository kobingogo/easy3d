/**
 * Reranker 模块
 * 使用 DashScope TextReRank API 进行高效重排序
 * 从 LLM-based (~9-10s) 替换为专用 Reranker 模型 (<200ms)
 */

import type { SearchResult, RerankResult } from './types'

// DashScope TextReRank API 配置
const RERANK_MODEL = process.env.DASHSCOPE_RERANK_MODEL || 'gte-rerank-v2'

interface TextReRankRequest {
  model: string
  input: {
    query: string
    documents: string[]
  }
  parameters?: {
    top_k?: number
    return_documents?: boolean
  }
}

interface TextReRankResponse {
  output: {
    results: Array<{
      index: number
      relevance_score: number
      document?: string
    }>
  }
  usage: {
    total_tokens: number
  }
}

/**
 * 获取 DashScope API 配置
 */
function getApiConfig() {
  const baseURL = process.env.DASHSCOPE_BASE_URL_V1 || process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  const apiKey = process.env.DASHSCOPE_API_KEY_V1 || process.env.DASHSCOPE_API_KEY

  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is required for reranking')
  }

  return { baseURL, apiKey }
}

/**
 * 使用 DashScope TextReRank API 对文档相关性打分
 * @param query 查询文本
 * @param documents 文档列表
 * @param topK 返回前 K 个结果
 */
export async function rerank(
  query: string,
  documents: string[],
  topK: number = 5
): Promise<RerankResult[]> {

  if (documents.length === 0) return []

  const { baseURL, apiKey } = getApiConfig()
  const startTime = Date.now()

  // 文档过长时截断 (gte-rerank-v2 最大支持 8192 tokens)
  const truncatedDocs = documents.map(doc =>
    doc.length > 1000 ? doc.substring(0, 1000) + '...' : doc
  )

  const requestBody: TextReRankRequest = {
    model: RERANK_MODEL,
    input: {
      query,
      documents: truncatedDocs
    },
    parameters: {
      top_k: Math.min(topK, documents.length),
      return_documents: false
    }
  }

  try {
    // TextReRank API only available via native DashScope API path (not OpenAI-compatible mode)
    const rerankUrl = 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank'
    const response = await fetch(rerankUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TextReRank API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json() as TextReRankResponse

    const elapsed = Date.now() - startTime
    console.log(`[Reranker] TextReRank completed in ${elapsed}ms using ${RERANK_MODEL}`)

    // 转换为标准格式
    return data.output.results.map(result => ({
      index: result.index,
      relevanceScore: result.relevance_score
    }))

  } catch (error) {
    console.error('[Reranker] TextReRank API failed:', error)
    // 降级：返回原始顺序（按相似度分数）
    return documents.slice(0, topK).map((_, i) => ({
      index: i,
      relevanceScore: 1 - (i * 0.1) // 递减分数
    }))
  }
}

/**
 * 对 SearchResult 列表进行重排序
 */
export async function rerankSearchResults(
  query: string,
  results: SearchResult[],
  topK: number = 5
): Promise<SearchResult[]> {

  if (results.length === 0) return results

  const documents = results.map(r => r.entry.text)
  const rerankResults = await rerank(query, documents, Math.min(topK, results.length))

  return rerankResults.map(r => ({
    ...results[r.index],
    rerankScore: r.relevanceScore
  }))
}