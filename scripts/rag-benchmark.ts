/**
 * RAG 基准测试脚本
 * 评估知识库检索效果
 *
 * Usage: npm run test:rag [-- --verbose]
 */

import dotenv from 'dotenv'
import { join } from 'path'

// 加载 .env.local 文件
dotenv.config({ path: join(process.cwd(), '.env.local') })

import { readFileSync } from 'fs'
import { searchKnowledge } from '../lib/rag/search'
import { getStats } from '../lib/rag/qdrant'
import type { KnowledgeCategory } from '../lib/rag/types'

interface TestCase {
  id: string
  query: string
  expected_knowledge_ids: string[]
  expected_category: KnowledgeCategory
  difficulty: 'easy' | 'medium' | 'hard'
}

interface BenchmarkDataset {
  version: string
  created_at: string
  total_cases: number
  test_cases: TestCase[]
}

interface TestResult {
  testCase: TestCase
  found: boolean
  rank: number
  retrievedIds: string[]
  scores: number[]
  latency: number
}

interface BenchmarkMetrics {
  precisionAt3: number
  precisionAt5: number
  precisionAt10: number
  recallAt3: number
  recallAt5: number
  recallAt10: number
  mrr: number
  avgLatency: number
  totalTests: number
  successRate: number
  byCategory: Record<KnowledgeCategory, { precision: number; recall: number; count: number }>
  byDifficulty: Record<string, { precision: number; recall: number; count: number }>
}

const VERBOSE = process.argv.includes('--verbose')

function log(message: string, force = false) {
  if (VERBOSE || force) {
    console.log(message)
  }
}

/**
 * 计算 Precision@K
 */
function calculatePrecisionAtK(results: TestResult[], k: number): number {
  let totalRelevant = 0
  let totalRetrieved = 0

  for (const result of results) {
    const retrieved = result.retrievedIds.slice(0, k)
    const relevant = retrieved.filter(id =>
      result.testCase.expected_knowledge_ids.includes(id)
    ).length
    totalRelevant += relevant
    totalRetrieved += Math.min(k, result.testCase.expected_knowledge_ids.length)
  }

  return totalRetrieved > 0 ? totalRelevant / totalRetrieved : 0
}

/**
 * 计算 Recall@K
 */
function calculateRecallAtK(results: TestResult[], k: number): number {
  let totalFound = 0
  let totalExpected = 0

  for (const result of results) {
    const retrieved = result.retrievedIds.slice(0, k)
    const found = result.testCase.expected_knowledge_ids.filter(id =>
      retrieved.includes(id)
    ).length
    totalFound += found
    totalExpected += result.testCase.expected_knowledge_ids.length
  }

  return totalExpected > 0 ? totalFound / totalExpected : 0
}

/**
 * 计算 MRR (Mean Reciprocal Rank)
 */
function calculateMRR(results: TestResult[]): number {
  let totalRR = 0

  for (const result of results) {
    if (result.found && result.rank > 0) {
      totalRR += 1 / result.rank
    }
  }

  return results.length > 0 ? totalRR / results.length : 0
}

/**
 * 运行单个测试用例
 */
async function runTestCase(testCase: TestCase): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const results = await searchKnowledge(testCase.query, {
      limit: 10,
      enableRerank: true
    })

    const latency = Date.now() - startTime
    const retrievedIds = results.map(r => r.entry.id)

    // 找到第一个期望的知识的排名
    let rank = 0
    let found = false

    for (let i = 0; i < retrievedIds.length; i++) {
      if (testCase.expected_knowledge_ids.includes(retrievedIds[i])) {
        if (!found) {
          rank = i + 1
          found = true
        }
      }
    }

    return {
      testCase,
      found,
      rank,
      retrievedIds,
      scores: results.map(r => r.score),
      latency
    }
  } catch (error) {
    console.error(`Test case ${testCase.id} failed:`, error)
    return {
      testCase,
      found: false,
      rank: 0,
      retrievedIds: [],
      scores: [],
      latency: Date.now() - startTime
    }
  }
}

/**
 * 运行基准测试
 */
async function runBenchmark(): Promise<BenchmarkMetrics> {
  console.log('\n📊 RAG 基准测试')
  console.log('=' .repeat(50))

  // 1. 加载测试数据集
  const datasetPath = join(process.cwd(), 'tests/rag/benchmark-dataset.json')
  let dataset: BenchmarkDataset

  try {
    const content = readFileSync(datasetPath, 'utf-8')
    dataset = JSON.parse(content)
    console.log(`\n📁 加载测试数据集: ${dataset.total_cases} 个测试用例`)
  } catch (error) {
    console.error('❌ 无法加载测试数据集:', error)
    throw error
  }

  // 2. 检查知识库状态
  console.log('\n📚 知识库状态:')
  try {
    const stats = await getStats()
    console.log(`   总条目: ${stats.total}`)
    for (const [category, count] of Object.entries(stats.byCategory)) {
      console.log(`   ${category}: ${count}`)
    }
  } catch (error) {
    console.log('   ⚠️  无法获取知识库状态 (Qdrant 可能未连接)')
  }

  // 3. 运行测试
  console.log('\n🔍 运行测试用例...\n')
  const results: TestResult[] = []

  for (const testCase of dataset.test_cases) {
    const result = await runTestCase(testCase)
    results.push(result)

    const status = result.found ? '✅' : '❌'
    log(`  ${status} ${testCase.id}: "${testCase.query.substring(0, 30)}..." ` +
        `| Expected: ${testCase.expected_knowledge_ids.join(',')} ` +
        `| Found at rank: ${result.rank || 'N/A'} ` +
        `| Latency: ${result.latency}ms`)
  }

  // 4. 计算指标
  const metrics: BenchmarkMetrics = {
    precisionAt3: calculatePrecisionAtK(results, 3),
    precisionAt5: calculatePrecisionAtK(results, 5),
    precisionAt10: calculatePrecisionAtK(results, 10),
    recallAt3: calculateRecallAtK(results, 3),
    recallAt5: calculateRecallAtK(results, 5),
    recallAt10: calculateRecallAtK(results, 10),
    mrr: calculateMRR(results),
    avgLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length,
    totalTests: results.length,
    successRate: results.filter(r => r.found).length / results.length,
    byCategory: {} as Record<KnowledgeCategory, { precision: number; recall: number; count: number }>,
    byDifficulty: {}
  }

  // 按分类统计
  const categories: KnowledgeCategory[] = ['product_category', 'scene_design', 'lighting', 'style_template', 'platform_spec']
  for (const category of categories) {
    const categoryResults = results.filter(r => r.testCase.expected_category === category)
    if (categoryResults.length > 0) {
      metrics.byCategory[category] = {
        precision: calculatePrecisionAtK(categoryResults, 5),
        recall: calculateRecallAtK(categoryResults, 5),
        count: categoryResults.length
      }
    }
  }

  // 按难度统计
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const difficultyResults = results.filter(r => r.testCase.difficulty === difficulty)
    if (difficultyResults.length > 0) {
      metrics.byDifficulty[difficulty] = {
        precision: calculatePrecisionAtK(difficultyResults, 5),
        recall: calculateRecallAtK(difficultyResults, 5),
        count: difficultyResults.length
      }
    }
  }

  // 5. 输出结果
  console.log('\n📈 测试结果')
  console.log('=' .repeat(50))
  console.log(`\n📊 核心指标:`)
  console.log(`   Precision@3:  ${(metrics.precisionAt3 * 100).toFixed(2)}%`)
  console.log(`   Precision@5:  ${(metrics.precisionAt5 * 100).toFixed(2)}%`)
  console.log(`   Precision@10: ${(metrics.precisionAt10 * 100).toFixed(2)}%`)
  console.log(`   Recall@3:     ${(metrics.recallAt3 * 100).toFixed(2)}%`)
  console.log(`   Recall@5:     ${(metrics.recallAt5 * 100).toFixed(2)}%`)
  console.log(`   Recall@10:    ${(metrics.recallAt10 * 100).toFixed(2)}%`)
  console.log(`   MRR:          ${metrics.mrr.toFixed(4)}`)
  console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(2)}%`)
  console.log(`   Avg Latency:  ${metrics.avgLatency.toFixed(0)}ms`)

  console.log(`\n📂 按分类统计:`)
  for (const [category, stats] of Object.entries(metrics.byCategory)) {
    console.log(`   ${category}:`)
    console.log(`     Precision@5: ${(stats.precision * 100).toFixed(2)}% | Recall@5: ${(stats.recall * 100).toFixed(2)}% | Cases: ${stats.count}`)
  }

  console.log(`\n🎯 按难度统计:`)
  for (const [difficulty, stats] of Object.entries(metrics.byDifficulty)) {
    console.log(`   ${difficulty}:`)
    console.log(`     Precision@5: ${(stats.precision * 100).toFixed(2)}% | Recall@5: ${(stats.recall * 100).toFixed(2)}% | Cases: ${stats.count}`)
  }

  return metrics
}

// 执行测试
runBenchmark()
  .then(metrics => {
    console.log('\n✅ 基准测试完成')

    // 输出 JSON 格式结果供程序化使用
    if (VERBOSE) {
      console.log('\n📋 JSON Output:')
      console.log(JSON.stringify(metrics, null, 2))
    }

    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 基准测试失败:', error)
    process.exit(1)
  })