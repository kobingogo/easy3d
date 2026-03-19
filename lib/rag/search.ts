/**
 * 知识库检索服务
 * 完整的 RAG 检索流程
 */

import OpenAI from 'openai'
import { embedding } from './embedding'
import { vectorSearch } from './qdrant'
import { rerankSearchResults } from './reranker'
import { rewriteQuery, quickRewrite } from './query-rewriter'
import { getCachedResults, setCachedResults } from './cache'
import type { KnowledgeCategory, SearchResult, SearchOptions } from './types'

// Lazy initialization - clients created on first use, not at module load time
// This ensures env vars are loaded before client creation
let _client: OpenAI | null = null

/**
 * Get or create the LLM client (lazy initialization)
 * Uses Coding Plan for qwen3.5-plus (cheaper, faster)
 */
function getClient(): OpenAI {
  if (_client) {
    return _client
  }

  // Coding Plan has qwen3.5-plus access
  _client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL // Coding Plan
  })

  console.log(`[Search] LLM client initialized with DashScope Coding Plan`)

  return _client
}

/**
 * 知识库检索
 */
export async function searchKnowledge(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {

  const {
    limit = 5,
    threshold = 0.5,  // Lowered from 0.7 to account for semantic similarity variation in Chinese text
    enableRerank = true,
    enableRewrite = true,
    rewriteMode = 'quick',
    ...filterOptions
  } = options

  // 0. 检查缓存
  const cached = getCachedResults(query, options)
  if (cached) {
    return cached
  }

  const startTime = Date.now()
  let searchQuery = query

  // 1. 查询改写（可选，提升召回率）
  if (enableRewrite) {
    const rewriteResult = rewriteMode === 'llm'
      ? await rewriteQuery(query, { useLLM: true, maxRewrites: 3 })
      : quickRewrite(query)

    searchQuery = rewriteResult.expandedQuery
    console.log(`[RAG] Query rewritten: "${query}" → "${searchQuery}" (${rewriteResult.rewrites.length} variants)`)
  }

  // 2. 向量化查询（使用改写后的查询）
  const queryVector = await embedding(searchQuery)

  // 3. 向量检索（召回更多候选用于重排序）
  const candidates = await vectorSearch(queryVector, {
    limit: enableRerank ? limit * 3 : limit,
    threshold,
    ...filterOptions
  })

  // 4. 重排序（可选，使用原始查询）
  let results: SearchResult[]
  if (enableRerank && candidates.length > limit) {
    results = await rerankSearchResults(query, candidates, limit)
    console.log(`[RAG] Search "${query}" took ${Date.now() - startTime}ms, found ${results.length} results with rerank`)
  } else {
    // 规则重排（priority 加权）
    results = candidates
      .map(r => ({
        ...r,
        score: r.score * (1 + (r.entry.priority - 3) * 0.1)  // priority 1-5
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    console.log(`[RAG] Search "${query}" took ${Date.now() - startTime}ms, found ${results.length} results`)
  }

  // 5. 缓存结果
  setCachedResults(query, options, results)

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
  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
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
  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
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