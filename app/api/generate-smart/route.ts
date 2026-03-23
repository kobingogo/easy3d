import { NextRequest, NextResponse } from 'next/server'
import { createTask, pollTaskStatus, downloadModel, type TripoTaskType, type TripoConfig } from '@/lib/tripo'
import { vision, generate } from '@/lib/agent/llm'

/**
 * 智能 3D 模型生成 API
 *
 * 流程：
 * 1. 产品分析 - 识别类别、风格、材质等
 * 2. 提示词优化 - 生成优化的英文提示词
 * 3. 调用 Tripo API - 使用优化后的 prompt
 */

// ==================== 产品分析 ====================

const ANALYZE_PROMPT = `你是一个电商产品分析专家。请分析这张商品图片，返回以下信息：

1. 商品类别：从 [clothing, shoes, beauty, electronics, home, jewelry, food, bags, accessories, other] 中选择
2. 子类别：具体的商品类型（如：口红、运动鞋、手机壳、女包、钱包）
3. 风格标签：如 [简约, 潮流, 商务, 可爱, 复古, 奢华] 等，返回 2-4 个
4. 主色调：识别 2-3 个主要颜色
5. 材质：如 [皮革, 金属, 塑料, 棉麻, 玻璃] 等
6. 关键特征：描述商品的结构特点（如：有鞋带、有拉链、有手柄等）
7. 3D 生成要点：描述生成高质量 3D 模型需要注意的结构细节

请严格以 JSON 格式返回结果，不要包含其他内容。格式示例：
{
  "category": "shoes",
  "subcategory": "运动鞋",
  "style": ["潮流", "运动"],
  "colors": ["白色", "蓝色"],
  "materials": ["网布", "橡胶"],
  "keyFeatures": ["鞋带系统", "厚底设计", "网面透气"],
  "generationFocus": ["保持鞋头形状不塌陷", "鞋带要有层次感", "鞋底纹理清晰"],
  "confidence": 0.92
}`

interface ProductAnalysis {
  category: string
  subcategory: string
  style: string[]
  colors: string[]
  materials: string[]
  keyFeatures: string[]
  generationFocus: string[]
  confidence: number
}

async function analyzeProduct(imageUrl: string): Promise<ProductAnalysis> {
  console.log('[generate-smart] Analyzing product...')

  const result = await vision({
    model: 'qwen3.5-plus',
    imageUrls: [imageUrl],
    prompt: ANALYZE_PROMPT
  })

  // 解析 JSON
  const jsonMatch = result.content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      category: parsed.category || 'other',
      subcategory: parsed.subcategory || '商品',
      style: parsed.style || [],
      colors: parsed.colors || [],
      materials: parsed.materials || [],
      keyFeatures: parsed.keyFeatures || [],
      generationFocus: parsed.generationFocus || [],
      confidence: parsed.confidence || 0.8
    }
  }

  // 默认返回
  return {
    category: 'other',
    subcategory: '商品',
    style: ['简约'],
    colors: [],
    materials: [],
    keyFeatures: [],
    generationFocus: [],
    confidence: 0.5
  }
}

// ==================== 提示词优化 ====================

const OPTIMIZE_PROMPT_TEMPLATE = `你是一个专业的 3D 产品渲染提示词专家。请根据产品分析结果生成最佳的 3D 生成提示词。

【产品信息】
- 类别：{category}
- 子类别：{subcategory}
- 风格：{style}
- 颜色：{colors}
- 材质：{materials}
- 关键特征：{keyFeatures}
- 生成要点：{generationFocus}

【要求】
1. 提示词必须准确描述商品类型和结构特征
2. 必须包含商品的英文名称
3. 必须强调生成要点中提到的结构细节
4. 风格要简洁专业，避免冗长

【输出格式】
返回 JSON：
{
  "prompt": "英文提示词，用于 Tripo AI 3D 生成",
  "productType": "商品的英文类型名称",
  "structuralHints": ["结构提示词数组，如 'structured toe box', 'organized lace system'"],
  "materialHints": ["材质提示词数组"],
  "confidence": 0.9
}

【重要提示】
- 对于鞋子：必须包含 'structured toe box'（不塌陷的鞋头）, 'well-defined sole'（清晰的鞋底）
- 对于包包：必须包含 'structured shape'（有型的轮廓）, 'clear hardware details'（清晰的五金细节）
- 对于电子产品：必须包含 'precise edges'（精确的边缘）, 'clean surface'（干净的表面）

只返回 JSON，不要其他内容。`

interface OptimizedPrompt {
  prompt: string
  productType: string
  structuralHints: string[]
  materialHints: string[]
  confidence: number
}

async function optimizePrompt(analysis: ProductAnalysis): Promise<OptimizedPrompt> {
  console.log('[generate-smart] Optimizing prompt...')

  const prompt = OPTIMIZE_PROMPT_TEMPLATE
    .replace('{category}', analysis.category)
    .replace('{subcategory}', analysis.subcategory)
    .replace('{style}', analysis.style.join(', '))
    .replace('{colors}', analysis.colors.join(', '))
    .replace('{materials}', analysis.materials.join(', '))
    .replace('{keyFeatures}', analysis.keyFeatures.join(', '))
    .replace('{generationFocus}', analysis.generationFocus.join(', '))

  const result = await generate({
    model: 'qwen3.5-plus',
    messages: [{ role: 'user', content: prompt }],
    responseFormat: { type: 'json_object' }
  })

  // 解析 JSON
  const jsonMatch = result.content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      prompt: parsed.prompt || '',
      productType: parsed.productType || 'product',
      structuralHints: parsed.structuralHints || [],
      materialHints: parsed.materialHints || [],
      confidence: parsed.confidence || 0.8
    }
  }

  // 降级：基于分析结果生成基础提示词
  return {
    prompt: `Professional 3D model of ${analysis.subcategory}, high quality, detailed structure, photorealistic`,
    productType: analysis.subcategory,
    structuralHints: [],
    materialHints: [],
    confidence: 0.6
  }
}

// ==================== 主 API ====================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { imageUrl, images, config: customConfig } = body

    // 验证输入
    const isMultiview = images && images.length > 0
    const taskType: TripoTaskType = isMultiview ? 'multiview_to_model' : 'image_to_model'
    const mainImageUrl = imageUrl || (images && images[0]?.url)

    if (!mainImageUrl) {
      return NextResponse.json({ error: '需要提供 imageUrl 或 images 参数' }, { status: 400 })
    }

    console.log(`[generate-smart] Task type: ${taskType}`)
    console.log(`[generate-smart] Main image URL:`, mainImageUrl.slice(0, 100))

    // ==================== Step 1: 产品分析 ====================
    const analysisStartTime = Date.now()
    let analysis: ProductAnalysis
    try {
      analysis = await analyzeProduct(mainImageUrl)
      console.log(`[generate-smart] Analysis completed in ${Date.now() - analysisStartTime}ms`)
    } catch (analyzeError: any) {
      console.error('[generate-smart] Analysis failed:', analyzeError.message)
      analysis = {
        category: 'other',
        subcategory: '商品',
        style: ['简约'],
        colors: [],
        materials: [],
        keyFeatures: [],
        generationFocus: [],
        confidence: 0.5
      }
    }
    console.log(`[generate-smart] Analysis:`, JSON.stringify(analysis))

    // ==================== Step 2: 提示词优化 ====================
    const optimizeStartTime = Date.now()
    let optimized: OptimizedPrompt
    try {
      optimized = await optimizePrompt(analysis)
      console.log(`[generate-smart] Optimization completed in ${Date.now() - optimizeStartTime}ms`)
    } catch (optimizeError: any) {
      console.error('[generate-smart] Optimization failed:', optimizeError.message)
      optimized = {
        prompt: `Professional 3D model of ${analysis.subcategory}, high quality, detailed structure, photorealistic`,
        productType: analysis.subcategory,
        structuralHints: [],
        materialHints: [],
        confidence: 0.6
      }
    }
    console.log(`[generate-smart] Optimized prompt:`, optimized.prompt.slice(0, 200))

    // ==================== Step 3: 调用 Tripo API ====================

    // 构建 P1 优化配置
    const tripoConfig: Partial<TripoConfig> = {
      ...customConfig,
      // P1 专用参数：高面数获得更多细节
      faceLimit: 18000,
      // 启用图片自动修复
      enableImageAutofix: true,
      // 保持原图纹理
      textureAlignment: 'original_image',
      // 高分辨率纹理
      textureQuality: 'detailed',
    }

    console.log('[generate-smart] Tripo config:', JSON.stringify(tripoConfig))

    // 调用 Tripo API
    const taskResponse = await createTask(
      isMultiview
        ? {
            type: 'multiview_to_model',
            images: images!.map((img: { url: string; file_token?: string; type?: string }) => ({
              url: img.url,
              file_token: img.file_token,
              type: img.type || 'jpg',
            })),
            prompt: optimized.prompt,
            config: tripoConfig,
          }
        : {
            type: 'image_to_model',
            imageUrl: mainImageUrl,
            prompt: optimized.prompt,
            config: tripoConfig,
          }
    )

    if (taskResponse.code !== 0) {
      return NextResponse.json(
        { error: taskResponse.msg || 'Tripo API error' },
        { status: 500 }
      )
    }

    const taskId = taskResponse.data.task_id
    console.log(`[generate-smart] Task created: ${taskId}`)

    // 异步轮询状态（不等待）
    pollTaskStatus(taskId, {
      onProgress: async (progress) => {
        console.log(`[generate-smart] Task ${taskId} progress: ${progress}%`)
      }
    }).then(async (result) => {
      console.log(`[generate-smart] Task ${taskId} completed with status: ${result.data.status}`)
    }).catch((error) => {
      console.error(`[generate-smart] Poll error for ${taskId}:`, error.message)
    })

    // 返回结果
    return NextResponse.json({
      success: true,
      taskId,
      taskType,
      // 返回分析和优化结果，方便调试
      analysis: {
        category: analysis.category,
        subcategory: analysis.subcategory,
        keyFeatures: analysis.keyFeatures,
        generationFocus: analysis.generationFocus,
      },
      optimizedPrompt: optimized.prompt,
      structuralHints: optimized.structuralHints,
      estimatedTime: taskType === 'multiview_to_model' ? 70 : 50,
      duration: Date.now() - startTime,
    })
  } catch (error: any) {
    console.error('[generate-smart] Error:', error)
    console.error('[generate-smart] Stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    )
  }
}