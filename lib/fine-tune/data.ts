/**
 * Fine-tuning Training Data Module
 * Task 4.1: 训练数据准备
 *
 * Generates 500+ e-commerce prompt samples with:
 * - Input: Short product description in Chinese
 * - Output: Professional English prompt for 3D generation
 * - Category labels for filtering and analysis
 */

// ==================== 类型定义 ====================

export interface TrainingSample {
  id: string
  input: string           // 用户输入（中文简短描述）
  output: string          // 优化后的英文提示词
  category: ProductCategory
  style: StyleType
  platform: PlatformType
  metadata: {
    productType: string
    material?: string
    color?: string
    lighting?: string
    background?: string
    tags: string[]
  }
}

export type ProductCategory =
  | 'fashion'      // 服装配饰
  | 'beauty'       // 美妆护肤
  | 'electronics'  // 数码电子
  | 'home'         // 家居生活
  | 'food'         // 食品饮料
  | 'sports'       // 运动户外
  | 'toys'         // 玩具母婴
  | 'jewelry'      // 珠宝首饰

export type StyleType = 'minimal' | 'luxury' | 'tech' | 'natural' | 'trendy'

export type PlatformType = 'xiaohongshu' | 'taobao' | 'douyin' | 'amazon'

// ==================== 商品类型映射 ====================

export const PRODUCT_TYPES: Record<ProductCategory, string[]> = {
  fashion: ['手提包', '背包', '钱包', '皮带', '帽子', '围巾', '太阳镜', '手表', '运动鞋', '高跟鞋', '靴子', '平底鞋', '衬衫', 'T恤', '牛仔裤', '连衣裙', '西装外套', '大衣', '羽绒服', '风衣'],
  beauty: ['口红', '眼影盘', '粉底液', '香水', '护肤套装', '面膜', '精华液', '眉笔', '睫毛膏', '化妆刷套装', '美甲套装', '护发精油'],
  electronics: ['手机', '笔记本电脑', '平板电脑', '耳机', '智能手表', '音箱', '相机', '充电宝', '键盘', '鼠标', '显示器', '游戏手柄', 'VR眼镜', '无人机'],
  home: ['沙发', '台灯', '花瓶', '餐具套装', '床上用品', '收纳盒', '地毯', '窗帘', '靠枕', '香薰蜡烛', '咖啡杯', '茶具', '酒杯', '厨具套装'],
  food: ['巧克力礼盒', '茶叶礼盒', '咖啡豆', '坚果礼盒', '蜂蜜', '红酒', '威士忌', '蛋糕', '饼干礼盒', '糖果罐', '橄榄油', '调味品套装'],
  sports: ['瑜伽垫', '哑铃', '跑步机', '篮球', '足球', '网球拍', '羽毛球拍', '泳镜', '运动水壶', '健身手套', '跳绳', '滑板'],
  toys: ['毛绒玩具', '积木', '遥控车', '益智玩具', '玩偶', '模型手办', '乐高套装', '拼图', '儿童自行车', '绘本套装'],
  jewelry: ['项链', '戒指', '耳环', '手链', '胸针', '发饰', '头冠', '珍珠项链', '钻石戒指', '黄金手镯']
}

// ==================== 材质映射 ====================

export const MATERIALS: Record<ProductCategory, string[]> = {
  fashion: ['皮革', '帆布', '尼龙', '棉麻', '丝绸', '羊毛', '牛仔布', '人造革', '绒面', '网面'],
  beauty: ['金属管', '玻璃瓶', '塑料瓶', '陶瓷', '磨砂玻璃', '亚克力', '真空泵瓶'],
  electronics: ['金属', '塑料', '玻璃', '铝合金', '碳纤维', '陶瓷后盖', '皮革后盖'],
  home: ['实木', '布艺', '真皮', '玻璃', '陶瓷', '金属', '藤编', '棉麻', '大理石'],
  food: ['玻璃瓶', '金属罐', '纸盒', '塑料瓶', '陶瓷罐', '木盒', '布袋'],
  sports: ['橡胶', '泡沫', '金属', '塑料', '尼龙', 'TPU', '硅胶'],
  toys: ['塑料', '毛绒', '木头', '金属', '硅胶', '布艺', 'EVA泡沫'],
  jewelry: ['黄金', '白银', '铂金', '玫瑰金', '珍珠', '钻石', '翡翠', '水晶', '玛瑙']
}

// ==================== 颜色映射 ====================

export const COLORS: Record<ProductCategory, string[]> = {
  fashion: ['黑色', '白色', '棕色', '红色', '蓝色', '灰色', '米色', '粉色', '绿色', '酒红色', '卡其色', '藏青色'],
  beauty: ['红色', '粉色', '裸色', '珊瑚色', '橘色', '紫色', '棕色', '黑色', '白色', '金色', '银色'],
  electronics: ['黑色', '白色', '银色', '金色', '深空灰', '玫瑰金', '蓝色', '绿色', '红色'],
  home: ['白色', '木色', '灰色', '米色', '深蓝', '墨绿', '棕色', '黑色', '金色', '银色'],
  food: ['金色', '红色', '绿色', '棕色', '白色', '黑色', '蓝色', '透明'],
  sports: ['黑色', '白色', '红色', '蓝色', '绿色', '粉色', '黄色', '橙色', '灰色'],
  toys: ['彩色', '粉色', '蓝色', '黄色', '绿色', '红色', '白色', '紫色'],
  jewelry: ['金色', '银色', '玫瑰金', '白色', '黑色', '红色', '蓝色', '绿色', '紫色']
}

// ==================== 提示词模板 ====================

const STYLE_TEMPLATES: Record<StyleType, { prefix: string; suffix: string; lighting: string; background: string }> = {
  minimal: {
    prefix: 'Professional product photography, clean minimalist style,',
    suffix: 'soft diffused lighting, pure white background, high key lighting, commercial photography, 4K resolution, studio quality',
    lighting: 'soft diffused overhead lighting, soft shadows',
    background: 'clean white seamless background'
  },
  luxury: {
    prefix: 'Elegant luxury product photography, premium showcase,',
    suffix: 'sophisticated lighting with warm golden highlights, gradient background, high-end commercial photography, 8K resolution, exquisite detail',
    lighting: 'dramatic studio lighting, warm accent lights, rim lighting',
    background: 'elegant dark gradient background with subtle reflections'
  },
  tech: {
    prefix: 'Futuristic tech product photography, sleek modern design,',
    suffix: 'cool blue LED accent lighting, dark dramatic background, cyber aesthetic, high-tech atmosphere, 4K commercial quality',
    lighting: 'dramatic blue LED lighting, rim light, metallic reflections',
    background: 'dark futuristic background with subtle grid pattern'
  },
  natural: {
    prefix: 'Natural lifestyle product photography, organic aesthetic,',
    suffix: 'warm natural daylight, organic background elements, lifestyle photography, soft ambient lighting, authentic feel, high resolution',
    lighting: 'natural window light, soft ambient glow',
    background: 'natural wooden surface with subtle texture'
  },
  trendy: {
    prefix: 'Vibrant trendy product photography, dynamic composition,',
    suffix: 'colorful gradient lighting, bold background, eye-catching visual, social media style, pop aesthetic, high contrast, 4K quality',
    lighting: 'colorful studio lighting, gradient lights, neon accents',
    background: 'vibrant gradient background with dynamic colors'
  }
}

const PLATFORM_MODIFIERS: Record<PlatformType, string> = {
  xiaohongshu: 'lifestyle-oriented, authentic feel, warm tones, social media friendly composition',
  taobao: 'professional product showcase, clear product visibility, clean composition, e-commerce standard',
  douyin: 'dynamic angle, trendy visual, bold contrast, attention-grabbing composition',
  amazon: 'standard product photography, clean white background, professional lighting, catalog style'
}

// ==================== 提示词生成函数 ====================

interface PromptGenerationParams {
  productType: string
  material?: string
  color?: string
  style: StyleType
  platform: PlatformType
  additionalDetails?: string
}

function generateEnglishPrompt(params: PromptGenerationParams): string {
  const { productType, material, color, style, platform, additionalDetails } = params
  const template = STYLE_TEMPLATES[style]
  const platformModifier = PLATFORM_MODIFIERS[platform]

  // 构建产品描述
  let productDesc = productType
  if (color) {
    const colorMap: Record<string, string> = {
      '黑色': 'black', '白色': 'white', '棕色': 'brown', '红色': 'red',
      '蓝色': 'blue', '灰色': 'gray', '米色': 'beige', '粉色': 'pink',
      '绿色': 'green', '酒红色': 'burgundy', '卡其色': 'khaki', '藏青色': 'navy',
      '金色': 'gold', '银色': 'silver', '玫瑰金': 'rose gold', '深空灰': 'space gray',
      '彩色': 'multicolor', '黄色': 'yellow', '橙色': 'orange', '紫色': 'purple',
      '珊瑚色': 'coral', '橘色': 'orange', '裸色': 'nude', '木色': 'wooden'
    }
    productDesc = `${colorMap[color] || color} ${productDesc}`
  }
  if (material) {
    const materialMap: Record<string, string> = {
      '皮革': 'leather', '帆布': 'canvas', '尼龙': 'nylon', '棉麻': 'cotton-linen',
      '丝绸': 'silk', '羊毛': 'wool', '牛仔布': 'denim', '金属': 'metal',
      '玻璃': 'glass', '陶瓷': 'ceramic', '实木': 'solid wood', '塑料': 'plastic',
      '橡胶': 'rubber', '毛绒': 'plush', '黄金': 'gold', '白银': 'silver',
      '铂金': 'platinum', '珍珠': 'pearl', '钻石': 'diamond', '铝合金': 'aluminum alloy'
    }
    productDesc = `${materialMap[material] || material} ${productDesc}`
  }

  // 组合完整提示词
  const parts = [
    template.prefix,
    productDesc,
    additionalDetails || '',
    template.suffix,
    platformModifier
  ].filter(Boolean)

  return parts.join(', ')
}

// ==================== 训练样本生成 ====================

function generateSampleId(index: number): string {
  return `sample_${String(index).padStart(4, '0')}`
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateInputText(productType: string, material?: string, color?: string, style?: string): string {
  const parts: string[] = []

  // 基础描述
  if (color) parts.push(color)
  if (material) parts.push(material)
  parts.push(productType)

  // 添加风格提示
  const styleHints: string[] = []
  if (style === 'luxury') styleHints.push('奢华感', '高端')
  if (style === 'tech') styleHints.push('科技感', '现代')
  if (style === 'minimal') styleHints.push('简约', '干净')
  if (style === 'natural') styleHints.push('自然', '生活化')
  if (style === 'trendy') styleHints.push('潮流', '时尚')

  if (styleHints.length > 0 && Math.random() > 0.5) {
    parts.push(randomChoice(styleHints))
  }

  return parts.join('，')
}

export function generateTrainingSamples(count: number = 500): TrainingSample[] {
  const samples: TrainingSample[] = []
  const categories = Object.keys(PRODUCT_TYPES) as ProductCategory[]
  const styles: StyleType[] = ['minimal', 'luxury', 'tech', 'natural', 'trendy']
  const platforms: PlatformType[] = ['xiaohongshu', 'taobao', 'douyin', 'amazon']

  let sampleIndex = 0

  // 每个类别分配样本数量
  const samplesPerCategory = Math.floor(count / categories.length)

  for (const category of categories) {
    const productTypes = PRODUCT_TYPES[category]
    const materials = MATERIALS[category]
    const colors = COLORS[category]

    for (let i = 0; i < samplesPerCategory && sampleIndex < count; i++) {
      const productType = randomChoice(productTypes)
      const material = Math.random() > 0.3 ? randomChoice(materials) : undefined
      const color = Math.random() > 0.2 ? randomChoice(colors) : undefined
      const style = randomChoice(styles)
      const platform = randomChoice(platforms)

      const input = generateInputText(productType, material, color, style)
      const output = generateEnglishPrompt({
        productType,
        material,
        color,
        style,
        platform
      })

      samples.push({
        id: generateSampleId(sampleIndex),
        input,
        output,
        category,
        style,
        platform,
        metadata: {
          productType,
          material,
          color,
          lighting: STYLE_TEMPLATES[style].lighting,
          background: STYLE_TEMPLATES[style].background,
          tags: [category, style, platform, productType].filter(Boolean) as string[]
        }
      })

      sampleIndex++
    }
  }

  // 补充剩余样本（随机分布）
  while (sampleIndex < count) {
    const category = randomChoice(categories)
    const productType = randomChoice(PRODUCT_TYPES[category])
    const material = Math.random() > 0.3 ? randomChoice(MATERIALS[category]) : undefined
    const color = Math.random() > 0.2 ? randomChoice(COLORS[category]) : undefined
    const style = randomChoice(styles)
    const platform = randomChoice(platforms)

    const input = generateInputText(productType, material, color, style)
    const output = generateEnglishPrompt({
      productType,
      material,
      color,
      style,
      platform
    })

    samples.push({
      id: generateSampleId(sampleIndex),
      input,
      output,
      category,
      style,
      platform,
      metadata: {
        productType,
        material,
        color,
        lighting: STYLE_TEMPLATES[style].lighting,
        background: STYLE_TEMPLATES[style].background,
        tags: [category, style, platform, productType].filter(Boolean) as string[]
      }
    })

    sampleIndex++
  }

  return samples
}

// ==================== 数据导出函数 ====================

export function exportForFineTuning(samples: TrainingSample[]): {
  inputs: string[]
  outputs: string[]
  labels: { category: string; style: string; platform: string }[]
} {
  return {
    inputs: samples.map(s => s.input),
    outputs: samples.map(s => s.output),
    labels: samples.map(s => ({
      category: s.category,
      style: s.style,
      platform: s.platform
    }))
  }
}

export function exportToJsonl(samples: TrainingSample[]): string {
  return samples.map(s => JSON.stringify({
    input: s.input,
    output: s.output,
    metadata: s.metadata
  })).join('\n')
}

// ==================== 统计函数 ====================

export function getDatasetStats(samples: TrainingSample[]): {
  total: number
  byCategory: Record<ProductCategory, number>
  byStyle: Record<StyleType, number>
  byPlatform: Record<PlatformType, number>
} {
  const byCategory = {} as Record<ProductCategory, number>
  const byStyle = {} as Record<StyleType, number>
  const byPlatform = {} as Record<PlatformType, number>

  for (const sample of samples) {
    byCategory[sample.category] = (byCategory[sample.category] || 0) + 1
    byStyle[sample.style] = (byStyle[sample.style] || 0) + 1
    byPlatform[sample.platform] = (byPlatform[sample.platform] || 0) + 1
  }

  return {
    total: samples.length,
    byCategory,
    byStyle,
    byPlatform
  }
}

// ==================== 预生成的训练数据集 ====================

let cachedSamples: TrainingSample[] | null = null

export function getTrainingSamples(count: number = 500): TrainingSample[] {
  if (!cachedSamples) {
    cachedSamples = generateTrainingSamples(600) // 稍微多生成一些以供筛选
  }
  return cachedSamples.slice(0, count)
}

// 按类别获取样本
export function getSamplesByCategory(category: ProductCategory, count?: number): TrainingSample[] {
  const samples = getTrainingSamples()
  const filtered = samples.filter(s => s.category === category)
  return count ? filtered.slice(0, count) : filtered
}

// 按风格获取样本
export function getSamplesByStyle(style: StyleType, count?: number): TrainingSample[] {
  const samples = getTrainingSamples()
  const filtered = samples.filter(s => s.style === style)
  return count ? filtered.slice(0, count) : filtered
}

// 搜索样本
export function searchSamples(query: string, limit: number = 10): TrainingSample[] {
  const samples = getTrainingSamples()
  const lowerQuery = query.toLowerCase()

  return samples
    .filter(s =>
      s.input.toLowerCase().includes(lowerQuery) ||
      s.output.toLowerCase().includes(lowerQuery) ||
      s.metadata.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
    .slice(0, limit)
}