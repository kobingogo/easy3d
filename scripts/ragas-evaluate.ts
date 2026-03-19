/**
 * RAGAS 自动评估脚本
 * 运行: npm run test:ragas [-- --verbose]
 */

import dotenv from 'dotenv'
import { join } from 'path'

// 加载 .env.local 文件
dotenv.config({ path: join(process.cwd(), '.env.local') })

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { searchKnowledge } from '../lib/rag/search'
import { evaluateRAGAS, batchEvaluateRAGAS, type RAGASCase, type RAGASResult } from '../lib/rag/evaluation'
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

interface RAGASReport {
  testDate: string
  totalCases: number
  avgMetrics: {
    faithfulness: number
    answerRelevancy: number
    contextPrecision: number
    avgLatency: number
  }
  results: RAGASResult[]
  byCategory: Record<string, { faithfulness: number; answerRelevancy: number; contextPrecision: number; count: number }>
  byDifficulty: Record<string, { faithfulness: number; answerRelevancy: number; contextPrecision: number; count: number }>
}

const VERBOSE = process.argv.includes('--verbose')
const SAMPLE_SIZE = process.argv.includes('--sample')
  ? parseInt(process.argv[process.argv.indexOf('--sample') + 1] || '10', 10)
  : 0  // 0 means all cases

function log(message: string, force = false) {
  if (VERBOSE || force) {
    console.log(message)
  }
}

/**
 * 生成 RAG 答案（基于检索结果）
 */
async function generateRAGAnswer(query: string, contexts: string[]): Promise<string> {
  const { OpenAI } = await import('openai')

  const client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY_V1 || process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL_V1 || process.env.DASHSCOPE_BASE_URL
  })

  const contextText = contexts.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')

  const response = await client.chat.completions.create({
    model: 'qwen3.5-plus',
    messages: [{
      role: 'user',
      content: `基于以下知识库内容回答问题。如果知识库中没有相关信息，请诚实说明。

知识库内容：
${contextText}

问题：${query}

要求：
1. 答案必须基于知识库内容
2. 标注引用来源，如 [1] [2]
3. 如果知识库信息不足，明确说明
4. 保持答案简洁、专业`
    }],
    temperature: 0.3
  })

  return response.choices[0].message.content || ''
}

/**
 * 运行单个 RAGAS 测试用例
 */
async function runRAGASTestCase(testCase: TestCase): Promise<RAGASResult | null> {
  try {
    // 1. 检索上下文
    const searchResults = await searchKnowledge(testCase.query, {
      limit: 5,
      enableRerank: true
    })

    const contexts = searchResults.map(r => r.entry.text)

    if (contexts.length === 0) {
      log(`  ⚠️  ${testCase.id}: 无检索结果，跳过评估`)
      return null
    }

    // 2. 生成答案
    const answer = await generateRAGAnswer(testCase.query, contexts)

    // 3. 构建 RAGAS 测试用例
    const ragasCase: RAGASCase = {
      id: testCase.id,
      question: testCase.query,
      answer,
      contexts
    }

    // 4. 执行 RAGAS 评估
    return await evaluateRAGAS(ragasCase)
  } catch (error) {
    console.error(`  ❌ ${testCase.id} 评估失败:`, error)
    return null
  }
}

/**
 * 运行 RAGAS 评估
 */
async function runRAGASEvaluation(): Promise<RAGASReport> {
  console.log('\n🧪 RAGAS 自动评估')
  console.log('='.repeat(50))

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
  } catch (error) {
    console.log('   ⚠️  无法获取知识库状态')
  }

  // 3. 采样或全量测试
  let testCases = dataset.test_cases
  if (SAMPLE_SIZE > 0 && SAMPLE_SIZE < testCases.length) {
    // 随机采样
    testCases = testCases.sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE)
    console.log(`\n🔬 采样模式: ${SAMPLE_SIZE} 个测试用例`)
  }

  // 4. 运行评估
  console.log('\n🔍 运行 RAGAS 评估...\n')
  const results: RAGASResult[] = []

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    log(`[${i + 1}/${testCases.length}] 评估: ${testCase.id}`)

    const result = await runRAGASTestCase(testCase)
    if (result) {
      results.push(result)
      log(`   Faithfulness: ${(result.metrics.faithfulness * 100).toFixed(1)}%`)
      log(`   Answer Relevancy: ${(result.metrics.answerRelevancy * 100).toFixed(1)}%`)
      log(`   Context Precision: ${(result.metrics.contextPrecision * 100).toFixed(1)}%`)
      log(`   Latency: ${result.metrics.latency}ms`)
    }
  }

  // 5. 计算平均指标
  const avgMetrics = {
    faithfulness: results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / results.length,
    answerRelevancy: results.reduce((sum, r) => sum + r.metrics.answerRelevancy, 0) / results.length,
    contextPrecision: results.reduce((sum, r) => sum + r.metrics.contextPrecision, 0) / results.length,
    avgLatency: results.reduce((sum, r) => sum + r.metrics.latency, 0) / results.length
  }

  // 6. 按分类统计
  const byCategory: Record<string, { faithfulness: number; answerRelevancy: number; contextPrecision: number; count: number }> = {}
  const categories: KnowledgeCategory[] = ['product_category', 'scene_design', 'lighting', 'style_template', 'platform_spec']

  for (const category of categories) {
    const categoryResults = results.filter((r, i) =>
      testCases.find(t => t.id === r.caseId)?.expected_category === category
    )
    if (categoryResults.length > 0) {
      byCategory[category] = {
        faithfulness: categoryResults.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / categoryResults.length,
        answerRelevancy: categoryResults.reduce((sum, r) => sum + r.metrics.answerRelevancy, 0) / categoryResults.length,
        contextPrecision: categoryResults.reduce((sum, r) => sum + r.metrics.contextPrecision, 0) / categoryResults.length,
        count: categoryResults.length
      }
    }
  }

  // 7. 按难度统计
  const byDifficulty: Record<string, { faithfulness: number; answerRelevancy: number; contextPrecision: number; count: number }> = {}
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const difficultyResults = results.filter((r, i) =>
      testCases.find(t => t.id === r.caseId)?.difficulty === difficulty
    )
    if (difficultyResults.length > 0) {
      byDifficulty[difficulty] = {
        faithfulness: difficultyResults.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / difficultyResults.length,
        answerRelevancy: difficultyResults.reduce((sum, r) => sum + r.metrics.answerRelevancy, 0) / difficultyResults.length,
        contextPrecision: difficultyResults.reduce((sum, r) => sum + r.metrics.contextPrecision, 0) / difficultyResults.length,
        count: difficultyResults.length
      }
    }
  }

  // 8. 输出结果
  console.log('\n📈 RAGAS 评估结果')
  console.log('='.repeat(50))
  console.log(`\n📊 平均指标:`)
  console.log(`   Faithfulness:      ${(avgMetrics.faithfulness * 100).toFixed(1)}%`)
  console.log(`   Answer Relevancy:  ${(avgMetrics.answerRelevancy * 100).toFixed(1)}%`)
  console.log(`   Context Precision: ${(avgMetrics.contextPrecision * 100).toFixed(1)}%`)
  console.log(`   Avg Latency:       ${avgMetrics.avgLatency.toFixed(0)}ms`)
  console.log(`   Evaluated Cases:   ${results.length}/${testCases.length}`)

  console.log(`\n📂 按分类统计:`)
  for (const [category, stats] of Object.entries(byCategory)) {
    console.log(`   ${category}:`)
    console.log(`     Faithfulness: ${(stats.faithfulness * 100).toFixed(1)}% | Answer Relevancy: ${(stats.answerRelevancy * 100).toFixed(1)}% | Context Precision: ${(stats.contextPrecision * 100).toFixed(1)}% | Cases: ${stats.count}`)
  }

  console.log(`\n🎯 按难度统计:`)
  for (const [difficulty, stats] of Object.entries(byDifficulty)) {
    console.log(`   ${difficulty}:`)
    console.log(`     Faithfulness: ${(stats.faithfulness * 100).toFixed(1)}% | Answer Relevancy: ${(stats.answerRelevancy * 100).toFixed(1)}% | Context Precision: ${(stats.contextPrecision * 100).toFixed(1)}% | Cases: ${stats.count}`)
  }

  // 9. 生成报告
  const report: RAGASReport = {
    testDate: new Date().toISOString().split('T')[0],
    totalCases: results.length,
    avgMetrics,
    results,
    byCategory,
    byDifficulty
  }

  // 10. 保存报告
  const reportsDir = join(process.cwd(), 'docs')
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true })
  }

  const reportPath = join(reportsDir, 'ragas-evaluation-report.md')
  const reportContent = generateReportMarkdown(report)
  writeFileSync(reportPath, reportContent)
  console.log(`\n📄 报告已保存: ${reportPath}`)

  return report
}

/**
 * 生成 Markdown 格式的报告
 */
function generateReportMarkdown(report: RAGASReport): string {
  return `# RAGAS 评估报告

## 测试概述

**测试日期:** ${report.testDate}
**评估用例数:** ${report.totalCases}
**评估框架:** RAGAS (Faithfulness + Answer Relevancy + Context Precision)

---

## 核心指标

| 指标 | 值 | 说明 |
|------|------|------|
| **Faithfulness** | ${(report.avgMetrics.faithfulness * 100).toFixed(1)}% | 答案是否基于上下文 |
| **Answer Relevancy** | ${(report.avgMetrics.answerRelevancy * 100).toFixed(1)}% | 答案是否回答了问题 |
| **Context Precision** | ${(report.avgMetrics.contextPrecision * 100).toFixed(1)}% | 检索的上下文是否相关 |
| **Avg Latency** | ${report.avgMetrics.avgLatency.toFixed(0)}ms | 评估延迟 |

---

## 分类分析

| 分类 | Faithfulness | Answer Relevancy | Context Precision | 用例数 |
|------|-------------|------------------|-------------------|--------|
${Object.entries(report.byCategory).map(([cat, stats]) =>
  `| ${cat} | ${(stats.faithfulness * 100).toFixed(1)}% | ${(stats.answerRelevancy * 100).toFixed(1)}% | ${(stats.contextPrecision * 100).toFixed(1)}% | ${stats.count} |`
).join('\n')}

---

## 难度分析

| 难度 | Faithfulness | Answer Relevancy | Context Precision | 用例数 |
|------|-------------|------------------|-------------------|--------|
${Object.entries(report.byDifficulty).map(([diff, stats]) =>
  `| ${diff} | ${(stats.faithfulness * 100).toFixed(1)}% | ${(stats.answerRelevancy * 100).toFixed(1)}% | ${(stats.contextPrecision * 100).toFixed(1)}% | ${stats.count} |`
).join('\n')}

---

## 指标说明

### Faithfulness (忠实度)
衡量生成的答案是否忠实于检索到的上下文。计算方式：
1. 从答案中提取所有事实性陈述 (claims)
2. 验证每个 claim 是否能从上下文推导
3. 得分 = 可验证的 claims / 总 claims

### Answer Relevancy (答案相关性)
衡量答案是否真正回答了用户问题。计算方式：
1. 基于答案生成潜在问题
2. 计算生成问题与原始问题的语义相似度
3. 得分 = 平均相似度

### Context Precision (上下文精确度)
衡量检索到的上下文是否与问题相关。计算方式：
1. LLM 评估每个上下文与问题的相关程度 (0-2)
2. 得分 = 平均相关度 / 2

---

## 改进建议

${generateImprovementSuggestions(report)}

---

## 附录：测试命令

\`\`\`bash
# 运行 RAGAS 评估
npm run test:ragas

# 详细输出
npm run test:ragas:verbose

# 采样测试（仅测试 10 个用例）
npm run test:ragas -- --sample 10
\`\`\`
`
}

/**
 * 生成改进建议
 */
function generateImprovementSuggestions(report: RAGASReport): string {
  const suggestions: string[] = []

  // Faithfulness 分析
  if (report.avgMetrics.faithfulness < 0.7) {
    suggestions.push('1. **Faithfulness 偏低** - 答案可能包含上下文之外的信息')
    suggestions.push('   - 建议：优化生成提示词，强制引用上下文来源')
    suggestions.push('   - 建议：增加 "信息不足" 场景的检测和处理')
  }

  // Answer Relevancy 分析
  if (report.avgMetrics.answerRelevancy < 0.7) {
    suggestions.push('2. **Answer Relevancy 偏低** - 答案可能未直接回答问题')
    suggestions.push('   - 建议：优化答案生成提示词，强调直接回答')
    suggestions.push('   - 建议：增加答案审核步骤，验证是否回答了问题')
  }

  // Context Precision 分析
  if (report.avgMetrics.contextPrecision < 0.7) {
    suggestions.push('3. **Context Precision 偏低** - 检索的上下文相关性不足')
    suggestions.push('   - 建议：优化检索阈值，过滤低相关性结果')
    suggestions.push('   - 建议：扩展知识库，增加高质量内容')
  }

  // 分类分析
  const weakCategories = Object.entries(report.byCategory)
    .filter(([_, stats]) => stats.contextPrecision < 0.5)
    .map(([cat, _]) => cat)

  if (weakCategories.length > 0) {
    suggestions.push(`4. **部分分类表现较弱** - ${weakCategories.join(', ')}`)
    suggestions.push('   - 建议：针对性地扩展这些分类的知识库内容')
  }

  return suggestions.length > 0 ? suggestions.join('\n') : '当前指标表现良好，继续保持。'
}

// 执行评估
runRAGASEvaluation()
  .then(report => {
    console.log('\n✅ RAGAS 评估完成')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ RAGAS 评估失败:', error)
    process.exit(1)
  })