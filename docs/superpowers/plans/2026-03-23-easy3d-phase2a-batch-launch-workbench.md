# easy3d Phase 2A 批量上新工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不引入重型基础设施的前提下，完成 `批量上传 -> 队列执行 -> 进度可视 -> 失败重试 -> 批量导出` 的 Phase 2A 闭环。

**Architecture:** 复用 Phase 1 单任务生成链路，在其上增加 `batch_jobs + batch_items` 调度层。通过轻量应用层队列实现受控并发执行，不在 Phase 2A 实现用户可编辑模板或品牌资产库。

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Supabase Postgres/Storage, Tripo API, Tailwind CSS, `tsx` 脚本验收。

---

## 范围与假设

1. Phase 2A 继续聚焦 `bags`（包袋/小皮具），不扩展鞋类公开支持。
2. 单批次默认上限 20 项，默认并发 3（均可配置）。
3. 批量能力复用 Phase 1 的单项素材包生成与解锁逻辑。
4. 批量导出默认仅导出 `completed/unlocked` 项。
5. 模板系统与品牌预设留给 Phase 2B，不在本计划实现。

## 文件结构映射

### 新增文件

- `lib/seller-workflow/batch-types.ts`
  - 定义批次与子任务状态、DTO、聚合统计类型。
- `lib/seller-workflow/batch-queue.ts`
  - 实现轻量队列领取、状态转移、重试策略。
- `lib/seller-workflow/batch-export.ts`
  - 实现批次级导出打包逻辑（聚合已完成项）。
- `app/api/batches/route.ts`
  - 创建批次、查询批次列表。
- `app/api/batches/[id]/route.ts`
  - 查询批次详情（含子任务）。
- `app/api/batches/[id]/process/route.ts`
  - 推进队列处理（受控并发）。
- `app/api/batches/[id]/items/[itemId]/retry/route.ts`
  - 失败子任务重试。
- `app/api/batches/[id]/download/route.ts`
  - 批量导出入口。
- `app/dashboard/batches/[id]/page.tsx`
  - 批次详情页。
- `components/batch/batch-create-form.tsx`
  - 批次创建与批量上传表单。
- `components/batch/batch-progress-panel.tsx`
  - 批次进度看板。
- `components/batch/batch-item-table.tsx`
  - 子任务列表与状态操作。
- `scripts/test-phase2a-batch-schema.ts`
  - 验证批次状态机、类型和边界。
- `scripts/test-phase2a-batch-api.ts`
  - 验证批次 API 基本契约。
- `scripts/test-phase2a-batch-e2e-checklist.ts`
  - 验证端到端关键链路。
- `supabase/phase2a-batch-workbench.sql`
  - 新增批次相关表、索引与约束。
- `docs/phase2a-manual-ops.md`
  - 批次失败处理与人工干预手册。

### 修改文件

- `lib/supabase/types.ts`
  - 补齐 `batch_jobs / batch_items` 类型。
- `app/dashboard/page.tsx`
  - 以批次视图为默认入口，保留单任务回退入口。
- `app/generate/page.tsx`
  - 增加进入批量上新入口（不移除单任务）。
- `README.md`
  - 增补 Phase 2A 功能说明与操作路径。
- `package.json`
  - 如引入新依赖或脚本，更新命令集合。

---

## 实施顺序

严格顺序：

1. 先定义数据模型和状态机
2. 再实现队列服务与 API
3. 再实现前端批次视图
4. 最后做导出与验收

---

### Task 1: 批次数据模型与状态机

**Files:**
- Create: `lib/seller-workflow/batch-types.ts`
- Create: `supabase/phase2a-batch-workbench.sql`
- Modify: `lib/supabase/types.ts`
- Test: `scripts/test-phase2a-batch-schema.ts`

- [ ] **Step 1: 先写失败脚本**

脚本应断言：

1. 批次状态集合完整（`queued/running/partial_failed/completed/canceled`）
2. 子任务状态迁移合法（`failed -> queued` 可重试）
3. 单批次项数上限校验（20）

- [ ] **Step 2: 跑脚本确认失败**

Run: `npx tsx scripts/test-phase2a-batch-schema.ts`  
Expected: FAIL（类型或实现缺失）。

- [ ] **Step 3: 定义批次类型与状态迁移**

在 `batch-types.ts` 提供：

1. 状态枚举
2. 批次统计聚合类型
3. 状态迁移校验函数
4. 批次上限常量

- [ ] **Step 4: 定义数据库结构**

`phase2a-batch-workbench.sql` 需包含：

1. `batch_jobs`
2. `batch_items`
3. 必要索引（`batch_job_id`、`status`、`locked_at`）
4. 关键约束（状态、上限、引用关系）

- [ ] **Step 5: 更新 Supabase 类型**

在 `lib/supabase/types.ts` 同步新表 Row/Insert/Update。

- [ ] **Step 6: 回跑脚本**

Run: `npx tsx scripts/test-phase2a-batch-schema.ts`  
Expected: PASS。

- [ ] **Step 7: 类型检查**

Run: `npm run type-check`  
Expected: PASS。

---

### Task 2: 队列服务与批次调度核心

**Files:**
- Create: `lib/seller-workflow/batch-queue.ts`
- Modify: `app/api/generate-smart/route.ts`（仅在必要时补充可复用入口）
- Test: `scripts/test-phase2a-batch-api.ts`

- [ ] **Step 1: 写失败 API 脚本**

脚本应覆盖：

1. 领取 `queued` 子任务时并发不超过上限
2. 同一子任务不可被重复领取
3. `failed` 子任务可重试回队列

- [ ] **Step 2: 跑脚本确认失败**

Run: `npx tsx scripts/test-phase2a-batch-api.ts`  
Expected: FAIL（接口未实现）。

- [ ] **Step 3: 实现队列核心函数**

最少包含：

1. `claimBatchItemsForProcessing(...)`
2. `markBatchItemProcessing(...)`
3. `markBatchItemCompleted(...)`
4. `markBatchItemFailed(...)`
5. `requeueFailedBatchItem(...)`

- [ ] **Step 4: 保证聚合计数同步**

每次子任务状态变化后，同步更新 `batch_jobs` 聚合字段。

- [ ] **Step 5: 回跑脚本**

Run: `npx tsx scripts/test-phase2a-batch-api.ts`  
Expected: PASS。

---

### Task 3: 批次 API 契约实现

**Files:**
- Create: `app/api/batches/route.ts`
- Create: `app/api/batches/[id]/route.ts`
- Create: `app/api/batches/[id]/process/route.ts`
- Create: `app/api/batches/[id]/items/[itemId]/retry/route.ts`

- [ ] **Step 1: 实现批次创建与列表**

`POST /api/batches`：

1. 接收批次名和上传项
2. 生成 `batch_jobs + batch_items`
3. 返回 `batchId`

`GET /api/batches`：

1. 返回批次列表
2. 包含聚合统计和状态

- [ ] **Step 2: 实现批次详情**

`GET /api/batches/:id` 返回：

1. 批次摘要
2. 子任务列表（分页）

- [ ] **Step 3: 实现处理与重试**

`POST /api/batches/:id/process`：

1. 推进队列
2. 按并发限制领取并处理

`POST /api/batches/:id/items/:itemId/retry`：

1. 仅允许 `failed` 子任务重试

- [ ] **Step 4: 脚本回归**

Run: `npx tsx scripts/test-phase2a-batch-api.ts`  
Expected: PASS。

---

### Task 4: 批次导出与交付入口

**Files:**
- Create: `lib/seller-workflow/batch-export.ts`
- Create: `app/api/batches/[id]/download/route.ts`

- [ ] **Step 1: 定义导出策略**

导出内容：

1. 仅 `completed/unlocked` 子任务
2. 每个子任务保留其 Phase 1 ZIP（或等价目录）
3. 顶层附带批次 manifest

- [ ] **Step 2: 实现下载路由**

`GET /api/batches/:id/download`：

1. 校验批次可导出项
2. 无可导出项返回明确错误
3. 有可导出项返回聚合包

- [ ] **Step 3: 增加最小契约测试**

在 `test-phase2a-batch-api.ts` 增加下载路由断言。

---

### Task 5: Dashboard 批次工作台 UI

**Files:**
- Modify: `app/dashboard/page.tsx`
- Create: `app/dashboard/batches/[id]/page.tsx`
- Create: `components/batch/batch-create-form.tsx`
- Create: `components/batch/batch-progress-panel.tsx`
- Create: `components/batch/batch-item-table.tsx`

- [ ] **Step 1: 把 dashboard 主入口切到批次视图**

1. 展示批次卡片列表
2. 展示批次进度聚合
3. 保留“单任务入口”链接

- [ ] **Step 2: 新增批次详情页**

1. 显示整体进度
2. 显示子任务状态表格
3. 失败项提供重试按钮
4. 导出按钮接 `download` 路由

- [ ] **Step 3: 新增批次创建表单**

1. 批次名
2. 多文件上传
3. 创建后自动跳转详情页

- [ ] **Step 4: 本地手动验收**

Run: `npm run dev`  
手动检查：

1. 能创建批次
2. 能看到批次进度
3. 能重试失败项
4. 能触发批量下载

---

### Task 6: 文档与运维手册

**Files:**
- Create: `docs/phase2a-manual-ops.md`
- Modify: `README.md`

- [ ] **Step 1: 写批次人工处理手册**

手册需包含：

1. 如何查看失败批次
2. 如何重试单项
3. 如何标记批次取消
4. 如何处理导出失败

- [ ] **Step 2: README 同步**

至少更新：

1. Phase 2A 功能概览
2. 批次工作台入口路径
3. 已知边界（不含模板系统）

---

### Task 7: 最终验收与收口

**Files:**
- Create: `scripts/test-phase2a-batch-e2e-checklist.ts`

- [ ] **Step 1: 编写最终验收脚本**

脚本校验：

1. 批次路由存在
2. 批次 API 主链路可调用
3. dashboard 存在批次入口文案
4. 下载路由存在

- [ ] **Step 2: 运行最终命令**

Run: `npx tsx scripts/test-phase2a-batch-schema.ts`  
Expected: PASS。

Run: `npx tsx scripts/test-phase2a-batch-api.ts`  
Expected: PASS。

Run: `npx tsx scripts/test-phase2a-batch-e2e-checklist.ts`  
Expected: PASS。

Run: `npm run type-check`  
Expected: PASS。

Run: `npm run lint`  
Expected: PASS 或记录可接受的已知 warning。

---

## 后续拆分（非本计划）

Phase 2A 完成后再进入：

1. `Phase 2B` 模板系统与品牌一致性
2. `Phase 3` 内容工作流增强（封面/脚本/标签建议）
3. `Phase 4` Agent + RAG 自动化增强
