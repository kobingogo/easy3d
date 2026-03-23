# easy3d

面向中小电商卖家的 AI 商品素材包工作台。

当前已进入 `Phase 2A`，在 `Phase 1` 单任务链路之上补齐批量上新闭环。产品仍聚焦 `包袋 / 小皮具`：

`创建批次 -> 批量上传 -> 受控并发处理 -> 失败重试 -> 批量导出`

保留 `Phase 1` 单任务链路用于补单与快速起稿：

`上传商品图 -> 整理多平台素材包预览 -> 提交解锁请求 -> 下载完整素材包`

## 当前定位

- 目标用户：1-10 人的中小卖家、小团队、内容电商工作室
- 首发范围：包袋 / 小皮具
- 主结果：淘宝主图、小红书封面、抖音竖图、平台文案、策略摘要
- 商业边界：预览免费，完整素材包通过解锁流获取

## Phase 2A 能力（当前）

- 批次创建与批量图片入队（单批次 1-20 项）
- 批次级状态与子任务状态可视化
- 受控并发处理（默认并发 3）
- 失败子任务重试（`failed -> queued`）
- 批量导出完成且已解锁的子任务交付包
- Dashboard 默认入口升级为批量工作台，保留 `/generate` 单任务入口

## Phase 1 能力（仍可用）

- 固定 `Phase 1` 预设，明确只服务包袋 / 小皮具
- 单图 / 多视角商品图上传
- Tripo 驱动的 3D 生成链路
- 基于持久化 metadata 的素材包预览
- 解锁请求流与统一状态派生
- 首页、生成页、Dashboard 全部围绕“素材任务”而不是“模型 demo”
- 当前支持：包袋、卡包、零钱包、短夹、收纳小包等结构稳定的商品
- 多平台输出：淘宝、小红书、抖音
- 交付方式：预览免费，确认后再走解锁下载

## 当前工作流

1. 在 `/generate` 上传单图或多视角图片
2. `POST /api/generate-smart` 创建模型记录并返回 `modelId + taskId`
3. 前端轮询 `GET /api/tripo/status/:taskId`
4. 生成完成后通过 `GET /api/models?id=<modelId>` 读取持久化结果
5. 未解锁时预览素材包并提交 `POST /api/unlock-requests`
6. 已解锁时进入完整素材包下载链路

## 快速开始

### 环境要求

- Node.js 18+
- Docker
- Supabase
- DashScope API Key
- Tripo API Key

### 安装

```bash
git clone https://github.com/your-org/easy3d.git
cd easy3d
npm install
cp .env.local.example .env.local
```

### 环境变量

```bash
# DashScope
DASHSCOPE_API_KEY=sk-xxx

# Tripo
TRIPO_API_KEY=xxx

# Qdrant
QDRANT_URL=http://localhost:6333

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3008
```

### 启动

```bash
docker-compose up -d
npm run dev
```

本地开发地址：`http://localhost:3008`

### 可选：构建知识库

```bash
npx tsx scripts/build-knowledge.ts
```

## 主要页面

- `/`：卖家素材工作台首页
- `/generate`：商品图上传与素材包生成
- `/dashboard`：批量上新工作台（默认入口）
- `/dashboard/batches/:id`：批次详情、失败重试、批量下载

## 主要接口

- `POST /api/generate-smart`：创建生成任务并落库 `modelId`
- `GET /api/tripo/status/:taskId`：同步 Tripo 状态并物化素材包快照
- `GET /api/models`：读取素材任务与解锁状态
- `GET /api/unlock-requests`：查询解锁请求状态
- `POST /api/unlock-requests`：创建解锁请求
- `POST /api/batches`：创建批次与子任务
- `GET /api/batches`：查询批次列表
- `GET /api/batches/:id`：查询批次详情与子任务
- `POST /api/batches/:id/process`：推进队列处理
- `POST /api/batches/:id/items/:itemId/retry`：重试失败子任务
- `GET /api/batches/:id/download`：批量导出完成项

## 技术说明

当前 MVP 的主叙事是卖家素材包工作流，底层实现主要由这些能力支撑：

- Tripo：底层 3D 生成链路
- Supabase：模型记录、解锁请求、存储
- Next.js + React + TypeScript：应用与界面

仓库里仍保留知识库与 Agent 相关模块，作为后续自动化工作流与策略能力的技术储备，但它们不是当前 Phase 1 的首页主叙事。

## 备注

- `Phase 2A` 不做开放模板市场、不做完整支付系统
- `鞋类` 属于下一阶段扩展，不在当前首发范围
- `衣服 / 裙子` 这类依赖垂坠与动态质感的品类，不是当前主打
