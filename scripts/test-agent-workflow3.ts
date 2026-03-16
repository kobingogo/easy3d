const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
console.log('Reading from:', envPath)

const content = fs.readFileSync(envPath, 'utf8')
const lines = content.split('\n')

const envVars: Record<string, string> = {}
for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=')
    envVars[key.trim()] = value.trim()
  }
}

console.log('DASHSCOPE_API_KEY:', envVars.DASHSCOPE_API_KEY?.slice(0, 20) + '...')
console.log('DASHSCOPE_BASE_URL:', envVars.DASHSCOPE_BASE_URL)

process.env.DASHSCOPE_API_KEY = envVars.DASHSCOPE_API_KEY
process.env.DASHSCOPE_BASE_URL = envVars.DASHSCOPE_BASE_URL

const { generate } = require('../lib/agent/llm')

async function test() {
  try {
    const result = await generate({
      model: 'qwen3.5-plus',
      messages: [{ role: 'user', content: '你好' }]
    })
    console.log('✅ Success:', result.content)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

test()
