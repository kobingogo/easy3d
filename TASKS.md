# Easy3D v2.0 开发任务清单

**项目定位**: AI 前端工程师能力展示平台
**开发周期**: 8 周 (2026-03-12 起)
**最后更新**: 2026-03-16

---

## 📊 进度总览

| Phase   | 周次     | 重点        | 状态      | 核心交付            |
| ------- | -------- | ----------- | --------- | ------------------- |
| Phase 1 | Week 1-2 | 基础架构    | ✅ 完成   | MVP + 3D 生成流程   |
| Phase 2 | Week 3-4 | RAG 能力    | ✅ 完成   | 知识库 + 向量检索   |
| Phase 3 | Week 5-6 | Agent 能力  | ✅ 完成   | 工作流引擎 + 控制台 |
| Phase 4 | Week 7-8 | Prompt 优化 | ✅ 完成   | 风格模板 + 评估系统 |
| Phase 5 | Week 9   | 面试准备    | 🔵 进行中 | 文档 + 演示         |

---

## 技术栈 (已实现)

| 模块       | 技术                                         |
| ---------- | -------------------------------------------- |
| 前端框架   | Next.js 15 + React 19                        |
| UI 组件    | shadcn/ui + Tailwind CSS                     |
| 3D 展示    | Three.js + @react-three/fiber                |
| 后端服务   | Supabase (PostgreSQL + Storage)              |
| 向量数据库 | Qdrant                                       |
| LLM 服务   | 阿里云百炼 (qwen3.5-plus, text-embedding-v3) |
| 3D 生成    | Tripo AI API                                 |

---

## Phase 1: 基础架构 ✅

**目标**: 可运行的 MVP，完成 3D 生成基础流程

- [x] 项目初始化 (Next.js 15 + TypeScript + Tailwind)
- [x] Supabase 配置 (数据库 + Storage)
- [x] 基础 UI 组件 (shadcn/ui)
- [x] Tripo API 封装
- [x] 核心页面 (首页、生成页)
- [x] API 路由 (upload, generate, models)

**关键文件**:

- `lib/supabase/` - Supabase 客户端
- `lib/tripo/` - Tripo API 封装
- `components/upload/UploadZone.tsx` - 拖拽上传
- `components/3d/ModelViewer.tsx` - 3D 预览

---

## Phase 2: RAG 能力 ✅

**目标**: 知识库问答，检索准确率 > 85%

- [x] Qdrant 配置 (Docker + @qdrant/js-client-rest)
- [x] Embedding 集成 (阿里云百炼 text-embedding-v3)
- [x] 知识库数据 (130 条，5 大分类)
- [x] RAG 检索服务 (向量检索 + Reranker)
- [x] 知识库 API (search, ask, suggest)
- [x] 知识管理 UI (`/knowledge`)

**关键文件**:

- `lib/rag/qdrant.ts` - 向量数据库
- `lib/rag/embedding.ts` - 向量化
- `lib/rag/knowledge-base.ts` - 知识数据
- `app/api/rag/` - RAG API 路由

**验收指标**: 检索准确率 > 85% ✓

---

## Phase 3: Agent 能力 ✅

**目标**: 自动化工作流，成功率 > 90%

- [x] Agent 工具定义 (OpenAI Function Calling 格式)
- [x] 工具实现
  - [x] `analyze_product` - 商品分析 (qwen-vl-max)
  - [x] `optimize_prompt` - 提示词优化 (集成 RAG)
  - [x] `generate_3d` - 3D 生成 (Tripo API)
  - [x] `quality_check` - 质量检查 (视觉模型)
  - [x] `export_model` - 模型导出
- [x] Agent 工作流引擎 (ReAct + Template)
- [x] Tracer 模块 (执行追踪 + 成本计算)
- [x] Agent 控制台 UI (`/agent`)
- [x] Agent API (plan, execute, run)

**关键文件**:

- `lib/agent/tools.ts` - 工具定义
- `lib/agent/planner.ts` - 任务规划
- `lib/agent/workflow.ts` - 工作流引擎
- `lib/agent/tracer.ts` - 执行追踪

**验收指标**: 工作流成功率 > 90% ✓

---

## Phase 4: Prompt 优化引擎 ✅

**目标**: Prompt 优化质量提升 > 40%

- [x] 风格模板系统 (minimal, luxury, tech, natural, trendy)
- [x] 提示词生成器 (PromptOptimizer + API)
- [x] 质量评估模块 (LLM评估 + 启发式降级)
- [x] 批量优化功能 (batchEvaluate + CSV导出)
- [x] 效果对比展示 (`/fine-tune`)

**关键文件**:

- `lib/fine-tune/prompt-optimizer.ts` - 优化引擎
- `lib/fine-tune/evaluate.ts` - 评估模块
- `app/api/fine-tune/` - API 路由

**验收指标**: 质量提升 > 40% ✓

---

## Phase 5: 面试准备 🔵

**目标**: 完整的面试作品集

### 5.1 演示流程设计

- [ ] 设计 5 分钟演示脚本
- [ ] 准备 3 个典型场景 (RAG/Agent/Prompt)
- [ ] 录制 Demo 视频

### 5.2 性能优化

- [ ] 首屏加载优化 (目标 < 3s)
- [ ] 图片压缩和懒加载
- [ ] API 响应缓存

### 5.3 文档完善

- [x] 架构设计文档 `docs/architecture.md`
- [x] AI 能力详解 `docs/ai-design.md`
- [x] API 文档 `docs/api.md`
- [x] 面试讲解稿 `docs/interview-guide.md`

### 5.4 GitHub 优化

- [ ] README.md 完善 (能力展示 + Demo 截图)
- [ ] 添加 Demo GIF
- [ ] 技术博客链接
- [ ] LICENSE 文件

---

## 🚀 启动指南

### 1. 环境准备

```bash
# 复制环境变量
cp .env.local.example .env.local

# 编辑 .env.local 填入实际值
```

### 2. 启动 Qdrant

```bash
docker-compose up -d
docker-compose ps
```

### 3. 构建知识库

```bash
# 确保 DASHSCOPE_API_KEY 已配置
npx tsx scripts/build-knowledge.ts
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问应用

| 页面         | URL                             |
| ------------ | ------------------------------- |
| 首页         | http://localhost:3000           |
| 3D 生成      | http://localhost:3000/generate  |
| Agent 控制台 | http://localhost:3000/agent     |
| RAG 知识库   | http://localhost:3000/knowledge |
| Prompt 优化  | http://localhost:3000/fine-tune |

---

## 📈 成功指标

| 指标                | 目标  | 当前      |
| ------------------- | ----- | --------- |
| RAG 检索准确率      | > 85% | ✅ 达成   |
| Agent 工作流成功率  | > 90% | ✅ 达成   |
| Prompt 优化质量提升 | > 40% | ✅ 达成   |
| 单元测试覆盖率      | > 80% | ⏳ 待实现 |

---

## 📝 备注

- Phase 1-4 已完成核心功能，Phase 5 专注于面试准备
- 技术博客计划：RAG 实战、Agent 设计、Prompt Engineering
- 遇到问题记录在 GitHub Issues
