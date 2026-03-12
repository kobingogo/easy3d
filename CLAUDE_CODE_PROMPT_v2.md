# easy3d v2.0 - Claude Code 开发指令 (AI 前端能力版)

**任务类型**: AI 前端全栈项目搭建  
**优先级**: P0 (面试作品 + 副业)  
**预计时间**: 8 周 (分阶段)  
**输出**: 可展示 AI 核心能力的完整项目

---

## 🎯 项目定位升级

**easy3d v2.0** 不仅是 3D 生成工具，更是 **AI 前端工程师能力展示平台**。

**核心展示能力**:
1. 🧠 **RAG** - 向量检索 + 知识库问答
2. 🤖 **Agent** - 多工具编排 + 自动化工作流
3. 🎯 **微调** - Prompt 优化 + LoRA 实验

---

## 📁 完整项目结构

```
easy3d/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 首页 (Landing)
│   ├── login/page.tsx              # 登录
│   │
│   ├── generate/                   # 3D 生成功能
│   │   ├── page.tsx                # 生成页面
│   │   └── [id]/page.tsx           # 结果详情
│   │
│   ├── agent/                      # ⭐ Agent 能力展示
│   │   ├── page.tsx                # Agent 控制台
│   │   ├── workflow/[id]/page.tsx  # 工作流执行
│   │   └── api/run/route.ts        # Agent 执行 API
│   │
│   ├── knowledge/                  # ⭐ RAG 能力展示
│   │   ├── page.tsx                # 知识库管理
│   │   ├── search/page.tsx         # 向量检索演示
│   │   └── api/search/route.ts     # RAG 检索 API
│   │
│   ├── fine-tune/                  # ⭐ 微调能力展示
│   │   ├── page.tsx                # 训练数据管理
│   │   ├── evaluate/page.tsx       # 效果对比
│   │   └── api/prompt-optimize/route.ts
│   │
│   ├── dashboard/                  # 用户后台
│   │   ├── page.tsx                # 模型列表
│   │   └── [id]/page.tsx           # 模型详情
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── upload/route.ts
│       ├── generate/route.ts
│       ├── models/route.ts
│       └── models/[id]/route.ts
│
├── components/
│   ├── ui/                         # shadcn/ui 组件
│   ├── 3d/                         # Three.js 组件
│   │   ├── ModelViewer.tsx
│   │   ├── ModelControls.tsx
│   │   └── Environment.tsx
│   ├── rag/                        # RAG 相关组件
│   │   ├── KnowledgeSearch.tsx     # 知识库搜索
│   │   └── SuggestionCard.tsx      # 建议卡片
│   ├── agent/                      # Agent 相关组件
│   │   ├── WorkflowBuilder.tsx     # 工作流构建器
│   │   ├── ToolCard.tsx            # 工具卡片
│   │   └── ExecutionLog.tsx        # 执行日志
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   │
│   ├── rag/                        # ⭐ RAG 引擎
│   │   ├── index.ts                # 统一导出
│   │   ├── qdrant.ts               # 向量数据库客户端
│   │   ├── embedding.ts            # 向量化函数
│   │   └── knowledge-base.ts       # 知识库数据
│   │
│   ├── agent/                      # ⭐ Agent 引擎
│   │   ├── index.ts
│   │   ├── tools.ts                # 工具定义
│   │   ├── workflow.ts             # 工作流编排
│   │   └── planner.ts              # 任务规划
│   │
│   ├── fine-tune/                  # ⭐ 微调工具
│   │   ├── data.ts                 # 数据准备
│   │   ├── prompt-optimizer.ts     # Prompt 优化
│   │   └── evaluate.ts             # 效果评估
│   │
│   ├── tripo/
│   │   └── index.ts                # Tripo API 封装
│   │
│   ├── llm/
│   │   ├── index.ts                # 硅基流动 API
│   │   └── types.ts
│   │
│   └── utils.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useModels.ts
│   ├── useRAG.ts                   # ⭐ RAG Hook
│   └── useAgent.ts                 # ⭐ Agent Hook
│
├── types/
│   ├── index.ts
│   ├── rag.ts                      # RAG 类型
│   ├── agent.ts                    # Agent 类型
│   └── api.ts
│
├── scripts/
│   ├── build-knowledge.ts          # 构建知识库
│   ├── fine-tune/
│   │   ├── prepare-data.ts         # 准备训练数据
│   │   └── evaluate.ts             # 评估脚本
│   └── seed/
│       └── knowledge-base.ts       # 种子数据
│
├── tests/                          # ⭐ 单元测试
│   ├── rag.test.ts
│   ├── agent.test.ts
│   ├── fine-tune.test.ts
│   └── e2e/
│       └── generate-flow.test.ts
│
├── docs/                           # ⭐ 技术文档
│   ├── architecture.md             # 架构设计
│   ├── ai-design.md                # AI 能力详解
│   ├── interview-guide.md          # 面试讲解稿
│   └── api.md                      # API 文档
│
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── vitest.config.ts                # 测试配置
```

---

## 📋 分阶段开发计划

### Phase 1: 基础框架 (Week 1-2)
**目标**: 可演示的 MVP

#### Task 1.1: 项目初始化
```bash
npx create-next-app@latest easy3d --typescript --tailwind --app --eslint
cd easy3d
npm install three @types/three @react-three/fiber @react-three/drei
npm install @supabase/supabase-js @supabase/ssr
npm install next-auth
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npx shadcn@latest init
npx shadcn@latest add button card dialog progress toast
```

#### Task 1.2: 基础组件
- `components/layout/Header.tsx`
- `components/upload/UploadZone.tsx`
- `components/3d/ModelViewer.tsx`

#### Task 1.3: 核心页面
- `app/page.tsx` (首页)
- `app/generate/page.tsx` (生成页)
- `app/api/generate/route.ts` (生成 API)

**验收**: 上传→生成→预览 流程可跑通

---

### Phase 2: RAG 能力 (Week 3-4) ⭐
**目标**: 实现知识库问答

#### Task 2.1: 向量数据库 setup
```bash
# 本地 Qdrant (开发)
docker run -p 6333:6333 qdrant/qdrant

# 或 Qdrant Cloud (生产)
npm install @qdrant/js-client-rest
```

#### Task 2.2: RAG 引擎实现
```typescript
// lib/rag/index.ts
import { QdrantClient } from '@qdrant/js-client-rest'
import { embedding } from './embedding'

export async function searchKnowledge(query: string, limit = 3) {
  const vector = await embedding(query)
  const results = await client.search('product-knowledge', {
    vector,
    limit,
    score_threshold: 0.7
  })
  return results.map(r => r.payload)
}

export async function suggestDisplay(productDesc: string) {
  const knowledge = await searchKnowledge(productDesc)
  return llm.generate(`
    基于以下专业知识，为商品推荐 3D 展示方案：
    商品：${productDesc}
    参考资料：${JSON.stringify(knowledge)}
  `)
}
```

#### Task 2.3: 知识库数据
```typescript
// lib/rag/knowledge-base.ts
export const knowledgeBase = [
  {
    text: "化妆品类商品适合纯色背景 + 柔光，突出产品质感",
    tags: ["化妆品", "灯光", "背景"],
    category: "beauty"
  },
  {
    text: "3C 产品适合科技感场景 + 金属质感，强调现代感",
    tags: ["3C", "场景", "风格"],
    category: "electronics"
  },
  // ... 100+ 条
]
```

#### Task 2.4: RAG 页面
- `app/knowledge/page.tsx` (知识库管理)
- `app/knowledge/search/page.tsx` (检索演示)
- `components/rag/SuggestionCard.tsx`

**验收**: 
- [ ] 知识库可搜索
- [ ] 检索结果相关度 > 85%
- [ ] 生成建议质量高

---

### Phase 3: Agent 能力 (Week 5-6) ⭐
**目标**: 实现自动化工作流

#### Task 3.1: Agent 工具定义
```typescript
// lib/agent/tools.ts
export const tools = {
  analyzeProduct: {
    name: "analyze_product",
    description: "分析商品图片，识别类别、风格、目标用户",
    handler: async (image: File) => {
      return llm.vision("分析这个商品的类别、风格、目标用户", image)
    }
  },
  
  optimizePrompt: {
    name: "optimize_prompt",
    description: "基于 RAG 检索优化 3D 生成提示词",
    handler: async (analysis: string) => {
      const knowledge = await rag.search(analysis)
      return llm.generate(`为${analysis}生成 Tripo API 提示词，参考：${knowledge}`)
    }
  },
  
  generate3D: {
    name: "generate_3d",
    description: "调用 Tripo API 生成 3D 模型",
    handler: async (prompt: string, image: File) => {
      return tripo.createTask({ image, prompt })
    }
  },
  
  qualityCheck: {
    name: "quality_check",
    description: "检查 3D 模型质量",
    handler: async (modelUrl: string) => {
      const issues = await llm.vision("检查这个 3D 模型的问题", modelUrl)
      return { passed: issues.length === 0, issues }
    }
  },
  
  publishToXiaohongshu: {
    name: "publish_xiaohongshu",
    description: "发布到小红书",
    handler: async (model: Model) => {
      return openclaw.xiaohongshu.publish({
        title: `${model.productName} 3D 展示`,
        tags: ['3D', '电商', model.category]
      })
    }
  }
}
```

#### Task 3.2: Agent 工作流编排
```typescript
// lib/agent/workflow.ts
export class GeneratorAgent {
  private tools: Tool[]
  private planner: Planner

  constructor() {
    this.tools = Object.values(tools)
    this.planner = new ReActPlanner()
  }

  async run(userInput: string): Promise<ExecutionResult> {
    const plan = await this.planner.plan(userInput, this.tools)
    const results = []
    
    for (const step of plan.steps) {
      const tool = this.tools.find(t => t.name === step.tool)
      const result = await tool.handler(...step.args)
      results.push(result)
      
      // 错误处理与重试
      if (!result.success && step.retryable) {
        // 重试逻辑
      }
    }
    
    return { plan, results }
  }
}
```

#### Task 3.3: Agent 页面
- `app/agent/page.tsx` (Agent 控制台)
- `components/agent/WorkflowBuilder.tsx`
- `components/agent/ExecutionLog.tsx`

**验收**:
- [ ] Agent 可理解自然语言输入
- [ ] 正确调用工具链
- [ ] 工作流成功率 > 90%

---

### Phase 4: 微调实践 (Week 7-8) ⭐
**目标**: 实现 Prompt 优化

#### Task 4.1: 训练数据准备
```typescript
// scripts/fine-tune/prepare-data.ts
export const trainingData = [
  {
    input: "女包，棕色，皮质",
    output: "Professional product photography of a brown leather handbag, studio lighting, white background, 4K, highly detailed, e-commerce ready"
  },
  // ... 500+ 样本
]

// 导出为 JSONL 格式
function exportToJsonl(data: TrainingData[]) {
  return data.map(d => JSON.stringify(d)).join('\n')
}
```

#### Task 4.2: Prompt 优化引擎
```typescript
// lib/fine-tune/prompt-optimizer.ts
export class PromptOptimizer {
  private templates: Record<string, string> = {
    default: "Professional product photography of {product}, {style}, {lighting}, {background}",
    luxury: "Luxury product showcase of {product}, premium lighting, elegant background",
    tech: "High-tech product render of {product}, futuristic lighting, metallic background"
  }

  async optimize(input: string, category: string): Promise<string> {
    const template = this.templates[category] || this.templates.default
    
    // 调用 LLM 填充模板
    return llm.generate(`
      根据以下模板和商品信息，生成专业的英文提示词：
      模板：${template}
      商品：${input}
    `)
  }

  async evaluate(original: string, optimized: string): Promise<Evaluation> {
    // 评估指标：专业性、详细度、可执行性
    return {
      professionalism: await llm.score(optimized, "professional"),
      detail: await llm.score(optimized, "detailed"),
      execution: await llm.score(optimized, "executable")
    }
  }
}
```

#### Task 4.3: 效果对比页面
- `app/fine-tune/page.tsx` (数据管理)
- `app/fine-tune/evaluate/page.tsx` (效果对比)

**验收**:
- [ ] 优化后提示词质量提升 > 40%
- [ ] 有可视化对比效果

---

### Phase 5: 面试准备 (Week 9)
**目标**: 整理文档与讲解稿

#### Task 5.1: 技术文档
- `docs/architecture.md` - 架构设计
- `docs/ai-design.md` - AI 能力详解
- `docs/interview-guide.md` - 面试讲解稿

#### Task 5.2: 测试覆盖
```bash
npm install -D vitest @testing-library/react
npm run test  # 覆盖率 > 80%
```

#### Task 5.3: GitHub 优化
- README.md 完善
- 添加 Demo 截图/GIF
- 添加技术博客链接

---

## ✅ 最终验收清单

### 功能验收
- [ ] 3D 生成流程可跑通
- [ ] RAG 检索准确率 > 85%
- [ ] Agent 工作流成功率 > 90%
- [ ] Prompt 优化质量提升 > 40%

### 代码质量
- [ ] TypeScript 无类型错误
- [ ] 单元测试覆盖率 > 80%
- [ ] ESLint 无报错
- [ ] 组件可复用

### 文档
- [ ] README.md 完整
- [ ] 架构文档清晰
- [ ] 面试讲解稿准备好

### 面试展示
- [ ] GitHub 仓库整洁
- [ ] 技术博客 3+ 篇
- [ ] Demo 可现场演示

---

## 🚀 快速启动

```bash
# Phase 1 启动
cd /Users/bingo/.openclaw/workspace/projects/easy3d
npx create-next-app@latest easy3d --typescript --tailwind --app
# ... 按照 Phase 1 任务执行

# 每个 Phase 完成后暂停，确认后再继续
```

---

**开始工作吧！有任何不确定的地方随时问我。** 🌀
