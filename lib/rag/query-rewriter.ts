/**
 * Query Rewriter 模块
 * 将用户查询改写为多个语义变体，提升向量检索召回率
 *
 * 策略：
 * 1. 同义词扩展 - 添加领域同义词
 * 2. 语义改写 - 用不同表达方式重述
 * 3. 关键词提取 - 提取核心实体词
 * 4. 类别推断 - 推测可能的类别关键词
 */

import OpenAI from 'openai'

// Lazy initialization - Coding Plan for qwen3.5-plus
let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (_client) return _client

  // Coding Plan has qwen3.5-plus access
  _client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL // Coding Plan
  })
  return _client
}

// 领域同义词词典
const DOMAIN_SYNONYMS: Record<string, string[]> = {
  // 商品品类
  '包': ['包包', '手袋', '背包', '提包', '挎包'],
  '化妆品': ['美妆', '彩妆', '护肤品', '美妆产品'],
  '手机': ['智能手机', '手机', '移动电话', '电话'],
  '手表': ['腕表', '时钟', '智能手表'],
  '鞋子': ['鞋', '鞋履', '运动鞋', '皮鞋'],
  '衣服': ['服装', '服饰', '衣物', '时装'],
  '珠宝': ['首饰', '饰品', '珠宝首饰'],
  '香水': ['香氛', '香水', '香精'],

  // 场景风格
  '高端': ['奢华', '高级', '精品', '精品'],
  '简约': ['极简', '简洁', '现代简约'],
  '复古': ['怀旧', '经典', '古典'],
  '科技感': ['未来感', '科技风', '赛博朋克'],
  '清新': ['自然', '清爽', '文艺'],

  // 展示方式
  '旋转': ['360度', '环绕', '全方位展示'],
  '特写': ['近景', '细节展示', '放大'],
  '背景': ['场景', '环境', '底色'],

  // 光照
  '亮': ['明亮', '高光', '阳光'],
  '暗': ['昏暗', '低调', '暗调'],
  '柔和': ['柔光', '漫反射', '温和'],
}

// 类别关键词映射
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'product_category': ['品类', '商品', '产品', '物品', '货品'],
  'scene_design': ['场景', '背景', '环境', '布置', '搭配'],
  'lighting': ['光', '灯光', '照明', '打光', '光线'],
  'style_template': ['风格', '样式', '模板', '效果', '调性'],
  'platform_spec': ['平台', '规范', '要求', '尺寸', '小红书', '抖音', '淘宝'],
}

export interface RewrittenQuery {
  original: string
  rewritten: string
  type: 'synonym' | 'semantic' | 'keyword' | 'category'
  confidence: number
}

export interface QueryRewriteResult {
  original: string
  rewrites: RewrittenQuery[]
  expandedQuery: string  // 合并后的扩展查询
}

/**
 * 基于规则的快速改写（无需 LLM）
 */
function ruleBasedRewrite(query: string): RewrittenQuery[] {
  const rewrites: RewrittenQuery[] = []

  // 1. 同义词扩展
  for (const [key, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
    if (query.includes(key)) {
      // 选择最相关的 1-2 个同义词
      const relevantSynonyms = synonyms.slice(0, 2)
      for (const syn of relevantSynonyms) {
        const rewritten = query.replace(key, syn)
        rewrites.push({
          original: query,
          rewritten,
          type: 'synonym',
          confidence: 0.8
        })
      }
      break // 只替换第一个匹配的同义词
    }
  }

  // 2. 类别关键词推断
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (query.includes(kw)) {
        // 添加类别相关的扩展词
        const categoryTerms = CATEGORY_KEYWORDS[category].filter(k => k !== kw).slice(0, 2)
        if (categoryTerms.length > 0) {
          rewrites.push({
            original: query,
            rewritten: `${query} ${categoryTerms.join(' ')}`,
            type: 'category',
            confidence: 0.7
          })
        }
        break
      }
    }
  }

  return rewrites
}

/**
 * 使用 LLM 进行语义改写
 */
async function llmRewrite(query: string): Promise<RewrittenQuery[]> {
  const client = getClient()

  try {
    const response = await client.chat.completions.create({
      model: 'qwen3.5-plus',
      messages: [{
        role: 'system',
        content: `你是一个电商3D展示领域的查询改写专家。将用户查询改写为2-3个语义等价但表达不同的变体。

改写原则：
1. 保持原意不变
2. 使用不同词汇和句式
3. 添加领域专业术语
4. 保持简洁

输出格式（JSON数组）：
["改写1", "改写2", "改写3"]`
      }, {
        role: 'user',
        content: query
      }],
      temperature: 0.3,
      max_tokens: 200
    })

    const content = response.choices[0].message.content || '[]'

    // 解析 JSON 数组
    let rewrites: string[] = []
    try {
      // 尝试直接解析
      rewrites = JSON.parse(content)
    } catch {
      // 尝试提取 JSON 数组
      const match = content.match(/\[[\s\S]*\]/)
      if (match) {
        rewrites = JSON.parse(match[0])
      }
    }

    return rewrites.map(r => ({
      original: query,
      rewritten: r,
      type: 'semantic' as const,
      confidence: 0.85
    }))

  } catch (error) {
    console.error('[QueryRewriter] LLM rewrite failed:', error)
    return []
  }
}

/**
 * 提取关键词
 */
function extractKeywords(query: string): string[] {
  // 简单的关键词提取：移除停用词，保留实词
  const stopWords = new Set([
    '的', '了', '是', '在', '有', '和', '与', '或', '这', '那', '个', '些',
    '要', '能', '会', '可以', '需要', '帮我', '请', '怎么', '如何', '什么',
    '一个', '这个', '那个', '哪些', '多少', '怎样'
  ])

  const words = query.split(/\s+|(?=[，。！？、])|(?<=[，。！？、])/)
  return words
    .filter(w => w.length > 1 && !stopWords.has(w))
    .filter(w => !/^[，。！？、\s]+$/.test(w))
}

/**
 * 主入口：查询改写
 */
export async function rewriteQuery(
  query: string,
  options: {
    useLLM?: boolean        // 是否使用 LLM 改写（默认 true）
    maxRewrites?: number    // 最大改写数量（默认 5）
    mergeOriginal?: boolean // 是否合并原查询（默认 true）
  } = {}
): Promise<QueryRewriteResult> {

  const {
    useLLM = true,
    maxRewrites = 5,
    mergeOriginal = true
  } = options

  const allRewrites: RewrittenQuery[] = []

  // 1. 基于规则的快速改写
  const ruleRewrites = ruleBasedRewrite(query)
  allRewrites.push(...ruleRewrites)

  // 2. LLM 语义改写（可选）
  if (useLLM) {
    const llmRewrites = await llmRewrite(query)
    allRewrites.push(...llmRewrites)
  }

  // 3. 关键词提取
  const keywords = extractKeywords(query)
  if (keywords.length > 0) {
    allRewrites.push({
      original: query,
      rewritten: keywords.join(' '),
      type: 'keyword',
      confidence: 0.6
    })
  }

  // 去重并按置信度排序
  const uniqueRewrites = Array.from(
    new Map(allRewrites.map(r => [r.rewritten, r])).values()
  )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxRewrites)

  // 4. 构建扩展查询
  const rewriteTexts = uniqueRewrites.map(r => r.rewritten)
  const expandedQuery = mergeOriginal
    ? [query, ...rewriteTexts].join(' ')
    : rewriteTexts.join(' ')

  return {
    original: query,
    rewrites: uniqueRewrites,
    expandedQuery
  }
}

/**
 * 轻量级改写（仅规则，无 LLM 调用）
 * 用于快速扩展查询
 */
export function quickRewrite(query: string): QueryRewriteResult {
  const ruleRewrites = ruleBasedRewrite(query)
  const keywords = extractKeywords(query)

  if (keywords.length > 0) {
    ruleRewrites.push({
      original: query,
      rewritten: keywords.join(' '),
      type: 'keyword',
      confidence: 0.6
    })
  }

  const rewriteTexts = ruleRewrites.map(r => r.rewritten)
  const expandedQuery = [query, ...rewriteTexts].join(' ')

  return {
    original: query,
    rewrites: ruleRewrites,
    expandedQuery
  }
}