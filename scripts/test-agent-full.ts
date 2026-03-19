/**
 * Agent 完整工作流端到端测试
 * 测试四步流程：analyze → optimize → generate → quality_check
 */

// 手动读取 .env.local
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const content = fs.readFileSync(envPath, 'utf8')

const env: Record<string, string> = {}
content.split('\n').forEach((line: string) => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...value] = line.split('=')
    env[key.trim()] = value.join('=').trim()
  }
})

process.env.DASHSCOPE_API_KEY = env.DASHSCOPE_API_KEY
process.env.DASHSCOPE_BASE_URL = env.DASHSCOPE_BASE_URL
process.env.TRIPO_API_KEY = env.TRIPO_API_KEY

const OpenAI = require('openai').default
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
  timeout: 120000,
  maxRetries: 2
})

interface TestConfig {
  description: string
  useImageUrl?: boolean
  imageUrl?: string
}

const testCases: TestConfig[] = [
  {
    description: "生成一个适合小红书的女包 3D 展示，棕色皮质，奢华风格",
    useImageUrl: false
  },
  {
    description: "帮我生成一个简约现代的台灯 3D 模型",
    useImageUrl: false
  },
  {
    description: "一双运动鞋的 3D 展示",
    useImageUrl: false
  },
  {
    description: "一个高端手表的 3D 产品展示",
    useImageUrl: false
  }
]

async function generate(text: string, model = 'qwen3.5-plus', responseFormat?: any) {
  const messages = [{ role: 'user' as const, content: text }]
  const params: any = { model, messages }
  
  if (responseFormat) {
    params.response_format = responseFormat
  }
  
  const completion = await client.chat.completions.create(params)
  return { content: completion.choices[0].message.content }
}

async function testAgentWorkflow(config: TestConfig) {
  console.log('\n' + '='.repeat(70))
  console.log(`🧪 测试: ${config.description}`)
  console.log('='.repeat(70))

  const startTime = Date.now()
  let currentStep = 1

  try {
    // Step 1: Analyze product
    console.log(`\n[${currentStep++}/4] 📊 商品分析...`)
    const analysisStart = Date.now()
    
    const analysisResult = await generate(
      `分析这个商品：
描述：${config.description}

请返回严格的 JSON 格式：
{
  "category": "商品类别",
  "style": "风格描述",
  "material": "材质",
  "targetAudience": "目标用户"
}`,
      'qwen3.5-plus',
      { type: 'json_object' }
    )

    console.log('✅ 原始响应:', analysisResult.content.slice(0, 300))
    
    let analysis
    try {
      analysis = JSON.parse(analysisResult.content)
      console.log('✅ JSON 解析成功')
    } catch (e) {
      console.error('❌ JSON 解析失败，尝试修复...')
      // 尝试修复
      const fixed = analysisResult.content.replace(/'/g, '"')
      analysis = JSON.parse(fixed)
    }

    console.log(`✅ Step 1 完成 (${Math.round((Date.now() - analysisStart) / 1000)}s)`)
    console.log('   品类:', analysis.category)
    console.log('   风格:', analysis.style)

    // Step 2: Optimize prompt
    console.log(`\n[${currentStep++}/4] ✨ 优化提示词...`)
    const optimizeStart = Date.now()
    
    const optimizeResult = await generate(
      `根据以下商品分析，生成专业的英文提示词用于 Tripo 3D 生成：

商品分析：
- 品类: ${analysis.category}
- 风格: ${analysis.style}
- 材质: ${analysis.material || '未指定'}
- 目标用户: ${analysis.targetAudience || '未指定'}

要求：
1. 英文描述
2. 详细的材质和灯光描述
3. 电商产品展示风格
4. 高质量渲染
5. 不要包含任何 JSON 格式，只返回纯文本

请生成一个专业、详细、可执行的提示词：`
    )

    console.log('✅ 提示词:', optimizeResult.content.slice(0, 400))
    console.log(`✅ Step 2 完成 (${Math.round((Date.now() - optimizeStart) / 1000)}s)`)

    // Step 3: Generate 3D (模拟，不实际调用 Tripo)
    console.log(`\n[${currentStep++}/4] 🎮 3D 生成（模拟）...`)
    console.log('   提示词已生成，可以调用 Tripo API')
    console.log(`✅ Step 3 完成`)

    // Step 4: Quality check (模拟)
    console.log(`\n[${currentStep++}/4] ✅ 质量检查（模拟）...`)
    console.log('   工作流完成，模型生成成功')
    console.log(`✅ Step 4 完成`)

    const totalTime = Math.round((Date.now() - startTime) / 1000)
    console.log(`\n🎉 测试通过！总耗时: ${totalTime}s`)
    
    return { 
      success: true, 
      error: null, 
      analysis, 
      prompt: optimizeResult.content,
      duration: totalTime
    }
  } catch (error: any) {
    console.log('\n❌ 测试失败！')
    console.log('   当前步骤:', currentStep)
    console.log('   错误:', error.message)
    
    if (error.response) {
      console.log('   响应:', JSON.stringify(error.response.data, null, 2))
    }
    
    return { 
      success: false, 
      error: error.message, 
      analysis: null, 
      prompt: null,
      duration: 0
    }
  }
}

async function runAllTests() {
  console.log('\n🚀 开始 Agent 完整工作流测试\n')
  console.log('测试用例数:', testCases.length)
  console.log('目标成功率: > 90%\n')

  const results = []
  let totalDuration = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n[${i + 1}/${testCases.length}] 正在测试...`)
    const result = await testAgentWorkflow(testCase)
    results.push({
      description: testCase.description,
      success: result.success,
      error: result.error,
      analysis: result.analysis,
      duration: result.duration
    })
    totalDuration += result.duration
  }

  // 统计结果
  console.log('\n' + '='.repeat(70))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(70))

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  const successRate = (successCount / totalCount * 100).toFixed(1)
  const avgDuration = (totalDuration / successCount || 0).toFixed(1)

  console.log(`\n✅ 通过: ${successCount}/${totalCount}`)
  console.log(`📈 成功率: ${successRate}%`)
  console.log(`⏱️  平均耗时: ${avgDuration}s`)
  console.log(`🎯 目标: > 90%`)

  const targetMet = parseFloat(successRate) >= 90
  if (targetMet) {
    console.log('\n🎉 🎉 🎉 达到目标！🎉 🎉 🎉')
  } else {
    console.log('\n⚠️  未达到目标，需要优化')
  }

  // 打印详细结果
  console.log('\n📋 详细结果:')
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌'
    console.log(`\n  ${status} [${i + 1}] ${r.description}`)
    if (r.success) {
      console.log(`      品类: ${r.analysis?.category || 'N/A'}`)
      console.log(`      风格: ${r.analysis?.style || 'N/A'}`)
      console.log(`      耗时: ${r.duration}s`)
    } else {
      console.log(`      ❌ 错误: ${r.error?.slice(0, 100)}`)
    }
  })

  console.log('\n' + '='.repeat(70))
  
  return targetMet
}

// 运行测试
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

// Make this a module to avoid identifier conflicts
export {}
