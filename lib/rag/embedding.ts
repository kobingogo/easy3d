/**
 * 阿里云百炼 Embedding 模块
 * 使用 text-embedding-v3 模型，1024 维向量
 *
 * 注意：Embedding API 可能不在 Coding Plan Pro 套餐中
 * 如果调用失败，需要优雅降级
 */

import OpenAI from 'openai'

// 阿里云百炼兼容 OpenAI SDK
// 注意：Embedding 需要使用标准 API，不在 Coding Plan Pro 中
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL
})

const EMBEDDING_MODEL = 'text-embedding-v3'
const EMBEDDING_DIMENSION = 1024

/**
 * 文本向量化
 * @param text 待向量化的文本
 * @returns 向量数组
 */
export async function embedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
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
  // 百炼 API 限制每批最多 25 条
  const BATCH_SIZE = 25
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
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
  return EMBEDDING_MODEL
}