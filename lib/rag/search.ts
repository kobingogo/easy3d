/**
 * 知识库检索服务
 * 完整的 RAG 检索流程
 */

import OpenAI from 'openai'
import { embedding } from './embedding'
import { vectorSearch } from './qdrant'
import { rerankSearchResults } from './reranker'
import type { KnowledgeCategory, SearchResult, SearchOptions } from './types'

// 使用百炼 Coding Plan Pro API
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL
})

/**
 * 知识库检索
 */
export async function searchKnowledge(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {

  const {
    limit = 5,
    threshold = 0.7,
    enableRerank = true,
    ...filterOptions
  } = options

  const startTime = Date.now()

  // 1. 向量化查询
  const queryVector = await embedding(query)

  // 2. 向量检索（召回更多候选用于重排序）
  const candidates = await vectorSearch(queryVector, {
    limit: enableRerank ? limit * 3 : limit,
    threshold,
    ...filterOptions
  })

  // 3. 重排序（可选）
  if (enableRerank && candidates.length > limit) {
    const reranked = await rerankSearchResults(query, candidates, limit)
    console.log(`[RAG] Search "${query}" took ${Date.now() - startTime}ms, found ${reranked.length} results with rerank`)
    return reranked
  }

  // 4. 规则重排（priority 加权）
  const results = candidates
    .map(r => ({
      ...r,
      score: r.score * (1 + (r.entry.priority - 3) * 0.1)  // priority 1-5
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  console.log(`[RAG] Search "${query}" took ${Date.now() - startTime}ms, found ${results.length} results`)

  return results
}

/**
 * 检索并生成建议（RAG 完整流程）
 */
export async function suggestDisplay(
  productDescription: string,
  style?: string
): Promise<{
  suggestion: string
  references: SearchResult[]
}> {

  // 1. RAG 检索
  const knowledge = await searchKnowledge(
    `${productDescription} ${style || ''}`,
    {
      limit: 3
    }
  )

  // 2. LLM 生成
  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{
      role: 'user',
      content: `你是一个电商3D展示专家。基于以下专业知识，为商品推荐3D展示方案。

商品信息：${productDescription}
${style ? `风格偏好：${style}` : ''}

参考资料：
${knowledge.map((k, i) => `[${i + 1}] ${k.entry.text}`).join('\n\n')}

请给出：
1. 背景推荐
2. 光照设置
3. 展示角度
4. 注意事项

要求：专业、具体、可执行。`
    }]
  })

  return {
    suggestion: response.choices[0].message.content || '',
    references: knowledge
  }
}

/**
 * 智能问答
 */
export async function askKnowledge(
  question: string
): Promise<{
  answer: string
  references: SearchResult[]
}> {

  // 1. RAG 检索
  const knowledge = await searchKnowledge(question, {
    limit: 5,
    enableRerank: true
  })

  // 2. LLM 生成答案
  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [{
      role: 'user',
      content: `你是一个电商3D展示知识库助手。基于以下参考资料回答问题。

问题：${question}

参考资料：
${knowledge.map((k, i) => `[${i + 1}] ${k.entry.text}`).join('\n\n')}

要求：
- 基于参考资料回答，不要编造
- 如果参考资料不足以回答问题，请诚实说明
- 回答要专业、具体
- 标注引用来源（如 [1]、[2]）`
    }]
  })

  return {
    answer: response.choices[0].message.content || '',
    references: knowledge
  }
}