import { generate } from '../agent/llm'
import type { Platform } from '../export/platform-adapter'

export type CopyStyle = 'casual' | 'professional' | 'trendy'

export interface PlatformCopyInput {
  productDescription: string
  platform: Platform
  style?: CopyStyle
  productAnalysis?: {
    category?: string
    subcategory?: string
    keywords?: string[]
    style?: string[]
  }
}

export interface PlatformCopyResult {
  title: string
  content: string
  tags: string[]
}

const PLATFORM_PROMPTS: Record<Platform, string> = {
  xiaohongshu: `你是一个小红书种草文案专家。请为以下商品生成种草风格的文案。

要求：
1. 标题：吸引眼球，可用emoji，15-25字
2. 正文：
   - 开头用场景代入或疑问句吸引注意
   - 分点描述产品卖点（用emoji分隔）
   - 结尾引导互动（点赞收藏评论）
   - 适当使用emoji增加亲和力
   - 控制在300-500字
3. 标签：5-8个相关话题标签，格式为 #标签名

风格要点：
- 像朋友推荐一样自然
- 突出使用体验和感受
- 避免硬广感
- 可适当加入"姐妹们""真的绝了""冲"等网络用语`,

  taobao: `你是一个淘宝商品文案专家。请为以下商品生成电商详情页文案。

要求：
1. 标题：简洁专业，突出核心卖点，20-30字
2. 正文：
   - 第一段：产品简介和核心卖点（50字内）
   - 第二段：详细功能特点（分点描述）
   - 第三段：适用场景和人群
   - 结尾：促销信息或服务承诺
   - 控制在200-400字
3. 标签：3-5个搜索关键词，用空格分隔

风格要点：
- 专业可信
- 卖点清晰
- 突出性价比
- 引导下单`,

  douyin: `你是一个抖音短视频文案专家。请为以下商品生成短视频脚本文案。

要求：
1. 标题：吸睛开场，制造悬念，10-20字
2. 正文：
   - 开场白（0-3秒）：制造悬念或抛出痛点
   - 中间展示（3-15秒）：产品核心卖点展示
   - 结尾引导（15-20秒）：引导下单或关注
   - 控制在100-200字，适合口播
3. 标签：3-5个热门话题标签，格式为 #标签名

风格要点：
- 前3秒必须抓住眼球
- 口语化，适合朗读
- 节奏紧凑
- 适当使用网络热词`
}

export async function generatePlatformCopy(
  input: PlatformCopyInput
): Promise<PlatformCopyResult> {
  const {
    productDescription,
    platform,
    style = 'casual',
    productAnalysis
  } = input

  const platformPrompt = PLATFORM_PROMPTS[platform]
  const enhancedDescription = buildEnhancedDescription(
    productDescription,
    productAnalysis
  )

  const prompt = `${platformPrompt}

商品信息：
${enhancedDescription}

请以JSON格式返回结果：
{
  "title": "标题",
  "content": "正文内容",
  "tags": ["标签1", "标签2"],
  "style": "${style}"
}

只返回JSON，不要其他内容。`

  const result = await generate({
    model: 'qwen3.5-plus',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    responseFormat: { type: 'json_object' }
  })

  return parsePlatformCopyResponse(result.content)
}

function buildEnhancedDescription(
  productDescription: string,
  productAnalysis: PlatformCopyInput['productAnalysis']
): string {
  if (!productAnalysis) {
    return productDescription
  }

  return `
商品描述：${productDescription}
商品类别：${productAnalysis.subcategory || productAnalysis.category || '未知'}
商品风格：${productAnalysis.style?.join('、') || '未知'}
关键词：${productAnalysis.keywords?.join('、') || '未知'}
  `.trim()
}

function parsePlatformCopyResponse(content: string): PlatformCopyResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || '商品推荐',
        content: parsed.content || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      }
    }
  } catch (error) {
    console.error('[platform-copy] Failed to parse response:', error)
  }

  return {
    title: '商品推荐',
    content: content.slice(0, 500),
    tags: []
  }
}
