# easy3d v2.0 开发任务清单

**项目定位**: AI 前端工程师能力展示平台
**开发周期**: 8 周
**创建时间**: 2026-03-12
**状态**: 🟡 进行中

---

## 📊 总览

| Phase | 周次 | 重点 | 任务数 | 完成 |
|-------|------|------|--------|------|
| Phase 1 | Week 1-2 | 基础框架 + MVP | 8 | 0 |
| Phase 2 | Week 3-4 | RAG 能力 | 6 | 0 |
| Phase 3 | Week 5-6 | Agent 能力 | 6 | 0 |
| Phase 4 | Week 7-8 | 微调能力 | 5 | 0 |
| Phase 5 | Week 9 | 面试准备 | 4 | 0 |
| **总计** | **8 周** | | **29** | **0** |

---

## Phase 1: 基础框架 (Week 1-2)

**目标**: 可运行的 MVP，完成 3D 生成基础流程

### Task 1.1: 项目初始化
- [ ] 使用 create-next-app 创建项目
- [ ] 配置 TypeScript + Tailwind + ESLint
- [ ] 安装核心依赖 (Three.js, Supabase, shadcn/ui)

```bash
npx create-next-app@latest easy3d --typescript --tailwind --app --eslint
npm install three @react-three/fiber @react-three/drei
npm install @supabase/supabase-js @supabase/ssr
npm install next-auth lucide-react
npx shadcn@latest init
npx shadcn@latest add button card dialog progress toast tabs
```

**验收**: `npm run dev` 正常启动

---

### Task 1.2: Supabase 配置
- [ ] 创建 Supabase 项目
- [ ] 创建数据表 (users, models, knowledge_entries)
- [ ] 创建 Storage Buckets (images, models)
- [ ] 配置 RLS 策略
- [ ] 实现客户端/服务端 SDK

**文件**:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/types.ts`

**验收**: 客户端可正常连接数据库

---

### Task 1.3: 基础 UI 组件
- [ ] Header 组件 (Logo + 导航)
- [ ] Footer 组件
- [ ] UploadZone 组件 (拖拽上传)
- [ ] ModelViewer 组件 (Three.js 预览)

**文件**:
- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/upload/UploadZone.tsx`
- `components/3d/ModelViewer.tsx`

**验收**: 组件可独立渲染，拖拽上传正常

---

### Task 1.4: 核心页面
- [ ] 首页 (Landing Page)
- [ ] 生成页面 `/generate`
- [ ] 用户后台 `/dashboard`

**文件**:
- `app/page.tsx`
- `app/generate/page.tsx`
- `app/dashboard/page.tsx`

**验收**: 页面路由正常，样式美观

---

### Task 1.5: Tripo API 封装
- [ ] 申请 Tripo API Key
- [ ] 实现 `createTask()` - 创建 3D 生成任务
- [ ] 实现 `getTaskStatus()` - 查询任务状态
- [ ] 实现 `pollTaskStatus()` - 轮询直到完成
- [ ] 错误处理与重试机制

**文件**: `lib/tripo/index.ts`

**验收**: API 调用成功，可生成测试模型

---

### Task 1.6: 上传 API
- [ ] POST `/api/upload` - 图片上传到 Supabase Storage
- [ ] 图片格式校验 (JPG/PNG/WebP)
- [ ] 大小限制 (≤10MB)
- [ ] 返回公开 URL

**文件**: `app/api/upload/route.ts`

**验收**: 上传成功返回 URL

---

### Task 1.7: 生成 API
- [ ] POST `/api/generate` - 触发 3D 生成
- [ ] 创建数据库记录 (status: pending)
- [ ] 调用 Tripo API
- [ ] 轮询状态更新
- [ ] 下载模型到 Storage，更新记录

**文件**: `app/api/generate/route.ts`

**验收**: 完整流程：上传 → 生成 → 存储 → 返回

---

### Task 1.8: MVP 集成测试
- [ ] 完整流程测试
- [ ] 错误处理完善
- [ ] 移动端适配

**验收**: 上传图片 → 生成 3D → 预览导出 全流程可跑通

---

## Phase 2: RAG 能力 (Week 3-4)

**目标**: 实现知识库问答，检索准确率 > 85%

### Task 2.1: Qdrant 配置
- [ ] 本地 Docker 运行 Qdrant
- [ ] 安装 `@qdrant/js-client-rest`
- [ ] 创建 Collection `product-knowledge`
- [ ] 配置向量维度 (1536 或 768)

```bash
docker run -p 6333:6333 qdrant/qdrant
npm install @qdrant/js-client-rest
```

**文件**: `lib/rag/qdrant.ts`

**验收**: 可连接 Qdrant，Collection 创建成功

---

### Task 2.2: Embedding 集成
- [ ] 选择 Embedding 服务 (硅基流动/OpenAI)
- [ ] 实现 `embedding(text)` 函数
- [ ] 批量向量化处理

**文件**: `lib/rag/embedding.ts`

**验收**: 文本可转换为向量

---

### Task 2.3: 知识库数据生成
- [ ] 设计知识分类体系 (见设计文档)
- [ ] 用 LLM 生成 100+ 条知识条目
- [ ] 人工校验和优化
- [ ] 批量导入 Qdrant

**文件**:
- `lib/rag/knowledge-base.ts` - 知识数据
- `scripts/build-knowledge.ts` - 构建脚本

**验收**: 100+ 条知识入库，向量检索正常

---

### Task 2.4: RAG 检索 API
- [ ] POST `/api/rag/search` - 语义搜索
- [ ] GET `/api/rag/suggest` - 3D 展示建议
- [ ] 相似度阈值配置 (0.7)
- [ ] 返回相关度评分

**文件**: `app/api/rag/search/route.ts`

**验收**: 搜索返回相关结果，准确率 > 85%

---

### Task 2.5: RAG 展示页面
- [ ] 知识库管理页 `/knowledge`
- [ ] 搜索演示页 `/knowledge/search`
- [ ] 搜索结果组件 `KnowledgeSearch.tsx`
- [ ] 建议卡片组件 `SuggestionCard.tsx`

**文件**:
- `app/knowledge/page.tsx`
- `app/knowledge/search/page.tsx`
- `components/rag/KnowledgeSearch.tsx`

**验收**: 页面可搜索，结果展示清晰

---

### Task 2.6: RAG 技术博客
- [ ] 整理 RAG 实现过程
- [ ] 撰写技术博客《从零搭建 RAG 系统》
- [ ] 包含架构图、代码片段、效果截图

**产出**: 技术博客草稿

---

## Phase 3: Agent 能力 (Week 5-6)

**目标**: 实现自动化工作流，成功率 > 90%

### Task 3.1: Agent 工具定义
- [ ] `analyze_product` - 商品分析 (视觉模型)
- [ ] `optimize_prompt` - 提示词优化 (调用 RAG)
- [ ] `generate_3d` - 3D 生成 (Tripo API)
- [ ] `quality_check` - 质量检查 (视觉模型)
- [ ] `export_model` - 导出模型
- [ ] 工具类型定义和校验

**文件**: `lib/agent/tools.ts`

**验收**: 每个工具可独立调用

---

### Task 3.2: Agent 规划器
- [ ] 实现 ReAct 规划器 (Reason-Act-Observe)
- [ ] 预定义工作流模板
- [ ] 工作流选择逻辑 (简单任务用预定义，复杂用 ReAct)
- [ ] 步骤依赖管理

**文件**: `lib/agent/planner.ts`

**验收**: 输入自然语言，生成执行计划

---

### Task 3.3: Agent 工作流引擎
- [ ] 工作流执行器
- [ ] 步骤执行和状态管理
- [ ] 错误处理和重试机制
- [ ] 执行日志记录

**文件**: `lib/agent/workflow.ts`

**验收**: 工作流可顺序执行，错误可恢复

---

### Task 3.4: Agent API
- [ ] POST `/api/agent/run` - 启动 Agent 任务
- [ ] GET `/api/agent/status/[id]` - 查询执行状态
- [ ] WebSocket 实时日志推送 (可选)

**文件**: `app/api/agent/run/route.ts`

**验收**: API 可触发和查询 Agent 执行

---

### Task 3.5: Agent 展示页面
- [ ] Agent 控制台 `/agent`
- [ ] 工作流详情 `/agent/workflow/[id]`
- [ ] 工具卡片组件 `ToolCard.tsx`
- [ ] 执行日志组件 `ExecutionLog.tsx`

**文件**:
- `app/agent/page.tsx`
- `app/agent/workflow/[id]/page.tsx`
- `components/agent/ExecutionLog.tsx`

**验收**: 可视化展示工作流执行过程

---

### Task 3.6: Agent 技术博客
- [ ] 整理 Agent 架构设计
- [ ] 撰写技术博客《Agent 工作流设计实战》
- [ ] ReAct 原理讲解 + 实现代码

**产出**: 技术博客草稿

---

## Phase 4: 微调能力 (Week 7-8)

**目标**: Prompt 优化质量提升 > 40%

### Task 4.1: 训练数据准备
- [ ] 设计数据格式 (input/output)
- [ ] 用 LLM 生成 500+ 样本
- [ ] 人工校验质量
- [ ] 分类标注 (default/luxury/tech)

**文件**:
- `lib/fine-tune/data.ts`
- `scripts/fine-tune/prepare-data.ts`

**验收**: 500+ 高质量训练样本

---

### Task 4.2: Prompt 优化引擎
- [ ] 设计提示词模板系统
- [ ] 实现模板变量替换
- [ ] LLM 辅助填充
- [ ] 多风格支持 (default/luxury/tech)

**文件**: `lib/fine-tune/prompt-optimizer.ts`

**验收**: 输入商品描述，输出优化提示词

---

### Task 4.3: 效果评估系统
- [ ] 设计评估指标 (专业性/详细度/可执行性)
- [ ] LLM 自动评分
- [ ] A/B 对比展示
- [ ] 历史记录追踪

**文件**: `lib/fine-tune/evaluate.ts`

**验收**: 可量化对比优化效果

---

### Task 4.4: 微调展示页面
- [ ] 数据管理页 `/fine-tune`
- [ ] 效果对比页 `/fine-tune/evaluate`
- [ ] 对比可视化组件

**文件**:
- `app/fine-tune/page.tsx`
- `app/fine-tune/evaluate/page.tsx`

**验收**: 可视化展示优化前后对比

---

### Task 4.5: 微调技术博客
- [ ] 整理 Prompt Engineering 实践
- [ ] 撰写技术博客《电商提示词优化实战》
- [ ] 效果数据和分析

**产出**: 技术博客草稿

---

## Phase 5: 面试准备 (Week 9)

**目标**: 完整的面试作品集

### Task 5.1: 单元测试
- [ ] RAG 模块测试
- [ ] Agent 模块测试
- [ ] API 集成测试
- [ ] 覆盖率 > 80%

```bash
npm install -D vitest @testing-library/react
npm run test
```

**验收**: 测试覆盖率 > 80%

---

### Task 5.2: 技术文档
- [ ] 架构设计文档 `docs/architecture.md`
- [ ] AI 能力详解 `docs/ai-design.md`
- [ ] API 文档 `docs/api.md`

**验收**: 文档完整，新人可快速理解

---

### Task 5.3: 面试讲解稿
- [ ] 项目背景 (1 分钟)
- [ ] 技术架构 (3 分钟)
- [ ] AI 能力演示 (5 分钟)
- [ ] 工程化实践 (2 分钟)
- [ ] 学习收获 (1 分钟)

**文件**: `docs/interview-guide.md`

**验收**: 可流畅讲解 12 分钟

---

### Task 5.4: GitHub 优化
- [ ] README.md 完善 (能力展示 + Demo 截图)
- [ ] 添加 Demo GIF
- [ ] 添加技术博客链接
- [ ] LICENSE 文件

**验收**: GitHub 仓库专业、易读

---

## 📈 成功指标

### 技术指标
| 指标 | 目标 | 当前 |
|------|------|------|
| RAG 检索准确率 | > 85% | - |
| Agent 工作流成功率 | > 90% | - |
| Prompt 优化质量提升 | > 40% | - |
| 单元测试覆盖率 | > 80% | - |

### 面试指标
| 指标 | 目标 | 当前 |
|------|------|------|
| 技术博客阅读量 | > 5000 | - |
| GitHub Star | > 100 | - |

---

## 🚧 阻塞问题

| 问题 | 影响 | 状态 | 解决方案 |
|------|------|------|----------|
| - | - | - | - |

---

## 📝 备注

- 每个 Phase 完成后进行评审
- 遇到阻塞问题及时记录
- 优先保证核心功能质量，再考虑扩展

---

**最后更新**: 2026-03-12
**版本**: v2.0