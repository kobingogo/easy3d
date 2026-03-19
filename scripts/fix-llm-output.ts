/**
 * 修复 LLM JSON 输出不稳定问题
 * 添加重试机制和输出验证
 */

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

const OpenAI = require('openai').default
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOANCE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
  timeout: 120000,
  maxRetries: 2
})

interface ValidationResult {
  valid: boolean
  data?: any
  error?: string
}

function validateJSON(text: string): ValidationResult {
  try {
    // 尝试解析
    const data = JSON.parse(text)
    
    // 验证是否包含必需字段
    if (!data.category || typeof data.category !== 'string') {
      return { valid: false, error: '缺少 category 字段或类型错误' }
    }
    
    if (!data.style || typeof data.style !== 'string') {
      return { valid: false, error: '缺少 style 字段或类型错误' }
    }
    
    return { valid: true, data }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}

function fixInvalidJSON(text: string): string {
  // 尝试修复常见问题
  let fixed = text.trim()
  
  // 移除开头结尾的非 JSON 内容
  const jsonStart = fixed.indexOf('{')
  const jsonEnd = fixed.lastIndexOf('}')
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    fixed = fixed.substring(jsonStart, jsonEnd + 1)
  }
  
  // 修复单引号
  fixed = fixed.replace(/'/g, '"')
  
  return fixed
}

async function generateWithRetry(
  description: string,
  maxRetries = 3
): Promise<{ analysis: any; attempts: number }> {
  console.log(`\n分析商品: "${description}"`)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`  尝试 ${attempt}/${maxRetries}...`)
    
    try {
      const result = await client.chat.completions.create({
        model: 'qwen3.5-plus',
        messages: [{
          role: 'user',
          content: `分析这个商品并严格返回 JSON 格式：
描述：${description}

**严格要求**：
1. 只返回 JSON，不要任何其他文字
2. 使用双引号
3. 包含以下字段：
{
  "category": "商品类别",
  "style": "风格描述",
  "material": "材质",
  "targetAudience": "目标用户"
}

**重要**：必须是有效的 JSON，不要包含解释或额外内容`
        }],
        response_format: { type: 'json_object' }
      })
      
      const text = result.choices[0].message.content
      console.log('  原始响应:', text.slice(0, 200))
      
      const fixed = fixInvalidJSON(text)
      const validation = validateJSON(fixed)
      
      if (validation.valid) {
        console.log('  ✅ 验证通过！')
        return { analysis: validation.data, attempts: attempt }
      } else {
        console.log(`  ⚠️ 验证失败: ${validation.error}`)
      }
      
    } catch (error: any) {
      console.error(`  ❌ 错误: ${error.message}`)
    }
  }
  
  throw new Error(`超出最大重试次数 (${maxRetries})`)
}

// 测试用例
const testCases = [
  "生成一个适合小红书的女包 3D 展示，棕色皮质，奢华风格",
  "简约现代的台灯 3D 模型",
  "一双运动鞋的 3D 展示",
  "高端手表的 3D 产品展示",
  "一个透明玻璃水杯"
]

async function runTests() {
  console.log('🚀 测试 LLM JSON 输出稳定性修复方案')
  
  const results = []
  
  for (const testCase of testCases) {
    try {
      const { analysis, attempts } = await generateWithRetry(testCase)
      results.push({ 
        success: true, 
        description: testCase,
        analysis,
        attempts
      })
      console.log(`✅ "${testCase}": ${JSON.stringify(analysis)}`)
    } catch (error: any) {
      results.push({ 
        success: false, 
        description: testCase,
        error: error.message,
        attempts: 0
      })
      console.log(`❌ "${testCase}": ${error.message}`)
    }
  }
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const avgAttempts = results.filter(r => r.success).reduce((sum, r) => sum + r.attempts, 0) / successCount
  
  console.log('\n📊 结果汇总:')
  console.log(`  成功率: ${successCount}/${testCases.length} (${(successCount / testCases.length * 100).toFixed(1)}%)`)
  console.log(`  平均尝试次数: ${avgAttempts.toFixed(1)}`)
  
  if (successCount === testCases.length) {
    console.log('🎉 所有测试通过！')
  }
}

runTests()

// Make this a module to avoid identifier conflicts
export {}
