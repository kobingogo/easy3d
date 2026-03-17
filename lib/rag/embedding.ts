/**
 * Embedding 模块
 * 支持：阿里云百炼 text-embedding-v3 或 OpenAI text-embedding-3-small
 *
 * 优先级：
 * 1. 如果有 OPENAI_API_KEY，使用 OpenAI embeddings
 * 2. 否则尝试 DashScope embeddings（需要标准 API key，不支持 Coding Plan Pro）
 */

import OpenAI from 'openai'

const EMBEDDING_DIMENSION = 1024

// Lazy initialization - client created on first use, not at module load time
// This ensures env vars are loaded before provider detection
let _client: OpenAI | null = null
let _useOpenAI: boolean | null = null
let _model: string | null = null

/**
 * Get or create the embedding client (lazy initialization)
 */
function getClient(): { client: OpenAI; useOpenAI: boolean; model: string } {
  if (_client && _useOpenAI !== null && _model) {
    return { client: _client, useOpenAI: _useOpenAI, model: _model }
  }

  // Detect provider at call time, not module load time
  // DashScope V1 API (has embedding access, not Coding Plan)
  const dashscopeKey = process.env.DASHSCOPE_API_KEY_V1
  const dashscopeBaseUrl = process.env.DASHSCOPE_BASE_URL_V1

  const useDashScopeV1 = !!dashscopeKey && !!dashscopeBaseUrl

  // OpenAI key must be valid format (starts with sk-, length > 20, not placeholder)
  const openaiKey = process.env.OPENAI_API_KEY
  const isOpenAIKeyValid = !useDashScopeV1 && openaiKey &&
    openaiKey.startsWith('sk-') &&
    openaiKey.length > 20 &&
    !openaiKey.includes('xxx') &&
    !openaiKey.includes('placeholder')

  _useOpenAI = !!isOpenAIKeyValid

  // Create the appropriate client
  _client = new OpenAI({
    apiKey: _useOpenAI ? openaiKey : (useDashScopeV1 ? dashscopeKey : process.env.DASHSCOPE_API_KEY),
    baseURL: _useOpenAI ? undefined : (useDashScopeV1 ? dashscopeBaseUrl : process.env.DASHSCOPE_BASE_URL)
  })

  // Select model based on provider
  // DashScope V1 OpenAI-compatible mode uses text-embedding-v3
  _model = _useOpenAI ? 'text-embedding-3-small' : 'text-embedding-v3'

  const providerName = _useOpenAI ? 'OpenAI' : (useDashScopeV1 ? 'DashScope V1' : 'DashScope Coding Plan')
  console.log(`[Embedding] Using ${providerName} embeddings (${_model})`)

  return { client: _client, useOpenAI: _useOpenAI, model: _model }
}

/**
 * 文本向量化
 * @param text 待向量化的文本
 * @returns 向量数组
 */
export async function embedding(text: string): Promise<number[]> {
  const { client, model } = getClient()
  const response = await client.embeddings.create({
    model,
    input: text,
    dimensions: EMBEDDING_DIMENSION
  })

  return response.data[0].embedding
}

/**
 * 批量文本向量化
 * @param texts 文本数组
 * @returns 向量数组
 */
export async function batchEmbedding(texts: string[]): Promise<number[][]> {
  const { client, model } = getClient()
  // 百炼 API 限制每批最多 10 条（DashScope V1 embedding 限制）
  const BATCH_SIZE = 10
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const response = await client.embeddings.create({
      model,
      input: batch,
      dimensions: EMBEDDING_DIMENSION
    })
    results.push(...response.data.map(d => d.embedding))

    // 避免速率限制
    if (i + BATCH_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * 获取向量维度
 */
export function getEmbeddingDimension(): number {
  return EMBEDDING_DIMENSION
}

/**
 * 获取模型名称
 */
export function getEmbeddingModel(): string {
  const { model } = getClient()
  return model
}