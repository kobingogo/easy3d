# Easy3D v2.0 开发任务清单

## Phase 1: 基础架构 (Week 1-2) ✅ 完成

- [x] 项目初始化 (Next.js 14 + TypeScript + Tailwind)
- [x] Supabase 配置 (数据库 + Storage)
- [x] 基础 UI 组件 (shadcn/ui)
- [x] Tripo API 封装
- [x] 核心页面 (首页、生成、Agent、知识库、Prompt优化)
- [x] API 路由 (upload, generate, models)

## Phase 2: RAG 能力 (Week 3-4) ✅ 完成

- [x] Qdrant 配置 (Docker + @qdrant/js-client-rest)
- [x] Embedding 集成 (阿里云百炼 text-embedding-v3)
- [x] 知识库数据 (130 条，5 大分类)
- [x] RAG 检索服务 (向量检索 + Reranker)
- [x] 知识库 API (search, ask, suggest)
- [x] 知识管理 UI (检索、管理、统计)

## Phase 3: Agent 能力 (Week 5-6) ✅ 完成

- [x] Agent 工具定义 (OpenAI Function Calling 格式)
- [x] 工具实现
  - [x] analyze_product (商品分析) - 使用 qwen-vl-max 视觉模型
  - [x] optimize_prompt (提示词优化) - 集成 RAG 知识库
  - [x] generate_3d (3D 生成) - Tripo API 集成
  - [x] quality_check (质量检查) - 视觉模型评估
  - [x] export_model (模型导出) - 多格式支持
- [x] Agent 工作流引擎 (ReAct + Template)
- [x] Tracer 模块 (执行追踪 + 成本计算)
- [x] Agent 控制台 UI (规划 + 执行 + 结果展示)
- [x] Agent API (plan, execute, run)

## Phase 4: Prompt 优化引擎 (Week 7-8)

- [ ] 风格模板系统
- [ ] 提示词生成器
- [ ] 质量评估模块
- [ ] 批量优化功能
- [ ] 效果对比展示

## Phase 5: 面试准备 (Week 9)

- [ ] 演示流程设计
- [ ] 性能优化
- [ ] 文档完善
- [ ] 录屏演示

---

## 启动指南

### 1. 环境准备

```bash
# 复制环境变量
cp .env.local.example .env.local

# 编辑 .env.local 填入实际值
```

### 2. 启动 Qdrant

```bash
# 启动向量数据库
docker-compose up -d

# 查看状态
docker-compose ps
```

### 3. 构建知识库

```bash
# 确保已配置 DASHSCOPE_API_KEY
npx tsx scripts/build-knowledge.ts
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问应用

- 首页: http://localhost:3000
- 3D 生成: http://localhost:3000/generate
- Agent 控制台: http://localhost:3000/agent
- RAG 知识库: http://localhost:3000/knowledge
- Prompt 优化: http://localhost:3000/fine-tune

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Next.js 15 + React 19 |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 3D 展示 | Three.js + @react-three/fiber |
| 后端服务 | Supabase (PostgreSQL + Storage) |
| 向量数据库 | Qdrant |
| LLM 服务 | 阿里云百炼 (qwen-plus, text-embedding-v3) |
| 3D 生成 | Tripo AI API |