import 'dotenv/config'
import OpenAI from 'openai'

// 直接创建客户端，不使用 lib/agent/llm
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
  timeout: 120000,
  maxRetries: 2
})

console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY?.slice(0, 20) + '...')

async function test() {
  try {
    const completion = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{ role: 'user', content: '你好' }]
    })
    console.log('✅ Success:', completion.choices[0].message.content)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

test()
