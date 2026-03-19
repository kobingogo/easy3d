/**
 * 知识库构建脚本
 * 运行: npx tsx scripts/build-knowledge.ts
 */

import dotenv from 'dotenv'
import { join } from 'path'

// 加载 .env.local 文件
dotenv.config({ path: join(process.cwd(), '.env.local') })

import { initCollection, upsertEntries, collectionExists, getStats } from '../lib/rag/qdrant'
import { batchEmbedding } from '../lib/rag/embedding'
import { knowledgeBase, getKnowledgeStats } from './knowledge-base'

async function buildKnowledgeBase() {
  console.log('========================================')
  console.log('  知识库构建脚本')
  console.log('========================================\n')

  // 1. 显示知识库统计
  const stats = getKnowledgeStats()
  console.log('知识库统计:')
  console.log(`  总条目: ${stats.total}`)
  console.log('  分类:')
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`    - ${category}: ${count} 条`)
  }
  console.log('')

  // 2. 检查环境变量 (embedding.ts 使用 V1 API)
  const hasDashScopeV1 = process.env.DASHSCOPE_API_KEY_V1 && process.env.DASHSCOPE_BASE_URL_V1
  const hasOpenAI = process.env.OPENAI_API_KEY

  if (!hasDashScopeV1 && !hasOpenAI) {
    console.error('错误: 需要配置以下环境变量之一:')
    console.error('  - DASHSCOPE_API_KEY_V1 + DASHSCOPE_BASE_URL_V1 (推荐)')
    console.error('  - OPENAI_API_KEY')
    process.exit(1)
  }

  if (hasDashScopeV1) {
    console.log('DASHSCOPE_API_KEY_V1 已配置 ✓')
  } else {
    console.log('OPENAI_API_KEY 已配置 ✓')
  }

  // 3. 初始化 Collection（必须在 getStats 之前，确保索引存在）
  console.log('\n初始化 Collection...')
  await initCollection()
  console.log('Collection 初始化完成 ✓')

  // 4. 检查当前状态
  try {
    const currentStats = await getStats()
    console.log(`当前条目数: ${currentStats.total}`)
  } catch (error) {
    console.log('Collection 为空，准备写入数据')
  }

  // 5. 生成向量
  console.log('\n生成 Embedding 向量...')
  const texts = knowledgeBase.map(entry => entry.text)
  console.log(`共 ${texts.length} 条文本需要向量化`)

  const vectors = await batchEmbedding(texts)
  console.log(`向量生成完成 ✓ (${vectors.length} 条)`)

  // 6. 合并向量到条目
  const entriesWithVectors = knowledgeBase.map((entry, i) => ({
    ...entry,
    vector: vectors[i]
  }))

  // 7. 写入 Qdrant
  console.log('\n写入 Qdrant...')
  const BATCH_SIZE = 100

  for (let i = 0; i < entriesWithVectors.length; i += BATCH_SIZE) {
    const batch = entriesWithVectors.slice(i, i + BATCH_SIZE)
    await upsertEntries(batch)
    console.log(`  进度: ${Math.min(i + BATCH_SIZE, entriesWithVectors.length)}/${entriesWithVectors.length}`)
  }

  // 8. 验证
  console.log('\n验证写入结果...')
  const finalStats = await getStats()
  console.log(`最终条目数: ${finalStats.total}`)

  console.log('\n========================================')
  console.log('  知识库构建完成！')
  console.log('========================================')
}

// 运行
buildKnowledgeBase().catch(error => {
  console.error('构建失败:', error)
  process.exit(1)
})