# Phase 2B 手动验收与运维说明（模板化与品牌资产复用）

## 1. 数据库准备

在 Supabase SQL Editor 执行：

- `supabase/phase2b-template-brand.sql`

该脚本会创建：

1. `brand_profiles`（品牌资产）
2. `workflow_templates`（工作流模板）
3. `batch_jobs.workflow_template_id`（批次关联模板）

## 2. 页面验收路径

1. 打开 `/dashboard/templates`
2. 创建 1 条品牌资产
3. 创建 1 条工作流模板（可绑定上一步品牌资产，可选设为默认）
4. 打开 `/dashboard`
5. 在“新建批次”区域选择模板，创建批次
6. 打开批次详情，确认批次状态可正常推进，不影响 Phase 2A 流程

## 3. API 快速检查

1. `GET /api/brand-profiles?limit=20`
2. `POST /api/brand-profiles`
3. `GET /api/workflow-templates?limit=20`
4. `POST /api/workflow-templates`
5. `POST /api/batches`（可附带 `workflowTemplateId`）

## 4. 本地验证命令

1. `npm run type-check`
2. `npm run lint`
3. `npx tsx scripts/test-phase2b-template-brand.ts`
4. `npx tsx scripts/test-phase2a-batch-api.ts`
