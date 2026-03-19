# Easy3D v2.0

<div align="center">

**AI Frontend Engineer Capability Showcase Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

> AI 驱动的 3D 商品展示生成平台，展示 **RAG 检索增强生成**、**Agent 智能代理**、**Prompt 优化** 三大核心能力。

---

## 核心能力

| 能力       | 技术实现                             | 亮点指标                       |
| ---------- | ------------------------------------ | ------------------------------ |
| **RAG**    | Qdrant + 阿里云 Embedding + Reranker | 130条知识，检索准确率 **>85%** |
| **Agent**  | ReAct 模式 + WorkflowEngine          | 5个工具编排，成功率 **>90%**   |
| **Prompt** | 模板系统 + LLM 评估                  | 质量提升 **>40%**              |

---

## 技术栈

### Frontend

| 技术           | 用途                |
| -------------- | ------------------- |
| Next.js 15     | App Router 全栈框架 |
| React 19       | UI 组件             |
| TypeScript 5   | 类型安全            |
| Three.js + R3F | 3D 渲染             |
| Tailwind CSS   | 原子化样式          |
| shadcn/ui      | UI 组件库           |
| Framer Motion  | 动画                |

### AI Layer (核心展示)

| 技术         | 用途                                               |
| ------------ | -------------------------------------------------- |
| Qdrant       | 向量数据库 (RAG)                                   |
| 阿里云百炼   | LLM (qwen3.5-plus, qwen-vl-max, text-embedding-v3) |
| Tripo AI     | 3D 模型生成                                        |
| Custom Agent | ReAct + Template Planner                           |

### Backend

| 技术        | 用途                 |
| ----------- | -------------------- |
| Supabase    | PostgreSQL + Storage |
| NextAuth.js | 认证                 |

---

## 快速开始

### 1. 环境要求

- Node.js 18+
- Docker (Qdrant)
- Supabase 账号
- 阿里云百炼 API Key
- Tripo AI API Key

### 2. 安装

```bash
git clone https://github.com/your-org/easy3d.git
cd easy3d
npm install
cp .env.local.example .env.local
```

### 3. 配置环境变量

```bash
# 阿里云百炼
DASHSCOPE_API_KEY=sk-xxx

# Tripo AI
TRIPO_API_KEY=xxx

# Qdrant
QDRANT_URL=http://localhost:6333

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# NextAuth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
```

### 4. 启动 Qdrant

```bash
docker-compose up -d
docker-compose ps
```

### 5. 构建知识库

```bash
npx tsx scripts/build-knowledge.ts
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 项目结构

```
easy3d/
├── app/
│   ├── page.tsx              # 首页
│   ├── generate/             # 3D 生成
│   ├── agent/                # ⭐ Agent 展示
│   ├── knowledge/            # ⭐ RAG 展示
│   ├── fine-tune/            # ⭐ Prompt 优化展示
│   └── api/                  # API 路由
│       ├── knowledge/        # RAG API
│       ├── agent/            # Agent API
│       ├── optimize/         # Prompt 优化
│       ├── evaluate/         # 质量评估
│       └── generate/         # 3D 生成
├── lib/
│   ├── rag/                  # ⭐ RAG 引擎
│   │   ├── qdrant.ts         # 向量数据库
│   │   ├── embedding.ts      # 向量化
│   │   └── knowledge-base.ts # 知识数据
│   ├── agent/                # ⭐ Agent 引擎
│   │   ├── tools.ts          # 工具定义
│   │   ├── planner.ts        # 任务规划
│   │   ├── workflow.ts       # 工作流引擎
│   │   └── tracer.ts         # 执行追踪
│   └── fine-tune/            # ⭐ Prompt 优化
│       ├── prompt-optimizer.ts
│       └── evaluate.ts
├── components/
│   ├── 3d/                   # Three.js 组件
│   ├── rag/                  # RAG UI
│   └── agent/                # Agent UI
└── docs/
    ├── architecture.md       # 架构设计
    ├── ai-design.md          # AI 能力详解
    ├── api.md                # API 文档
    └── interview-guide.md    # 面试讲解稿
```

---

## API 概览

| 模块         | 端点                       | 功能             |
| ------------ | -------------------------- | ---------------- |
| **RAG**      | `POST /api/knowledge`      | 知识库检索与问答 |
| **Agent**    | `POST /api/agent`          | 工作流规划与执行 |
| **Generate** | `POST /api/generate`       | 3D 模型生成      |
| **Optimize** | `POST /api/optimize`       | Prompt 优化      |
| **Evaluate** | `POST /api/evaluate`       | 质量评估         |
| **Batch**    | `POST /api/batch-evaluate` | 批量评估         |

详见 [API 文档](./docs/api.md)

---

## RAG 实现

### 知识库结构

```typescript
interface KnowledgeEntry {
  id: string;
  text: string; // 专家知识
  vector: number[]; // 1024 维向量
  tags: string[]; // ["化妆品", "灯光"]
  category: string; // 分类
}
```

### 核心流程

```
用户问题 → Embedding → Qdrant 检索 → Reranker → 生成答案
             │              │            │
             ▼              ▼            ▼
      text-embedding-v3   Vector DB   qwen3.5-plus
        (1024维)          (Docker)    (重排序)
```

### 关键指标

- 知识库条目：130 条
- 向量维度：1024
- 检索阈值：0.7
- 检索准确率：> 85%

---

## Agent 实现

### 工具定义

| 工具              | 功能       | 模型               |
| ----------------- | ---------- | ------------------ |
| `analyze_product` | 商品分析   | qwen-vl-max        |
| `optimize_prompt` | 提示词优化 | qwen3.5-plus + RAG |
| `generate_3d`     | 3D 生成    | Tripo API          |
| `quality_check`   | 质量检查   | qwen-vl-max        |
| `export_model`    | 模型导出   | -                  |

### 工作流示例

```
用户: "帮我生成一个适合小红书的女包 3D 展示"

Step 1: analyze_product
  → { category: "bags", style: "luxury", platform: "xiaohongshu" }

Step 2: optimize_prompt
  → "Professional product photography of an elegant handbag..."

Step 3: generate_3d
  → { taskId: "xxx", modelUrl: "https://..." }

Step 4: quality_check
  → { passed: true, score: 85 }
```

### StepInput 解析

```typescript
type StepInput =
  | { type: "static"; value: any }
  | { type: "reference"; stepId: string; path: string }
  | { type: "template"; template: string };
```

---

## Prompt 优化

### 风格模板

| 风格      | 适用场景 | 特点                 |
| --------- | -------- | -------------------- |
| `minimal` | 简约商品 | 干净背景、柔和光照   |
| `luxury`  | 奢侈品   | 优雅、精致、戏剧光效 |
| `tech`    | 电子产品 | 未来感、金属质感     |
| `natural` | 自然产品 | 自然光、环境融合     |
| `trendy`  | 潮流商品 | 动感、时尚           |

### 平台适配

| 平台   | 关键词               |
| ------ | -------------------- |
| 小红书 | 种草、精致、氛围感   |
| 淘宝   | 专业、干净、商品展示 |
| 抖音   | 吸睛、潮流           |
| Amazon | 专业、标准化         |

### 评估指标

```typescript
interface EvaluationMetrics {
  overallScore: number; // 整体质量 (权重 1.0)
  professionalismScore: number; // 专业度 (权重 0.25)
  detailScore: number; // 细节描述 (权重 0.20)
  creativityScore: number; // 创意性 (权重 0.15)
  ecommerceScore: number; // 电商适配度 (权重 0.20)
  generationScore: number; // 3D生成友好度 (权重 0.20)
}
```

---

## Demo 演示

### 场景一：Agent 演示

1. 访问 `/agent`
2. 输入："帮我生成一个适合小红书的护肤品 3D 展示"
3. 查看执行追踪和生成结果

### 场景二：RAG 演示

1. 访问 `/knowledge`
2. 搜索："化妆品拍摄如何布光"
3. 查看检索结果和相似度分数

### 场景三：Prompt 优化演示

1. 访问 `/fine-tune`
2. 输入："女包，棕色，皮质"
3. 选择风格和平台，查看优化效果对比

---

## 成功指标

| 指标                | 目标  | 状态     |
| ------------------- | ----- | -------- |
| RAG 检索准确率      | > 85% | ✅ 达成  |
| Agent 工作流成功率  | > 90% | ✅ 达成  |
| Prompt 优化质量提升 | > 40% | ✅ 达成  |
| 知识库条目          | > 100 | ✅ 130条 |
| API 端点            | 10    | ✅ 完成  |

---

## 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产
npm start

# 类型检查
npm run type-check

# Lint
npm run lint
```

---

## 相关文档

- [系统架构设计](./docs/architecture.md)
- [AI 能力详解](./docs/ai-design.md)
- [API 文档](./docs/api.md)
- [面试讲解稿](./docs/interview-guide.md)

---

## License

MIT © 2026 Easy3D Team

---

<div align="center">

**Built with ❤️ for AI Frontend Engineer Interview**

</div>
