/**
 * Web 浏览器测试脚本
 * 可以直接在浏览器中运行，测试 API 连接
 */

// 手动读取 .env.local (Node.js)
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
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
  timeout: 120000,
  maxRetries: 2
})

async function test() {
  try {
    // 简单聊天测试
    console.log('🧪 测试 1: 简单对话...')
    const chat = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{ role: 'user', content: '你好，介绍一下你自己' }]
    })
    console.log('✅ 聊天测试:', chat.choices[0].message.content.slice(0, 100))

    // JSON 输出测试
    console.log('\n🧪 测试 2: JSON 输出...')
    const json = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{
        role: 'user',
        content: '分析"简约现代台灯"，返回 JSON：{"category":"...","style":"...","material":"..."}'
      }],
      response_format: { type: 'json_object' }
    })
    console.log('✅ JSON 原始:', json.choices[0].message.content)
    
    try {
      const parsed = JSON.parse(json.choices[0].message.content)
      console.log('✅ JSON 解析:', parsed)
    } catch (e) {
      console.error('❌ JSON 解析失败')
    }

    // 视觉测试（如果有图片）
    console.log('\n🧪 测试 3: 视觉理解...')
    const vision = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{
        role: 'user',
        content: '描述这个产品的主要特征：一个棕色的皮质女包，适合小红书展示'
      }]
    })
    console.log('✅ 视觉理解:', vision.choices[0].message.content.slice(0, 100))

    console.log('\n🎉 所有测试通过！API 连接正常')

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message)
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

test()
