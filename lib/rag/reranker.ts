/**
 * Reranker 模块
 * 使用 LLM 对检索结果进行重排序，提升准确率 5-10%
 */

import OpenAI from 'openai'
import type { SearchResult, RerankResult } from './types'

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})

/**
 * 使用 qwen-plus 对文档相关性打分
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

  // 文档过长时截断
  const truncatedDocs = documents.map(doc =>
    doc.length > 500 ? doc.substring(0, 500) + '...' : doc
  )

  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{
      role: 'user',
      content: `你是一个相关性评估专家。请对以下文档与查询的相关性进行打分。

查询：${query}

文档列表：
${truncatedDocs.map((doc, i) => `[${i}] ${doc}`).join('\n\n')}

请返回 JSON 格式：
{
  "scores": [
    { "index": 0, "score": 0.95 },
    { "index": 1, "score": 0.72 }
  ]
}

评分标准：0-1 之间，1 表示完全相关，0 表示完全不相关。只返回 JSON，不要其他内容。`
    }],
    response_format: { type: 'json_object' }
  })

  try {
    const result = JSON.parse(response.choices[0].message.content || '{"scores":[]}')

    // 按分数降序排列，返回 topK
    return result.scores
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topK)
      .map((item: any) => ({
        index: item.index,
        relevanceScore: item.score
      }))
  } catch (error) {
    console.error('Rerank parsing error:', error)
    // 解析失败时返回原始顺序
    return documents.slice(0, topK).map((_, i) => ({
      index: i,
      relevanceScore: 0.5
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