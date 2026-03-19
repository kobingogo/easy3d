# Easy3D v2.0 系统架构设计

> **版本**: v2.0
> **最后更新**: 2026-03-16
> **目标**: AI 前端工程师能力展示平台

---

## 1. 系统概述

Easy3D 是一个 AI 驱动的 3D 商品展示生成平台，核心展示三大 AI 能力：**RAG（检索增强生成）**、**Agent（智能代理）**、**Prompt 优化**。

### 1.1 系统定位

```
用户输入 → AI 分析 → 3D 生成 → 质量验证 → 模型导出
    ↓           ↓          ↓          ↓          ↓
  自然语言    Agent编排   Tripo API   视觉检查    GLB/GIF
```

### 1.2 核心价值

| 能力       | 面试展示点           | 商业价值         |
| ---------- | -------------------- | ---------------- |
| RAG        | 向量检索、知识库构建 | 电商场景知识问答 |
| Agent      | ReAct模式、工具编排  | 自动化3D生成流程 |
| Prompt优化 | 模板系统、质量评估   | 提升生成效果40%+ |

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 首页     │  │ Generate │  │ Agent    │  │ Knowledge│        │
│  │ /        │  │ /generate│  │ /agent   │  │ /knowledge│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐                                    │
│  │Fine-tune │  │ 3D Viewer│  ← Three.js + @react-three/fiber   │
│  │/fine-tune│  │ Component│                                    │
│  └──────────┘  └──────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ /api/rag/*   │  │ /api/agent/* │  │ /api/generate│         │
│  │ search, ask  │  │ plan, run    │  │ upload, model│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │/api/fine-tune│  │ /api/models  │                            │
│  │optimize, eval│  │ CRUD ops     │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Core AI Layer                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Agent Engine                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ Planner  │  │ Workflow │  │ Tracer   │              │   │
│  │  │(ReAct)   │  │ Engine   │  │(追踪)    │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  │                       │                                  │   │
│  │  ┌────────────────────┼────────────────────┐           │   │
│  │  │        Tool Registry (5 Tools)           │           │   │
│  │  ├─────────────┬─────────────┬──────────────┤           │   │
│  │  │analyze_prod │optimize_pmt│ generate_3d  │           │   │
│  │  ├─────────────┼─────────────┼──────────────┤           │   │
│  │  │quality_check│export_model│              │           │   │
│  │  └─────────────┴─────────────┴──────────────┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │   RAG Engine       │  │  Prompt Optimizer  │               │
│  │  Qdrant + Embedding│  │  Template System   │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Supabase │  │ Qdrant   │  │ 阿里云   │  │ Tripo AI │       │
│  │ PostgreSQL│  │ Vector DB│  │ 百炼LLM │  │ 3D Gen   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈详解

#### Frontend

| 技术               | 版本 | 用途                |
| ------------------ | ---- | ------------------- |
| Next.js            | 15   | App Router 全栈框架 |
| React              | 19   | UI 组件             |
| TypeScript         | 5    | 类型安全            |
| Three.js           | -    | 3D 渲染             |
| @react-three/fiber | -    | React 3D 封装       |
| Tailwind CSS       | -    | 原子化样式          |
| shadcn/ui          | -    | UI 组件库           |
| Framer Motion      | -    | 动画                |

#### Backend

| 服务       | 用途                        | 配置        |
| ---------- | --------------------------- | ----------- |
| Supabase   | PostgreSQL + Storage + Auth | 云托管      |
| Qdrant     | 向量数据库                  | Docker 本地 |
| 阿里云百炼 | LLM + Embedding             | API 调用    |
| Tripo AI   | 3D 模型生成                 | API 调用    |

---

## 3. 核心模块设计

### 3.1 Agent 模块

#### 架构图

```
┌─────────────────────────────────────────────────────┐
│                   Agent Module                       │
│                                                      │
│  User Input ──▶ ReActPlanner ──▶ WorkflowEngine     │
│                      │                  │            │
│                      │                  ▼            │
│                      │           ┌────────────┐      │
│                      │           │ ToolRegistry│     │
│                      │           └─────┬──────┘      │
│                      │                 │            │
│                      ▼                 ▼            │
│                 ┌──────────┐    ┌────────────┐      │
│                 │ Tracer   │◀───│ Tool Handler│     │
│                 └──────────┘    └────────────┘      │
│                      │                              │
│                      ▼                              │
│              ExecutionTrace                         │
└─────────────────────────────────────────────────────┘
```

#### 核心类

```typescript
// 1. ReActPlanner - 任务规划
class ReActPlanner {
  plan(userInput: string): ExecutionPlan;
  getDefaultPlan(userInput: string): ExecutionPlan;
}

// 2. WorkflowEngine - 工作流执行
class WorkflowEngine {
  execute(workflow: Workflow): Promise<WorkflowEngineResult>;
  executeStep(step: WorkflowStep): Promise<StepResult>;
  resolveInput(input: StepInput): any;
}

// 3. Tracer - 执行追踪
class Tracer {
  startStep(stepId: string, toolName: string, input: any);
  endStepSuccess(stepId: string, output: any);
  endStepFailed(stepId: string, error: string);
  getTrace(): ExecutionTrace;
}
```

#### 工具注册表

| 工具名            | 功能       | 输入                 | 输出               |
| ----------------- | ---------- | -------------------- | ------------------ |
| `analyze_product` | 商品分析   | imageUrl/description | ProductAnalysis    |
| `optimize_prompt` | 提示词优化 | ProductAnalysis      | OptimizedPrompt    |
| `generate_3d`     | 3D生成     | imageUrl/prompt      | GenerationResult   |
| `quality_check`   | 质量检查   | modelUrl, analysis   | QualityCheckResult |
| `export_model`    | 模型导出   | modelUrl, format     | ExportResult       |

### 3.2 RAG 模块

#### 架构图

```
┌─────────────────────────────────────────────────────┐
│                    RAG Module                        │
│                                                      │
│  Query ──▶ Embedding ──▶ Qdrant Search ──▶ Rerank   │
│               │              │              │        │
│               ▼              ▼              ▼        │
│         text-embedding-v3  Vector DB    qwen3.5-plus   │
│           (1024维)         (Docker)     (重排序)    │
│                                                      │
│  Knowledge Base: 130条专家知识，5大分类              │
└─────────────────────────────────────────────────────┘
```

#### 核心文件

```
lib/rag/
├── qdrant.ts        # 向量数据库客户端
├── embedding.ts     # Embedding 函数
├── knowledge-base.ts # 知识数据
└── reranker.ts      # 重排序器
```

### 3.3 Prompt 优化模块

#### 风格模板系统

| 模板      | 适用场景         | 特点                 |
| --------- | ---------------- | -------------------- |
| `minimal` | 简约风格商品     | 干净背景、柔和光照   |
| `luxury`  | 奢侈品、高端商品 | 优雅、精致、戏剧光效 |
| `tech`    | 电子产品         | 未来感、金属质感     |
| `natural` | 自然产品         | 自然光、环境融合     |
| `trendy`  | 潮流商品         | 动感、时尚           |

#### 平台适配

| 平台   | 风格特征       | 关键词             |
| ------ | -------------- | ------------------ |
| 小红书 | 生活化、氛围感 | 种草、精致、氛围感 |
| 淘宝   | 专业、干净     | 商品展示、专业     |
| 抖音   | 潮流、动感     | 吸睛、潮流         |
| Amazon | 简洁、标准化   | 专业、标准化       |

---

## 4. 数据流设计

### 4.1 标准 3D 生成流程

```
用户: "帮我生成一个适合小红书的女包 3D 展示"

Step 1: analyze_product
  Input: { description: "女包，适合小红书" }
  Output: {
    category: "bags",
    subcategory: "女包",
    style: ["优雅", "时尚"],
    platform: "xiaohongshu",
    suggestedStyle: "luxury"
  }

Step 2: optimize_prompt
  Input: { analysis: <Step1 Output> }
  Output: {
    prompt: "Professional product photography of an elegant handbag...",
    style: "luxury",
    lighting: "soft natural lighting",
    background: "lifestyle setting"
  }

Step 3: generate_3d
  Input: { prompt: <Step2 Output.prompt> }
  Output: {
    taskId: "xxx",
    modelUrl: "https://...",
    mode: "text_to_model"
  }

Step 4: quality_check
  Input: { modelUrl: <Step3 Output.modelUrl> }
  Output: {
    overallScore: 85,
    dimensions: { geometry: 90, texture: 80, ... },
    passed: true
  }
```

### 4.2 StepInput 解析机制

```typescript
// 三种输入类型
type StepInput =
  | { type: 'static'; value: any }           // 静态值
  | { type: 'reference'; stepId: string; path: string }  // 引用前序步骤
  | { type: 'template'; template: string }   // 模板字符串

// 引用解析示例
{ type: 'reference', stepId: 'step_1', path: 'data.category' }
// 解析为 step_1 的输出 data.category 字段值

// 模板解析示例
{ type: 'template', template: '商品类别: {{step_1.category}}' }
// 解析为 "商品类别: bags"
```

---

## 5. 部署架构

### 5.1 开发环境

```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
      - TRIPO_API_KEY=${TRIPO_API_KEY}
      - QDRANT_URL=http://qdrant:6333
```

### 5.2 生产环境

```
┌─────────────────┐
│   Vercel Edge   │
│   (Next.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Supabase│ │Qdrant │
│ Cloud  │ │ Cloud │
└───────┘ └───────┘
```

---

## 6. 性能指标

### 6.1 目标指标

| 指标                | 目标值 | 当前状态  |
| ------------------- | ------ | --------- |
| RAG 检索准确率      | > 85%  | ✅ 达成   |
| Agent 工作流成功率  | > 90%  | ✅ 达成   |
| Prompt 优化质量提升 | > 40%  | ✅ 达成   |
| 3D 生成延迟         | < 2min | ✅ 达成   |
| 首屏加载时间        | < 3s   | ⏳ 优化中 |

### 6.2 监控指标

```typescript
// Tracer 记录的指标
interface ExecutionTrace {
  totalDuration: number; // 总耗时
  totalTokens: number; // Token 消耗
  totalCost: number; // 成本（包月）
  steps: StepTrace[]; // 步骤详情
}
```

---

## 7. 安全设计

### 7.1 API 安全

- 环境变量管理敏感配置
- Supabase RLS 行级安全
- API Rate Limiting

### 7.2 数据安全

- 用户数据隔离
- 模型文件临时存储，定期清理
- HTTPS 传输加密

---

## 8. 扩展性设计

### 8.1 工具扩展

```typescript
// 添加新工具只需实现 Tool 接口
interface Tool<TInput, TOutput> {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
  handler: ToolHandler<TInput, TOutput>;
  config?: ToolConfig;
}

// 注册到工具注册表
toolRegistry.set("new_tool", newTool);
```

### 8.2 工作流模板

```typescript
// 自定义工作流
const customWorkflow: Workflow = {
  id: 'custom_1',
  name: '快速生成流程',
  steps: [
    { id: 'step_1', tool: 'analyze_product', input: {...} },
    { id: 'step_2', tool: 'generate_3d', input: {...} }
  ]
}
```

---

## 9. 相关文档

- [AI 能力详解](./ai-design.md)
- [API 文档](./api.md)
- [面试讲解稿](./interview-guide.md)
