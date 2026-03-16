# Easy3D v2.0 API 文档

> **版本**: v2.0
> **最后更新**: 2026-03-16
> **Base URL**: `http://localhost:3000/api`

---

## 概述

Easy3D API 提供 5 大类共 10 个端点，覆盖 3D 生成全流程。

| 模块 | 端点数 | 核心功能 |
|------|--------|----------|
| RAG | 1 | 知识库检索与问答 |
| Agent | 1 | 工作流规划与执行 |
| Generate | 3 | 3D 模型生成 |
| Fine-tune | 3 | Prompt 优化与评估 |
| Models | 2 | 模型管理与代理 |

---

## 1. RAG 模块

### 1.1 知识库 API

**端点**: `POST /api/knowledge`

统一的知识库检索与问答接口。

#### 请求参数

```typescript
interface KnowledgeRequest {
  action: 'search' | 'ask' | 'suggest'
  query: string
  options?: {
    limit?: number        // 返回数量，默认 5
    threshold?: number    // 相似度阈值，默认 0.7
    category?: string     // 分类过滤
  }
}
```

#### Action 类型

| Action | 描述 | 返回格式 |
|--------|------|----------|
| `search` | 向量检索 | 相关知识条目列表 |
| `ask` | RAG 问答 | 生成的答案 + 引用来源 |
| `suggest` | 展示建议 | 3D 展示风格建议 |

#### 响应格式

```typescript
// search 响应
interface SearchResponse {
  success: boolean
  results: Array<{
    id: string
    text: string
    score: number      // 相似度分数
    category: string
    tags: string[]
  }>
}

// ask 响应
interface AskResponse {
  success: boolean
  answer: string
  sources: Array<{
    id: string
    text: string
    score: number
  }>
}

// suggest 响应
interface SuggestResponse {
  success: boolean
  suggestions: {
    style: string
    lighting: string
    background: string
    camera: string
    reasoning: string
  }
}
```

#### 示例

```bash
# 向量检索
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search",
    "query": "化妆品拍摄灯光技巧",
    "options": { "limit": 3 }
  }'

# RAG 问答
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ask",
    "query": "如何让电子产品的3D展示更有科技感？"
  }'
```

---

## 2. Agent 模块

### 2.1 Agent 工作流 API

**端点**: `POST /api/agent`

Agent 任务规划与执行的统一入口。

#### 请求参数

```typescript
interface AgentRequest {
  action: 'plan' | 'run'
  input: string           // 用户自然语言输入
  workflowId?: string     // run 时可选，指定工作流 ID
}
```

#### Action 类型

| Action | 描述 | 流程 |
|--------|------|------|
| `plan` | 生成执行计划 | 用户输入 → ReAct 规划 → 返回工作流 |
| `run` | 执行完整流程 | 规划 → 执行 → 追踪 → 返回结果 |

#### 响应格式

```typescript
// plan 响应
interface PlanResponse {
  success: boolean
  workflow: {
    id: string
    name: string
    steps: Array<{
      id: string
      tool: string        // 工具名称
      description: string
      input: StepInput
    }>
  }
}

// run 响应
interface RunResponse {
  success: boolean
  result: {
    modelUrl?: string
    thumbnailUrl?: string
    qualityScore?: number
  }
  trace: ExecutionTrace
}
```

#### 工作流示例

```
用户输入: "帮我生成一个适合小红书的女包 3D 展示"

生成的 Workflow:
┌─────────────────────────────────────────────────────────────┐
│ Step 1: analyze_product                                     │
│   Input: { description: "女包，适合小红书" }                │
│   Output: { category: "bags", style: "luxury" }            │
├─────────────────────────────────────────────────────────────┤
│ Step 2: optimize_prompt                                     │
│   Input: { analysis: <Step1 Output> }                      │
│   Output: { prompt: "Professional product photography..." } │
├─────────────────────────────────────────────────────────────┤
│ Step 3: generate_3d                                         │
│   Input: { prompt: <Step2 Output.prompt> }                 │
│   Output: { taskId: "xxx", modelUrl: "https://..." }       │
├─────────────────────────────────────────────────────────────┤
│ Step 4: quality_check                                       │
│   Input: { modelUrl: <Step3 Output.modelUrl> }             │
│   Output: { passed: true, score: 85 }                      │
└─────────────────────────────────────────────────────────────┘
```

#### 示例

```bash
# 仅规划
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "plan",
    "input": "生成一个电子产品展示"
  }'

# 完整执行
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run",
    "input": "帮我生成一个适合小红书的女包 3D 展示"
  }'
```

---

## 3. Generate 模块

### 3.1 3D 生成 API

**端点**: `POST /api/generate`

直接调用 Tripo API 生成 3D 模型。

#### 请求参数

```typescript
interface GenerateRequest {
  mode: 'image_to_model' | 'text_to_model'
  imageUrl?: string       // image_to_model 模式必需
  prompt?: string         // text_to_model 模式推荐
  style?: 'minimal' | 'luxury' | 'tech' | 'natural' | 'trendy'
}
```

#### 响应格式

```typescript
interface GenerateResponse {
  success: boolean
  taskId: string          // 用于轮询状态
  status: 'pending' | 'processing' | 'completed' | 'failed'
  modelUrl?: string       // 完成后返回
  thumbnailUrl?: string
  error?: string
}
```

#### 示例

```bash
# 图生模型
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "image_to_model",
    "imageUrl": "https://example.com/product.jpg"
  }'

# 文生模型
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text_to_model",
    "prompt": "A modern minimalist coffee maker",
    "style": "minimal"
  }'
```

### 3.2 Tripo 状态轮询 API

**端点**: `GET /api/tripo/status/[taskId]`

轮询 Tripo 任务状态。

#### 响应格式

```typescript
interface TripoStatusResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number        // 0-100
  modelUrl?: string       // GLB 模型 URL
  thumbnailUrl?: string   // 预览图 URL
  error?: string
}
```

#### 轮询建议

- 每 2 秒轮询一次
- 状态变为 `completed` 后可获取 `modelUrl`
- 超时建议：60 秒

#### 示例

```bash
curl http://localhost:3000/api/tripo/status/task_abc123
```

### 3.3 模型代理 API

**端点**: `GET /api/proxy/model?url=xxx`

代理 Tripo CDN 模型文件，解决 CORS 问题。

#### 请求参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | string | Tripo CDN 模型 URL（必需） |

#### 响应

- Content-Type: `model/gltf-binary`
- Cache-Control: `public, max-age=3600`
- CORS: `Access-Control-Allow-Origin: *`

#### 示例

```bash
curl "http://localhost:3000/api/proxy/model?url=https://tripo-data.s3.amazonaws.com/models/xxx.glb" \
  --output model.glb
```

---

## 4. Fine-tune 模块

### 4.1 Prompt 优化 API

**端点**: `POST /api/optimize`

优化商品展示提示词。

#### 请求参数

```typescript
interface OptimizeRequest {
  userDescription?: string     // 商品描述（二选一）
  analysis?: ProductAnalysis   // 商品分析结果（二选一）
  style?: 'minimal' | 'luxury' | 'tech' | 'natural' | 'trendy'
  platform?: 'xiaohongshu' | 'taobao' | 'douyin' | 'amazon'
}
```

#### 响应格式

```typescript
interface OptimizeResponse {
  success: boolean
  data: {
    prompt: string           // 优化后的提示词
    style: string
    lighting: string
    background: string
    camera: string
    reasoning: string
  }
  metadata: {
    template: string
    platform: string
    tokensUsed: number
  }
}
```

#### 风格模板

| 风格 | 适用场景 | 特点 |
|------|---------|------|
| `minimal` | 简约商品 | 干净背景、柔和光照 |
| `luxury` | 奢侈品 | 优雅、精致、戏剧光效 |
| `tech` | 电子产品 | 未来感、金属质感 |
| `natural` | 自然产品 | 自然光、环境融合 |
| `trendy` | 潮流商品 | 动感、时尚 |

#### 示例

```bash
curl -X POST http://localhost:3000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "userDescription": "女包，棕色，皮质",
    "style": "luxury",
    "platform": "xiaohongshu"
  }'
```

### 4.2 单次评估 API

**端点**: `POST /api/evaluate`

评估提示词质量。

#### 请求参数

```typescript
interface EvaluateRequest {
  prompt: string
  originalPrompt?: string     // compare 模式必需
  context?: {
    originalInput?: string
    category?: string
    style?: string
    platform?: string
  }
  mode?: 'single' | 'compare' | 'quick'
}
```

#### 评估模式

| 模式 | 描述 | LLM 调用 |
|------|------|----------|
| `single` | 全维度评分 | ✅ 是 |
| `compare` | 对比原始与优化 | ✅ 是 |
| `quick` | 启发式评估 | ❌ 否 |

#### 评估指标

| 指标 | 权重 | 描述 |
|------|------|------|
| `overallScore` | 1.0 | 整体质量 |
| `professionalismScore` | 0.25 | 专业度 |
| `detailScore` | 0.20 | 细节描述 |
| `creativityScore` | 0.15 | 创意性 |
| `ecommerceScore` | 0.20 | 电商适配度 |
| `generationScore` | 0.20 | 3D 生成友好度 |

#### 响应格式

```typescript
interface EvaluateResponse {
  success: boolean
  data: {
    metrics?: EvaluationMetrics
    comparison?: ComparisonResult
  }
}

interface EvaluationMetrics {
  overallScore: number       // 0-100
  professionalismScore: number
  detailScore: number
  creativityScore: number
  ecommerceScore: number
  generationScore: number
  suggestions: string[]      // 改进建议
}

interface ComparisonResult {
  improvement: number        // 提升百分比
  originalScore: number
  optimizedScore: number
  improvements: string[]
  regressions: string[]
}
```

#### 示例

```bash
# 单次评估
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional product photography of a brown leather handbag...",
    "mode": "single"
  }'

# 对比评估
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional product photography of an elegant handbag...",
    "originalPrompt": "一个女包",
    "mode": "compare"
  }'
```

### 4.3 批量评估 API

**端点**: `POST /api/batch-evaluate`

批量评估多个样本，生成统计报告。

#### 请求参数

```typescript
interface BatchEvaluateRequest {
  samples?: TrainingSample[]    // 自定义样本
  sampleCount?: number          // 随机样本数量，默认 20
  config?: {
    batchSize?: number
    improvementThreshold?: number  // 默认 40%
  }
}
```

#### 响应格式

```typescript
interface BatchEvaluateResponse {
  success: boolean
  data: {
    totalSamples: number
    averageImprovement: number    // 平均提升百分比
    successRate: number           // 成功率
    improvementDistribution: {
      negative: number            // 回退数量
      low: number                 // 0-20%
      medium: number              // 20-40%
      high: number                // 40%+
    }
    samples: Array<{
      id: string
      input: string
      originalPrompt: string
      optimizedPrompt: string
      improvement: number
    }>
    summary: {
      bestCase: { input: string, improvement: number }
      worstCase: { input: string, improvement: number }
      averageMetrics: EvaluationMetrics
    }
  }
}
```

#### 示例

```bash
curl -X POST http://localhost:3000/api/batch-evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "sampleCount": 20
  }'
```

---

## 5. Models 模块

### 5.1 模型列表 API

**端点**: `GET /api/models`

获取已生成的模型列表或单个模型详情。

#### 请求参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `id` | string | 可选，获取单个模型 |
| `limit` | number | 可选，默认 50 |

#### 响应格式

```typescript
// 列表响应
interface ModelsListResponse {
  success: boolean
  models: Array<Model>
}

// 单个模型响应
interface ModelResponse {
  success: boolean
  model: Model
}

interface Model {
  id: string
  created_at: string
  original_image_url: string
  model_3d_url: string
  thumbnail_url: string
  prompt?: string
  style?: string
  platform?: string
  quality_score?: number
  status: 'pending' | 'completed' | 'failed'
}
```

#### 示例

```bash
# 获取列表
curl http://localhost:3000/api/models

# 获取单个模型
curl "http://localhost:3000/api/models?id=abc123"
```

### 5.2 模型删除 API

**端点**: `DELETE /api/models?id=xxx`

删除模型及其关联的存储文件。

#### 请求参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `id` | string | 必需，模型 ID |

#### 删除流程

1. 从数据库查询模型信息
2. 删除 Supabase Storage 中的模型文件
3. 删除 Supabase Storage 中的缩略图
4. 删除数据库记录

#### 响应格式

```typescript
interface DeleteResponse {
  success: boolean
  message: string
  deletedFiles: string[]    // 被删除的文件路径
}
```

#### 示例

```bash
curl -X DELETE "http://localhost:3000/api/models?id=abc123"
```

---

## 6. Upload 模块

### 6.1 文件上传 API

**端点**: `POST /api/upload`

上传商品图片到 Supabase Storage。

#### 请求格式

- Content-Type: `multipart/form-data`
- 字段名: `file`

#### 文件限制

| 限制 | 值 |
|------|------|
| 允许类型 | JPG, PNG, WebP |
| 最大大小 | 10 MB |

#### 响应格式

```typescript
interface UploadResponse {
  success: boolean
  url: string             // 公开访问 URL
  path: string            // Storage 路径
  fileName: string        // 生成的文件名
}

// 错误响应
interface UploadErrorResponse {
  success: false
  error: string
}
```

#### 示例

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@product.jpg"
```

---

## 7. 错误处理

### 标准错误响应

```typescript
interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}
```

### 常见错误码

| HTTP 状态码 | 错误信息 | 原因 |
|------------|---------|------|
| 400 | 参数错误 | 缺少必需参数或参数格式错误 |
| 401 | 未授权 | 需要登录 |
| 403 | 禁止访问 | 无权限或 URL 来源非法 |
| 404 | 资源不存在 | 模型或任务不存在 |
| 500 | 服务器错误 | 内部错误 |

### 错误处理示例

```typescript
try {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ mode: 'text_to_model', prompt: '' })
  })

  const data = await response.json()

  if (!data.success) {
    console.error('API Error:', data.error)
    return
  }

  // 处理成功响应
  console.log('Task ID:', data.taskId)
} catch (error) {
  console.error('Network Error:', error)
}
```

---

## 8. 速率限制

| 端点 | 限制 |
|------|------|
| `/api/generate` | 10 次/分钟 |
| `/api/evaluate` | 30 次/分钟 |
| `/api/batch-evaluate` | 5 次/分钟 |
| `/api/upload` | 20 次/分钟 |
| 其他 | 60 次/分钟 |

---

## 9. 相关文档

- [系统架构设计](./architecture.md)
- [AI 能力详解](./ai-design.md)
- [面试讲解稿](./interview-guide.md)