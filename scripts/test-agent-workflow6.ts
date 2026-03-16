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

console.log('Loaded DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY?.slice(0, 20) + '...')

const OpenAI = require('openai').default
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
  timeout: 120000,
  maxRetries: 2
})

async function test() {
  try {
    console.log('Calling API...')
    const completion = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{ role: 'user', content: '你好' }]
    })
    console.log('✅ Success:', completion.choices[0].message.content)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

test()
