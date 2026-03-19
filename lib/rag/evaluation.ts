/**
 * RAGAS 评估模块
 * 实现 Faithfulness 和 Answer Relevancy 自动评估
 */

import OpenAI from 'openai'
import { embedding } from './embedding'

// Lazy initialization
let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (_client) {
    return _client
  }

  _client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY_V1 || process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL_V1 || process.env.DASHSCOPE_BASE_URL
  })

  return _client
}

/**
 * RAGAS 评估指标
 */
export interface RAGASMetrics {
  faithfulness: number      // 忠实度 0-1 (答案是否基于上下文)
  answerRelevancy: number   // 答案相关性 0-1 (答案是否回答了问题)
  contextPrecision: number  // 上下文精确度 0-1 (检索的上下文是否相关)
  latency: number           // 评估延迟 (ms)
}

/**
 * RAGAS 评估用例
 */
export interface RAGASCase {
  id: string
  question: string
  answer: string
  contexts: string[]        // 检索到的上下文
  groundTruth?: string      // 可选的真实答案
}

/**
 * RAGAS 评估结果
 */
export interface RAGASResult {
  caseId: string
  metrics: RAGASMetrics
  details: {
    claimsExtracted: number
    claimsSupported: number
    generatedQuestions: string[]
    contextRelevanceScores: number[]
  }
}

/**
 * 从答案中提取 claims (断言)
 */
async function extractClaims(answer: string): Promise<string[]> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
    messages: [{
      role: 'user',
      content: `请从以下答案中提取所有事实性陈述（claims）。
每个 claim 应该是一个独立的、可以验证的陈述。

答案：
${answer}

要求：
1. 每行一个 claim
2. 只提取事实性陈述，不提取观点或建议
3. 保持原文语义，不要改写

输出格式：
- claim 1
- claim 2
...`
    }],
    temperature: 0
  })

  const content = response.choices[0].message.content || ''
  const claims = content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(claim => claim.length > 0)

  return claims
}

/**
 * 检验 claim 是否可以从上下文推导
 */
async function verifyClaimAgainstContext(
  claim: string,
  contexts: string[]
): Promise<boolean> {
  const client = getClient()

  const contextText = contexts.join('\n\n')

  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
    messages: [{
      role: 'user',
      content: `判断以下 claim 是否可以从给定的上下文中推导出来。

Claim: ${claim}

上下文：
${contextText}

要求：
- 如果 claim 可以直接从上下文推导，回答 "YES"
- 如果 claim 与上下文矛盾，回答 "NO"
- 如果上下文信息不足，回答 "NO"

只回答 YES 或 NO，不要解释。`
    }],
    temperature: 0
  })

  const answer = response.choices[0].message.content?.trim().toUpperCase()
  return answer === 'YES'
}

/**
 * 计算 Faithfulness (忠实度)
 * 衡量答案是否忠实于检索的上下文
 */
async function evaluateFaithfulness(
  answer: string,
  contexts: string[]
): Promise<{ score: number; claimsExtracted: number; claimsSupported: number }> {
  if (!answer || contexts.length === 0) {
    return { score: 0, claimsExtracted: 0, claimsSupported: 0 }
  }

  // 1. 提取 claims
  const claims = await extractClaims(answer)

  if (claims.length === 0) {
    return { score: 1, claimsExtracted: 0, claimsSupported: 0 }
  }

  // 2. 验证每个 claim
  let supportedCount = 0
  for (const claim of claims) {
    const isSupported = await verifyClaimAgainstContext(claim, contexts)
    if (isSupported) {
      supportedCount++
    }
  }

  // 3. 计算分数
  const score = supportedCount / claims.length

  return {
    score,
    claimsExtracted: claims.length,
    claimsSupported: supportedCount
  }
}

/**
 * 基于答案生成潜在问题
 */
async function generateQuestionsFromAnswer(answer: string, numQuestions: number = 3): Promise<string[]> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
    messages: [{
      role: 'user',
      content: `基于以下答案，生成 ${numQuestions} 个可能导致该答案的问题。

答案：
${answer}

要求：
1. 问题应该能够引出该答案
2. 问题应该具体、清晰
3. 每行一个问题，不要编号

输出格式：
问题 1
问题 2
问题 3`
    }],
    temperature: 0.5
  })

  const content = response.choices[0].message.content || ''
  const questions = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^\d+\./))

  return questions.slice(0, numQuestions)
}

/**
 * 计算 Answer Relevancy (答案相关性)
 * 衡量答案是否真正回答了问题
 */
async function evaluateAnswerRelevancy(
  question: string,
  answer: string
): Promise<{ score: number; generatedQuestions: string[] }> {
  if (!answer || !question) {
    return { score: 0, generatedQuestions: [] }
  }

  // 1. 基于答案生成潜在问题
  const generatedQuestions = await generateQuestionsFromAnswer(answer, 3)

  if (generatedQuestions.length === 0) {
    return { score: 0, generatedQuestions: [] }
  }

  // 2. 计算原始问题与生成问题的语义相似度
  const [questionVec, ...generatedVecs] = await Promise.all([
    embedding(question),
    ...generatedQuestions.map(q => embedding(q))
  ])

  // 3. 计算余弦相似度
  const similarities = generatedVecs.map(vec => {
    const dotProduct = questionVec.reduce((sum, a, i) => sum + a * vec[i], 0)
    const normA = Math.sqrt(questionVec.reduce((sum, a) => sum + a * a, 0))
    const normB = Math.sqrt(vec.reduce((sum, b) => sum + b * b, 0))
    return dotProduct / (normA * normB)
  })

  // 4. 平均相似度作为分数
  const score = similarities.reduce((sum, s) => sum + s, 0) / similarities.length

  return { score, generatedQuestions }
}

/**
 * 计算 Context Precision (上下文精确度)
 * 衡量检索的上下文是否与问题相关
 */
async function evaluateContextPrecision(
  question: string,
  contexts: string[]
): Promise<{ score: number; relevanceScores: number[] }> {
  if (contexts.length === 0) {
    return { score: 0, relevanceScores: [] }
  }

  const client = getClient()
  const relevanceScores: number[] = []

  for (const context of contexts) {
    const response = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{
        role: 'user',
        content: `判断以下上下文是否与问题相关。

问题：${question}

上下文：${context}

评分标准：
- 2: 高度相关，包含直接回答问题的关键信息
- 1: 部分相关，包含一些有用信息
- 0: 不相关，与问题无关

只输出数字 0、1 或 2，不要解释。`
      }],
      temperature: 0
    })

    const score = parseInt(response.choices[0].message.content?.trim() || '0', 10)
    relevanceScores.push(Math.min(2, Math.max(0, score)) / 2)
  }

  // 平均相关度作为分数
  const score = relevanceScores.reduce((sum, s) => sum + s, 0) / relevanceScores.length

  return { score, relevanceScores }
}

/**
 * 执行完整的 RAGAS 评估
 */
export async function evaluateRAGAS(testCase: RAGASCase): Promise<RAGASResult> {
  const startTime = Date.now()

  // 并行执行三个评估
  const [faithfulnessResult, relevancyResult, precisionResult] = await Promise.all([
    evaluateFaithfulness(testCase.answer, testCase.contexts),
    evaluateAnswerRelevancy(testCase.question, testCase.answer),
    evaluateContextPrecision(testCase.question, testCase.contexts)
  ])

  const metrics: RAGASMetrics = {
    faithfulness: faithfulnessResult.score,
    answerRelevancy: relevancyResult.score,
    contextPrecision: precisionResult.score,
    latency: Date.now() - startTime
  }

  return {
    caseId: testCase.id,
    metrics,
    details: {
      claimsExtracted: faithfulnessResult.claimsExtracted,
      claimsSupported: faithfulnessResult.claimsSupported,
      generatedQuestions: relevancyResult.generatedQuestions,
      contextRelevanceScores: precisionResult.relevanceScores
    }
  }
}

/**
 * 批量评估
 */
export async function batchEvaluateRAGAS(
  testCases: RAGASCase[],
  options: { verbose?: boolean } = {}
): Promise<{
  results: RAGASResult[]
  avgMetrics: RAGASMetrics
}> {
  console.log(`\n📊 RAGAS 评估开始`)
  console.log(`   测试用例数: ${testCases.length}`)

  const results: RAGASResult[] = []

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    if (options.verbose) {
      console.log(`\n[${i + 1}/${testCases.length}] 评估: ${testCase.id}`)
    }

    const result = await evaluateRAGAS(testCase)
    results.push(result)

    if (options.verbose) {
      console.log(`   Faithfulness: ${(result.metrics.faithfulness * 100).toFixed(1)}%`)
      console.log(`   Answer Relevancy: ${(result.metrics.answerRelevancy * 100).toFixed(1)}%`)
      console.log(`   Context Precision: ${(result.metrics.contextPrecision * 100).toFixed(1)}%`)
    }
  }

  // 计算平均指标
  const avgMetrics: RAGASMetrics = {
    faithfulness: results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / results.length,
    answerRelevancy: results.reduce((sum, r) => sum + r.metrics.answerRelevancy, 0) / results.length,
    contextPrecision: results.reduce((sum, r) => sum + r.metrics.contextPrecision, 0) / results.length,
    latency: results.reduce((sum, r) => sum + r.metrics.latency, 0) / results.length
  }

  return { results, avgMetrics }
}