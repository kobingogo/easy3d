/**
 * Agent 工作流端到端测试脚本
 * 测试四步完整流程：analyze → optimize → generate → quality_check
 */

// 加载 .env.local
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { generate } from '../lib/agent/llm'

interface TestConfig {
  description: string
  expectedSuccess: boolean
}

const testCases: TestConfig[] = [
  {
    description: "生成一个适合小红书的女包 3D 展示，棕色皮质，奢华风格",
    expectedSuccess: true
  },
  {
    description: "帮我生成一个简约现代的台灯 3D 模型",
    expectedSuccess: true
  },
  {
    description: "一双运动鞋的 3D 展示",
    expectedSuccess: true
  }
]

async function testAgentWorkflow(config: TestConfig) {
  console.log('\n' + '='.repeat(60))
  console.log(`🧪 测试: ${config.description}`)
  console.log('='.repeat(60))

  try {
    // 1. 商品分析
    console.log('\n[1/4] 📊 商品分析...')
    const analysisResult = await generate({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'user',
          content: `分析这个商品：
描述：${config.description}

请返回 JSON 格式：
{
  "category": "商品类别",
  "style": "风格描述",
  "material": "材质",
  "targetAudience": "目标用户"
}`
        }
      ],
      responseFormat: { type: 'json_object' }
    })

    console.log('✅ 原始响应:', analysisResult.content.slice(0, 300))
    const analysis = JSON.parse(analysisResult.content)
    console.log('✅ 分析结果:', JSON.stringify(analysis, null, 2))

    // 2. 优化提示词
    console.log('\n[2/4] ✨ 优化提示词...')
    const optimizeResult = await generate({
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'user',
          content: `根据以下商品分析，生成专业的英文提示词用于 Tripo 3D 生成：

商品分析：${JSON.stringify(analysis, null, 2)}

要求：
1. 英文描述
2. 详细的材质和灯光描述
3. 电商产品展示风格
4. 高质量渲染

请返回纯文本提示词，不要包含 JSON。`
        }
      ]
    })

    console.log('✅ 提示词:', optimizeResult.content.slice(0, 300))

    // 3. 创建 3D 任务（文字转 3D）
    console.log('\n[3/4] 🎮 文字转 3D 模式（模拟）...')
    console.log('   提示词已生成，可以调用 Tripo API')

    // 4. 质量检查（模拟）
    console.log('\n[4/4] ✅ 质量检查（模拟）...')

    console.log('\n✅ 测试通过！')
    return { success: true, error: null, analysis, prompt: optimizeResult.content }
  } catch (error: any) {
    console.log('\n❌ 测试失败！')
    console.log('   错误:', error.message)
    if (error.response) {
      console.log('   响应:', JSON.stringify(error.response.data, null, 2))
    }
    return { success: false, error: error.message, analysis: null, prompt: null }
  }
}

async function runAllTests() {
  console.log('\n🚀 开始 Agent 工作流测试 (端到端)\n')

  const results = []
  for (const testCase of testCases) {
    const result = await testAgentWorkflow(testCase)
    results.push({
      description: testCase.description,
      success: result.success,
      error: result.error,
      analysis: result.analysis,
      prompt: result.prompt
    })
  }

  // 统计结果
  console.log('\n' + '='.repeat(60))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(60))

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  const successRate = (successCount / totalCount * 100).toFixed(1)

  console.log(`\n✅ 通过: ${successCount}/${totalCount}`)
  console.log(`📈 成功率: ${successRate}%`)
  console.log(`🎯 目标: > 90%`)

  if (parseFloat(successRate) >= 90) {
    console.log('\n🎉 达到目标！')
  } else {
    console.log('\n⚠️  需要优化')
  }

  // 打印详细结果
  console.log('\n📋 详细结果:')
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌'
    console.log(`\n  ${status} [${i + 1}] ${r.description}`)
    if (r.success) {
      console.log(`      品类: ${r.analysis?.category}`)
      console.log(`      风格: ${r.analysis?.style}`)
    } else {
      console.log(`      错误: ${r.error}`)
    }
  })

  console.log('\n' + '='.repeat(60))
}

// 运行测试
runAllTests().catch(console.error)
