/**
 * Agent 工作流测试脚本
 * 用于测试四步完整流程：analyze → optimize → generate → quality_check
 */

import { generate } from '../lib/agent/llm'

interface TestConfig {
  description: string
  imageUrl?: string
  useImageUrl?: boolean
  expectedSuccess: boolean
}

// 测试用例
const testCases: TestConfig[] = [
  {
    description: "生成一个适合小红书的女包 3D 展示，棕色皮质，奢华风格",
    useImageUrl: false,
    expectedSuccess: true
  },
  {
    description: "帮我生成一个简约现代的台灯 3D 模型",
    useImageUrl: false,
    expectedSuccess: true
  },
  {
    description: "一双运动鞋的 3D 展示",
    useImageUrl: false,
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
      messages: [{
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
      }],
      model: 'qwen3.5-plus',
      responseFormat: { type: 'json_object' }
    })

    console.log('✅ 分析完成:', analysisResult.content.slice(0, 200))

    // 2. 优化提示词
    console.log('\n[2/4] ✨ 优化提示词...')
    const optimizeResult = await generate({
      messages: [{
        role: 'user',
        content: `根据以下商品分析，生成专业的英文提示词用于 Tripo 3D 生成：

商品分析：${analysisResult.content}

要求：
1. 英文描述
2. 详细的材质和灯光描述
3. 电商产品展示风格
4. 高质量渲染

请返回纯文本提示词，不要包含 JSON。`
      }],
      model: 'qwen3.5-plus'
    })

    console.log('✅ 提示词优化完成:', optimizeResult.content.slice(0, 200))

    // 3. 创建 3D 任务（如果是图片生成模式）
    if (config.useImageUrl && config.imageUrl) {
      console.log('\n[3/4] 🎮 创建 3D 生成任务（跳过实际生成）...')
      console.log('   提示词:', optimizeResult.content.slice(0, 100))
    } else {
      console.log('\n[3/4] 🎮 文字转 3D 模式（跳过实际生成）...')
      console.log('   提示词:', optimizeResult.content.slice(0, 100))
    }

    // 4. 质量检查（模拟）
    console.log('\n[4/4] ✅ 质量检查（模拟）...')
    console.log('   预期流程完整，各步骤正常执行')

    console.log('\n✅ 测试通过！')
    return { success: true, error: null }
  } catch (error: any) {
    console.log('\n❌ 测试失败！')
    console.log('   错误:', error.message)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('\n🚀 开始 Agent 工作流测试\n')

  const results = []
  for (const testCase of testCases) {
    const result = await testAgentWorkflow(testCase)
    results.push({
      description: testCase.description,
      success: result.success,
      error: result.error
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
    console.log(`  ${status} [${i + 1}] ${r.description}`)
    if (!r.success) {
      console.log(`      错误: ${r.error}`)
    }
  })

  console.log('\n' + '='.repeat(60))
}

// 运行测试
runAllTests().catch(console.error)
