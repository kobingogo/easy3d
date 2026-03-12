/**
 * LLM 客户端封装
 * 阿里云百炼 Coding Plan Pro API，兼容 OpenAI SDK
 *
 * 可用模型 (Coding Plan Pro):
 * - qwen3.5-plus: 文本生成、深度思考、视觉理解
 * - qwen3-max-2026-01-23: 文本生成、深度思考
 * - qwen3-coder-plus: 文本生成（代码优化）
 * - glm-5, glm-4.7: 文本生成、深度思考
 *
 * Base URL: https://coding.dashscope.aliyuncs.com/v1 (OpenAI 兼容协议)
 */

import OpenAI from 'openai'
import type { Tool } from './types'

// 百炼 Coding Plan Pro 专用 Base URL
const BAILIAN_BASE_URL = 'https://coding.dashscope.aliyuncs.com/v1'

// 单例客户端
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: BAILIAN_BASE_URL
})

// 默认模型配置
const DEFAULT_TEXT_MODEL = 'qwen3.5-plus'
const DEFAULT_VISION_MODEL = 'qwen3.5-plus'  // qwen3.5-plus 支持视觉理解
const DEFAULT_CODER_MODEL = 'qwen3-coder-plus'

// 价格配置（包月套餐，实际不按 token 计费）
const PRICING: Record<string, { input: number; output: number }> = {
  'qwen3.5-plus': { input: 0, output: 0 },  // 包月
  'qwen3-max-2026-01-23': { input: 0, output: 0 },
  'qwen3-coder-plus': { input: 0, output: 0 },
  'glm-5': { input: 0, output: 0 },
  'glm-4.7': { input: 0, output: 0 }
}

export interface GenerateOptions {
  model?: 'qwen3.5-plus' | 'qwen3-max-2026-01-23' | 'qwen3-coder-plus' | 'glm-5' | 'glm-4.7'
  messages: Array<{ role: string; content: string }>
  tools?: Tool[]
  temperature?: number
  responseFormat?: { type: 'text' | 'json_object' }
}

export interface GenerateResult {
  content: string
  toolCalls?: Array<{
    id: string
    name: string
    arguments: any
  }>
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface VisionOptions {
  model?: 'qwen3.5-plus'  // qwen3.5-plus 支持视觉
  imageUrls: string[]
  prompt: string
}

export interface VisionResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * 文本生成
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const { model = DEFAULT_TEXT_MODEL, messages, tools, temperature = 0.7, responseFormat } = options

  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
    temperature,
    tools: tools?.map(t => ({
      type: 'function' as const,
      function: t.function
    })),
    response_format: responseFormat as any
  })

  const choice = response.choices[0]

  return {
    content: choice.message.content || '',
    toolCalls: choice.message.tool_calls?.map(tc => {
        if (tc.type === 'function') {
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments)
          }
        }
        return undefined
      }).filter((tc): tc is { id: string; name: string; arguments: any } => tc !== undefined),
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  }
}

/**
 * 视觉理解 (使用 qwen3.5-plus)
 */
export async function vision(options: VisionOptions): Promise<VisionResult> {
  const { model = DEFAULT_VISION_MODEL, imageUrls, prompt } = options

  const response = await client.chat.completions.create({
    model,
    messages: [{
      role: 'user',
      content: [
        ...imageUrls.map(url => ({
          type: 'image_url' as const,
          image_url: { url }
        })),
        { type: 'text' as const, text: prompt }
      ]
    }]
  })

  return {
    content: response.choices[0].message.content || '',
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  }
}

/**
 * 计算成本（包月套餐返回 0）
 */
export function calculateCost(model: string, tokens: number): number {
  // 包月套餐不按 token 计费
  return 0
}

/**
 * 获取模型价格
 */
export function getModelPricing(model: string): { input: number; output: number } {
  return PRICING[model] || { input: 0, output: 0 }
}

/**
 * 获取默认模型名称
 */
export function getDefaultModel(): string {
  return DEFAULT_TEXT_MODEL
}

/**
 * 获取默认视觉模型名称
 */
export function getDefaultVisionModel(): string {
  return DEFAULT_VISION_MODEL
}