/**
 * Prompt Optimization Engine
 * Task 4.2: Prompt 优化引擎
 *
 * Template-based prompt optimization system with:
 * - Style-aware optimization (minimal, luxury, tech, natural, trendy)
 * - Platform-specific modifications (xiaohongshu, taobao, douyin, amazon)
 * - Quality scoring and confidence metrics
 * - Training data integration for enhanced prompts
 */

import {
  TrainingSample,
  ProductCategory,
  StyleType,
  PlatformType,
  getTrainingSamples,
  searchSamples,
  PRODUCT_TYPES,
  MATERIALS,
  COLORS
} from './data'

// ==================== 类型定义 ====================

export interface PromptOptimizerConfig {
  /** 默认风格 */
  defaultStyle?: StyleType
  /** 默认平台 */
  defaultPlatform?: PlatformType
  /** 是否启用 RAG 增强 */
  enableRag?: boolean
  /** 是否使用训练数据增强 */
  useTrainingData?: boolean
  /** 输出质量要求 */
  qualityLevel?: 'standard' | 'high' | 'ultra'
}

export interface OptimizationInput {
  /** 用户输入描述（中文） */
  description: string
  /** 商品图片 URL */
  imageUrl?: string
  /** 指定风格 */
  style?: StyleType
  /** 指定平台 */
  platform?: PlatformType
  /** 商品类别（可自动检测） */
  category?: ProductCategory
  /** 额外关键词 */
  extraKeywords?: string[]
}

export interface OptimizationResult {
  /** 优化后的英文提示词 */
  prompt: string
  /** 使用的风格 */
  style: StyleType
  /** 使用的平台 */
  platform: PlatformType
  /** 检测到的商品类别 */
  category: ProductCategory
  /** 置信度 (0-1) */
  confidence: number
  /** 质量评分 (1-10) */
  qualityScore: number
  /** 匹配的训练样本 */
  matchedSamples?: TrainingSample[]
  /** 灯光设置 */
  lighting: string
  /** 背景设置 */
  background: string
  /** 相机角度 */
  cameraAngle: string
  /** 关键词列表 */
  keywords: string[]
  /** 优化详情 */
  details: {
    inputTokens: number
    outputTokens: number
    templateUsed: string
    enhancements: string[]
  }
}

// ==================== 风格模板 ====================

export const PROMPT_TEMPLATES: Record<StyleType, {
  prefix: string
  suffix: string
  lighting: string
  background: string
  cameraAngle: string
  keywords: string[]
}> = {
  minimal: {
    prefix: 'Professional product photography, clean minimalist style,',
    suffix: 'soft diffused lighting, pure white background, high key lighting, commercial photography, 4K resolution, studio quality',
    lighting: 'soft diffused overhead lighting, soft shadows',
    background: 'clean white seamless background',
    cameraAngle: 'front view, centered composition',
    keywords: ['minimal', 'clean', 'white', 'professional', 'studio']
  },
  luxury: {
    prefix: 'Elegant luxury product photography, premium showcase,',
    suffix: 'sophisticated lighting with warm golden highlights, gradient background, high-end commercial photography, 8K resolution, exquisite detail',
    lighting: 'dramatic studio lighting, warm accent lights, rim lighting',
    background: 'elegant dark gradient background with subtle reflections',
    cameraAngle: 'low angle hero shot, slight tilt',
    keywords: ['luxury', 'premium', 'elegant', 'gold', 'sophisticated']
  },
  tech: {
    prefix: 'Futuristic tech product photography, sleek modern design,',
    suffix: 'cool blue LED accent lighting, dark dramatic background, cyber aesthetic, high-tech atmosphere, 4K commercial quality',
    lighting: 'dramatic blue LED lighting, rim light, metallic reflections',
    background: 'dark futuristic background with subtle grid pattern',
    cameraAngle: 'isometric view, dynamic angle',
    keywords: ['tech', 'futuristic', 'modern', 'LED', 'cyber']
  },
  natural: {
    prefix: 'Natural lifestyle product photography, organic aesthetic,',
    suffix: 'warm natural daylight, organic background elements, lifestyle photography, soft ambient lighting, authentic feel, high resolution',
    lighting: 'natural window light, soft ambient glow',
    background: 'natural wooden surface with subtle texture',
    cameraAngle: 'slight top-down view, lifestyle angle',
    keywords: ['natural', 'lifestyle', 'organic', 'warm', 'authentic']
  },
  trendy: {
    prefix: 'Vibrant trendy product photography, dynamic composition,',
    suffix: 'colorful gradient lighting, bold background, eye-catching visual, social media style, pop aesthetic, high contrast, 4K quality',
    lighting: 'colorful studio lighting, gradient lights, neon accents',
    background: 'vibrant gradient background with dynamic colors',
    cameraAngle: 'dynamic angle, rule of thirds',
    keywords: ['trendy', 'vibrant', 'colorful', 'social', 'dynamic']
  }
}

// ==================== 平台样式 ====================

export const PLATFORM_STYLES: Record<PlatformType, {
  styleHint: string
  keywords: string[]
  description: string
  toneModifier: string
}> = {
  xiaohongshu: {
    styleHint: 'lifestyle, Instagram-worthy, aesthetic, soft natural lighting, cozy atmosphere',
    keywords: ['lifestyle', 'aesthetic', 'cozy', 'warm', 'authentic'],
    description: '小红书风格 - 生活化、种草感、氛围感强',
    toneModifier: 'Create a warm, inviting atmosphere that feels authentic and relatable'
  },
  taobao: {
    styleHint: 'clean product photography, e-commerce ready, pure white background, professional catalog',
    keywords: ['professional', 'clean', 'catalog', 'white', 'standard'],
    description: '淘宝风格 - 专业、干净、突出商品',
    toneModifier: 'Focus on clear product visibility with professional presentation'
  },
  douyin: {
    styleHint: 'dynamic, trendy, eye-catching, vibrant colors, social media viral',
    keywords: ['trendy', 'viral', 'dynamic', 'bold', 'vibrant'],
    description: '抖音风格 - 潮流、动感、吸引眼球',
    toneModifier: 'Create visually striking imagery that grabs attention instantly'
  },
  amazon: {
    styleHint: 'professional product photography, pure white background, product centered, catalog style',
    keywords: ['standard', 'professional', 'catalog', 'white', 'product'],
    description: '亚马逊风格 - 专业、简洁、标准化',
    toneModifier: 'Follow e-commerce standards with clear, professional product presentation'
  }
}

// ==================== 中文到英文映射 ====================

const PRODUCT_TYPE_MAP: Record<string, string> = {
  // Fashion
  '手提包': 'handbag', '背包': 'backpack', '钱包': 'wallet', '皮带': 'belt',
  '帽子': 'hat', '围巾': 'scarf', '太阳镜': 'sunglasses', '手表': 'watch',
  '运动鞋': 'sneakers', '高跟鞋': 'high heels', '靴子': 'boots', '平底鞋': 'flats',
  '衬衫': 'shirt', 'T恤': 't-shirt', '牛仔裤': 'jeans', '连衣裙': 'dress',
  '西装外套': 'blazer', '大衣': 'coat', '羽绒服': 'down jacket', '风衣': 'trench coat',
  // Beauty
  '口红': 'lipstick', '眼影盘': 'eyeshadow palette', '粉底液': 'liquid foundation',
  '香水': 'perfume', '护肤套装': 'skincare set', '面膜': 'face mask',
  '精华液': 'serum', '眉笔': 'eyebrow pencil', '睫毛膏': 'mascara',
  '化妆刷套装': 'makeup brush set', '美甲套装': 'nail art set', '护发精油': 'hair oil',
  // Electronics
  '手机': 'smartphone', '笔记本电脑': 'laptop', '平板电脑': 'tablet',
  '耳机': 'headphones', '智能手表': 'smartwatch', '音箱': 'speaker',
  '相机': 'camera', '充电宝': 'power bank', '键盘': 'keyboard',
  '鼠标': 'mouse', '显示器': 'monitor', '游戏手柄': 'game controller',
  'VR眼镜': 'VR headset', '无人机': 'drone',
  // Home
  '沙发': 'sofa', '台灯': 'table lamp', '花瓶': 'vase',
  '餐具套装': 'dinnerware set', '床上用品': 'bedding', '收纳盒': 'storage box',
  '地毯': 'rug', '窗帘': 'curtains', '靠枕': 'cushion',
  '香薰蜡烛': 'scented candle', '咖啡杯': 'coffee cup', '茶具': 'tea set',
  '酒杯': 'wine glass', '厨具套装': 'cookware set',
  // Food
  '巧克力礼盒': 'chocolate gift box', '茶叶礼盒': 'tea gift box', '咖啡豆': 'coffee beans',
  '坚果礼盒': 'nut gift box', '蜂蜜': 'honey', '红酒': 'red wine',
  '威士忌': 'whiskey', '蛋糕': 'cake', '饼干礼盒': 'cookie gift box',
  '糖果罐': 'candy jar', '橄榄油': 'olive oil', '调味品套装': 'seasoning set',
  // Sports
  '瑜伽垫': 'yoga mat', '哑铃': 'dumbbell', '跑步机': 'treadmill',
  '篮球': 'basketball', '足球': 'football', '网球拍': 'tennis racket',
  '羽毛球拍': 'badminton racket', '泳镜': 'swimming goggles', '运动水壶': 'sports water bottle',
  '健身手套': 'fitness gloves', '跳绳': 'jump rope', '滑板': 'skateboard',
  // Toys
  '毛绒玩具': 'plush toy', '积木': 'building blocks', '遥控车': 'RC car',
  '益智玩具': 'educational toy', '玩偶': 'doll', '模型手办': 'figure model',
  '乐高套装': 'LEGO set', '拼图': 'puzzle', '儿童自行车': 'kids bicycle', '绘本套装': 'picture book set',
  // Jewelry
  '项链': 'necklace', '戒指': 'ring', '耳环': 'earrings',
  '手链': 'bracelet', '胸针': 'brooch', '发饰': 'hair accessory',
  '头冠': 'tiara', '珍珠项链': 'pearl necklace', '钻石戒指': 'diamond ring', '黄金手镯': 'gold bangle'
}

const MATERIAL_MAP: Record<string, string> = {
  '皮革': 'leather', '帆布': 'canvas', '尼龙': 'nylon', '棉麻': 'cotton-linen',
  '丝绸': 'silk', '羊毛': 'wool', '牛仔布': 'denim', '人造革': 'faux leather',
  '绒面': 'suede', '网面': 'mesh', '金属管': 'metal tube', '玻璃瓶': 'glass bottle',
  '塑料瓶': 'plastic bottle', '陶瓷': 'ceramic', '磨砂玻璃': 'frosted glass',
  '亚克力': 'acrylic', '真空泵瓶': 'vacuum pump bottle', '金属': 'metal',
  '玻璃': 'glass', '塑料': 'plastic', '铝合金': 'aluminum alloy',
  '碳纤维': 'carbon fiber', '陶瓷后盖': 'ceramic back', '皮革后盖': 'leather back',
  '实木': 'solid wood', '布艺': 'fabric', '真皮': 'genuine leather',
  '藤编': 'rattan', '大理石': 'marble', '纸盒': 'paper box',
  '木盒': 'wooden box', '布袋': 'cloth bag', '橡胶': 'rubber',
  '泡沫': 'foam', 'TPU': 'TPU', '硅胶': 'silicone',
  '毛绒': 'plush', '木头': 'wood', 'EVA泡沫': 'EVA foam',
  '黄金': 'gold', '白银': 'silver', '铂金': 'platinum',
  '玫瑰金': 'rose gold', '珍珠': 'pearl', '钻石': 'diamond',
  '翡翠': 'jade', '水晶': 'crystal', '玛瑙': 'agate'
}

const COLOR_MAP: Record<string, string> = {
  '黑色': 'black', '白色': 'white', '棕色': 'brown', '红色': 'red',
  '蓝色': 'blue', '灰色': 'gray', '米色': 'beige', '粉色': 'pink',
  '绿色': 'green', '酒红色': 'burgundy', '卡其色': 'khaki', '藏青色': 'navy',
  '金色': 'gold', '银色': 'silver', '玫瑰金': 'rose gold', '深空灰': 'space gray',
  '彩色': 'multicolor', '黄色': 'yellow', '橙色': 'orange', '紫色': 'purple',
  '珊瑚色': 'coral', '橘色': 'orange', '裸色': 'nude', '木色': 'wooden',
  '墨绿': 'dark green', '深蓝': 'deep blue', '透明': 'transparent'
}

const STYLE_KEYWORDS: Record<StyleType, string[]> = {
  minimal: ['简约', '简单', '干净', '极简', '清新', '白色背景'],
  luxury: ['奢华', '高端', '高级', '豪华', '精致', '优雅', '金色'],
  tech: ['科技', '现代', '未来', '金属', '酷炫', 'LED', '蓝色'],
  natural: ['自然', '生活', '木质', '温馨', '日系', '原木'],
  trendy: ['潮流', '时尚', '活力', '动感', '流行', '年轻']
}

// ==================== 类别检测 ====================

export function detectCategory(description: string): { category: ProductCategory; confidence: number } {
  const desc = description.toLowerCase()
  const scores: Record<ProductCategory, number> = {
    fashion: 0, beauty: 0, electronics: 0, home: 0,
    food: 0, sports: 0, toys: 0, jewelry: 0
  }

  // 检测每个类别的关键词
  for (const [category, products] of Object.entries(PRODUCT_TYPES)) {
    for (const product of products) {
      if (desc.includes(product.toLowerCase())) {
        scores[category as ProductCategory] += 2
      }
    }
  }

  // 额外的类别关键词
  const categoryKeywords: Record<ProductCategory, string[]> = {
    fashion: ['服装', '包包', '鞋子', '时尚', '穿搭', '衣服'],
    beauty: ['美妆', '护肤', '化妆品', '彩妆', '口红', '面膜'],
    electronics: ['数码', '电子', '智能', '科技', '电器'],
    home: ['家居', '家具', '家装', '生活', '居家'],
    food: ['食品', '美食', '零食', '饮料', '吃的'],
    sports: ['运动', '健身', '户外', '体育'],
    toys: ['玩具', '儿童', '孩子', '宝宝', '益智'],
    jewelry: ['珠宝', '首饰', '饰品', '金银']
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        scores[category as ProductCategory] += 1
      }
    }
  }

  // 找出最高分
  let maxCategory: ProductCategory = 'fashion'
  let maxScore = 0

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxCategory = category as ProductCategory
    }
  }

  // 计算置信度
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0 ? maxScore / (totalScore + 1) : 0.3

  return { category: maxCategory, confidence: Math.min(confidence, 0.95) }
}

// ==================== 风格检测 ====================

export function detectStyle(description: string): { style: StyleType; confidence: number } {
  const desc = description.toLowerCase()
  const scores: Record<StyleType, number> = {
    minimal: 0, luxury: 0, tech: 0, natural: 0, trendy: 0
  }

  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        scores[style as StyleType] += 1
      }
    }
  }

  let maxStyle: StyleType = 'minimal'
  let maxScore = 0

  for (const [style, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxStyle = style as StyleType
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0 ? maxScore / (totalScore + 1) : 0.5

  return { style: maxStyle, confidence }
}

// ==================== 平台检测 ====================

export function detectPlatform(description: string): { platform: PlatformType; confidence: number } {
  const desc = description.toLowerCase()

  if (desc.includes('小红书') || desc.includes('种草')) {
    return { platform: 'xiaohongshu', confidence: 0.9 }
  }
  if (desc.includes('淘宝') || desc.includes('天猫')) {
    return { platform: 'taobao', confidence: 0.9 }
  }
  if (desc.includes('抖音') || desc.includes('tiktok')) {
    return { platform: 'douyin', confidence: 0.9 }
  }
  if (desc.includes('亚马逊') || desc.includes('amazon')) {
    return { platform: 'amazon', confidence: 0.9 }
  }

  // 默认返回小红书
  return { platform: 'xiaohongshu', confidence: 0.5 }
}

// ==================== 中文到英文转换 ====================

export function translateToEnglish(description: string): {
  productType: string
  material?: string
  color?: string
  remaining: string
} {
  let remaining = description
  let productType = 'product'
  let material: string | undefined
  let color: string | undefined

  // 检测颜色
  for (const [cn, en] of Object.entries(COLOR_MAP)) {
    if (remaining.includes(cn)) {
      color = en
      remaining = remaining.replace(cn, '')
      break
    }
  }

  // 检测材质
  for (const [cn, en] of Object.entries(MATERIAL_MAP)) {
    if (remaining.includes(cn)) {
      material = en
      remaining = remaining.replace(cn, '')
      break
    }
  }

  // 检测产品类型
  for (const [cn, en] of Object.entries(PRODUCT_TYPE_MAP)) {
    if (remaining.includes(cn)) {
      productType = en
      remaining = remaining.replace(cn, '')
      break
    }
  }

  return { productType, material, color, remaining: remaining.trim() }
}

// ==================== 主优化函数 ====================

export class PromptOptimizer {
  private config: PromptOptimizerConfig
  private trainingSamples: TrainingSample[]

  constructor(config: PromptOptimizerConfig = {}) {
    this.config = {
      defaultStyle: 'minimal',
      defaultPlatform: 'xiaohongshu',
      enableRag: true,
      useTrainingData: true,
      qualityLevel: 'high',
      ...config
    }
    this.trainingSamples = []
  }

  /**
   * 初始化加载训练数据
   */
  async initialize(): Promise<void> {
    if (this.config.useTrainingData) {
      this.trainingSamples = getTrainingSamples(500)
      console.log(`[PromptOptimizer] Loaded ${this.trainingSamples.length} training samples`)
    }
  }

  /**
   * 优化提示词
   */
  async optimize(input: OptimizationInput): Promise<OptimizationResult> {
    const startTime = Date.now()

    // 1. 检测类别、风格、平台
    const detectedCategory = input.category || detectCategory(input.description).category
    const detectedStyle = input.style || detectStyle(input.description).style || this.config.defaultStyle!
    const detectedPlatform = input.platform || detectPlatform(input.description).platform || this.config.defaultPlatform!

    // 2. 翻译中文到英文
    const translated = translateToEnglish(input.description)

    // 3. 获取模板
    const template = PROMPT_TEMPLATES[detectedStyle]
    const platformStyle = PLATFORM_STYLES[detectedPlatform]

    // 4. 构建产品描述
    let productDesc = translated.productType
    if (translated.color) {
      productDesc = `${translated.color} ${productDesc}`
    }
    if (translated.material) {
      productDesc = `${translated.material} ${productDesc}`
    }

    // 5. 搜索匹配的训练样本
    let matchedSamples: TrainingSample[] = []
    if (this.config.useTrainingData && this.trainingSamples.length > 0) {
      matchedSamples = searchSamples(input.description, 3)
    }

    // 6. 从训练样本中学习
    const enhancements: string[] = []
    if (matchedSamples.length > 0) {
      const bestMatch = matchedSamples[0]
      // 添加训练样本中的关键词
      if (bestMatch.metadata.tags) {
        enhancements.push(...bestMatch.metadata.tags.filter(t => !productDesc.includes(t)))
      }
    }

    // 7. 组合完整提示词
    const parts = [
      template.prefix,
      productDesc,
      input.extraKeywords?.join(', ') || '',
      template.suffix,
      platformStyle.styleHint
    ].filter(Boolean)

    const prompt = parts.join(', ')

    // 8. 计算置信度和质量评分
    const confidence = this.calculateConfidence(detectedCategory, detectedStyle, translated)
    const qualityScore = this.calculateQualityScore(prompt, template, platformStyle)

    // 9. 构建结果
    const result: OptimizationResult = {
      prompt,
      style: detectedStyle,
      platform: detectedPlatform,
      category: detectedCategory,
      confidence,
      qualityScore,
      matchedSamples: matchedSamples.length > 0 ? matchedSamples : undefined,
      lighting: template.lighting,
      background: template.background,
      cameraAngle: template.cameraAngle,
      keywords: [...template.keywords, ...platformStyle.keywords],
      details: {
        inputTokens: input.description.length,
        outputTokens: prompt.length,
        templateUsed: detectedStyle,
        enhancements
      }
    }

    console.log(`[PromptOptimizer] Optimization completed in ${Date.now() - startTime}ms`)
    console.log(`[PromptOptimizer] Confidence: ${(confidence * 100).toFixed(1)}%, Quality: ${qualityScore}/10`)

    return result
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    category: ProductCategory,
    style: StyleType,
    translated: { productType: string; material?: string; color?: string; remaining: string }
  ): number {
    let confidence = 0.5

    // 有明确的产品类型
    if (translated.productType !== 'product') {
      confidence += 0.2
    }

    // 有材质信息
    if (translated.material) {
      confidence += 0.1
    }

    // 有颜色信息
    if (translated.color) {
      confidence += 0.1
    }

    // 训练数据匹配
    if (this.trainingSamples.length > 0) {
      const matches = searchSamples(translated.productType, 1)
      if (matches.length > 0) {
        confidence += 0.1
      }
    }

    return Math.min(confidence, 0.95)
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(
    prompt: string,
    template: typeof PROMPT_TEMPLATES[StyleType],
    platformStyle: typeof PLATFORM_STYLES[PlatformType]
  ): number {
    let score = 6 // 基础分

    // 提示词长度合适
    if (prompt.length > 100 && prompt.length < 500) {
      score += 1
    }

    // 包含专业术语
    const professionalTerms = ['professional', 'studio', 'commercial', 'high quality', 'resolution']
    const hasProTerms = professionalTerms.some(term => prompt.toLowerCase().includes(term))
    if (hasProTerms) {
      score += 1
    }

    // 包含灯光描述
    if (prompt.includes('lighting') || prompt.includes('light')) {
      score += 0.5
    }

    // 包含背景描述
    if (prompt.includes('background')) {
      score += 0.5
    }

    // 平台特定优化
    if (platformStyle.keywords.some(k => prompt.toLowerCase().includes(k))) {
      score += 1
    }

    return Math.min(Math.round(score * 10) / 10, 10)
  }

  /**
   * 批量优化
   */
  async optimizeBatch(inputs: OptimizationInput[]): Promise<OptimizationResult[]> {
    return Promise.all(inputs.map(input => this.optimize(input)))
  }

  /**
   * 获取推荐风格
   */
  getRecommendedStyle(category: ProductCategory): StyleType {
    const recommendations: Partial<Record<ProductCategory, StyleType>> = {
      fashion: 'luxury',
      beauty: 'natural',
      electronics: 'tech',
      home: 'minimal',
      food: 'natural',
      sports: 'trendy',
      toys: 'trendy',
      jewelry: 'luxury'
    }
    return recommendations[category] || 'minimal'
  }

  /**
   * 获取推荐平台
   */
  getRecommendedPlatform(category: ProductCategory): PlatformType {
    const recommendations: Partial<Record<ProductCategory, PlatformType>> = {
      fashion: 'xiaohongshu',
      beauty: 'xiaohongshu',
      electronics: 'taobao',
      home: 'taobao',
      food: 'xiaohongshu',
      sports: 'douyin',
      toys: 'taobao',
      jewelry: 'xiaohongshu'
    }
    return recommendations[category] || 'xiaohongshu'
  }
}

// ==================== 单例实例 ====================

let optimizerInstance: PromptOptimizer | null = null

export function getPromptOptimizer(config?: PromptOptimizerConfig): PromptOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new PromptOptimizer(config)
  }
  return optimizerInstance
}

// ==================== 便捷函数 ====================

export async function optimizePrompt(
  description: string,
  options?: {
    style?: StyleType
    platform?: PlatformType
    category?: ProductCategory
    imageUrl?: string
  }
): Promise<OptimizationResult> {
  const optimizer = getPromptOptimizer()
  await optimizer.initialize()
  return optimizer.optimize({
    description,
    ...options
  })
}