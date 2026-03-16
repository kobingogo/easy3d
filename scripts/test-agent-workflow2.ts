import 'dotenv/config'
import { generate } from '../lib/agent/llm'

console.log('DASHSCOPE_API_KEY loaded:', process.env.DASHSCOPE_API_KEY?.slice(0, 20) + '...')
console.log('DASHSCOPE_BASE_URL:', process.env.DASHSCOPE_BASE_URL)

async function test() {
  try {
    const result = await generate({
      model: 'qwen3.5-plus',
      messages: [{ role: 'user', content: '你好，测试一下' }]
    })
    console.log('Success:', result.content)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

test()
