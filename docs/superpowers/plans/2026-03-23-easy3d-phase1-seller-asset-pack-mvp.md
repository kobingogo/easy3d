# easy3d Phase 1 卖家素材包 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个聚焦包袋/小皮具品类的 Phase 1 MVP，让用户完成“上传商品图 -> AI 生成 -> 查看多平台素材包预览 -> 提交解锁请求 -> 下载完整素材包”的闭环。

**Architecture:** 保留现有 `Tripo + 分析/优化` 生成链路，不与 Tripo 争抢通用 3D 平台定位；新增一层面向卖家的工作流层，把结果组织成“launch-ready asset pack”。Phase 1 不做完整支付系统、不做用户可编辑模板，只做固定包袋预设、手动解锁流程和可追踪的素材任务数据闭环。

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Supabase Storage/Postgres, Tripo API, DashScope/OpenAI SDK, Tailwind CSS, `tsx` 脚本验证、可选 `fflate` 浏览器 ZIP 打包。

---

## 范围与假设

1. 本计划只覆盖 `Phase 1`，不覆盖 Phase 2 的批量生成、可复用模板、品牌资产库。
2. 首发验证品类只有 `包袋 / 小皮具`；鞋类属于下一阶段扩展，不在本计划内。
3. `Phase 1` 只有固定预设，不做用户可保存/编辑模板。
4. `Phase 1` 的付费门槛按“预览免费，下载完整素材包需人工确认或轻量单次付费”设计；本计划默认先落地 `人工确认/手动开通`。
5. 测试方式优先沿用仓库当前风格：`scripts/*.ts` 验证脚本 + `npm run type-check` + `npm run lint` + 明确的手动验收路径。

## 文件结构映射

### 新增文件

- `lib/seller-workflow/types.ts`
  - 定义 Phase 1 工作流的核心类型：预设、分析结果、素材包、解锁请求、任务状态。
- `lib/seller-workflow/presets.ts`
  - 定义包袋/小皮具的固定 Phase 1 预设。
- `lib/seller-workflow/asset-pack.ts`
  - 根据分析结果和平台规格生成素材包清单、文案项、下载项。
- `lib/seller-workflow/model-metadata.ts`
  - 负责把生成链路的上下文映射为 `models.metadata` 中的统一结构。
- `lib/seller-workflow/unlock-request.ts`
  - 负责解锁请求的表单 schema、状态枚举和序列化。
- `lib/seller-workflow/unlock-state.ts`
  - 提供共享的解锁状态派生函数，供 `models` 和 `unlock-requests` 两条读路径共用。
- `lib/copy/platform-copy.ts`
  - 提供生成淘宝/小红书/抖音文案的纯服务函数，供 UI/API 与 agent tool 共用。
- `components/generate/phase1-preset-card.tsx`
  - 展示“Phase 1 固定包袋预设”的说明卡，而不是做多模板选择器。
- `components/generate/asset-pack-preview.tsx`
  - 展示素材包预览：平台卡片、文案卡片、策略摘要、下载状态。
- `components/generate/unlock-request-form.tsx`
  - 解锁请求表单组件。
- `app/api/unlock-requests/route.ts`
  - 创建并查询解锁请求。
- `app/api/models/[id]/asset-pack-assets/[platform]/route.ts`
  - 基于已持久化的 `thumbnail_url`/渲染图生成平台尺寸导出，并提供稳定下载地址。
- `scripts/test-phase1-presets.ts`
  - 校验 Phase 1 固定预设和品类边界。
- `scripts/test-phase1-asset-pack.ts`
  - 校验素材包生成、平台规格和文案包结构。
- `scripts/test-phase1-metadata.ts`
  - 校验 `models.metadata` 的结构和状态迁移。
- `scripts/test-phase1-unlock-request.ts`
  - 校验解锁请求 payload 和 API 请求结构。
- `supabase/phase1-seller-workflow.sql`
  - 新增 `unlock_requests` 表，并补充 `models.metadata` 的 Phase 1 约定说明。
- `docs/phase1-manual-ops.md`
  - 记录人工确认/手动开通的运营流程。

### 修改文件

- `package.json`
  - 如需要浏览器 ZIP 打包，新增 `fflate` 依赖和对应验证命令。
- `app/page.tsx`
  - 调整首页能力文案，改成“素材包工作流”视角。
- `components/landing/hero-section.tsx`
  - 改 Hero 主标题、副标题、CTA 和价值点。
- `app/generate/page.tsx`
  - 重构为 Phase 1 工作流页面：固定预设、包袋导向描述、素材包预览、解锁按钮。
- `app/dashboard/page.tsx`
  - 从“我的模型”改成“我的素材任务”。
- `app/api/generate-smart/route.ts`
  - 创建模型记录并写入 Phase 1 metadata。
- `app/api/tripo/status/[taskId]/route.ts`
  - 在 Tripo 任务成功/失败时更新模型记录状态。
- `app/api/models/route.ts`
  - 扩展为返回 Phase 1 任务字段，并为 dashboard 提供可用数据。
- `lib/export/platform-adapter.ts`
  - 拆出可复用的平台规格定义，避免 seller-workflow 层重复写平台尺寸。
- `lib/agent/tools/generate-copy.ts`
  - 复用 `lib/copy/platform-copy.ts`，避免两套文案逻辑漂移。
- `lib/supabase/types.ts`
  - 补充 `unlock_requests` 表和 `models.metadata` 的类型描述。
- `README.md`
  - 更新产品定位和当前 MVP 能力。

## 实施顺序

优先顺序必须严格遵守：

1. 先定义 Phase 1 领域模型和固定预设
2. 再定义素材包和 metadata 结构
3. 再接 API 和 Supabase 数据闭环
4. 再改生成页和首页
5. 最后做 dashboard、人工解锁流、文档和验收

---

### Task 1: 固定预设与 Phase 1 领域模型

**Files:**
- Create: `lib/seller-workflow/types.ts`
- Create: `lib/seller-workflow/presets.ts`
- Test: `scripts/test-phase1-presets.ts`

- [ ] **Step 1: 写失败的预设验证脚本**

```ts
import { getPhase1Preset, isPhase1CategorySupported } from '../lib/seller-workflow/presets'

const preset = getPhase1Preset('bags')
if (preset.key !== 'bag-studio-phase1') throw new Error('unexpected preset key')
if (!isPhase1CategorySupported('bags')) throw new Error('bags should be supported')
if (isPhase1CategorySupported('shoes')) throw new Error('shoes should not be supported in phase 1')
```

- [ ] **Step 2: 运行脚本确认失败**

Run: `npx tsx scripts/test-phase1-presets.ts`  
Expected: FAIL，提示 `Cannot find module '../lib/seller-workflow/presets'` 或缺少导出。

- [ ] **Step 3: 定义 Phase 1 类型**

在 `lib/seller-workflow/types.ts` 中定义最小可用类型：

```ts
export type Phase1Category = 'bags'
export type UnlockStatus = 'preview_only' | 'requested' | 'approved' | 'rejected' | 'unlocked'

export interface Phase1Preset {
  key: 'bag-studio-phase1'
  category: Phase1Category
  label: string
  description: string
  copyTone: 'premium' | 'friendly'
  targetPlatforms: Array<'taobao' | 'xiaohongshu' | 'douyin'>
}
```

说明：

1. `bags` 在本计划里明确表示“包袋 / 小皮具”这一整个首发验证范围
2. 不要在实现中把它偷偷扩成鞋类或其他结构化商品

- [ ] **Step 4: 实现固定预设**

在 `lib/seller-workflow/presets.ts` 中只实现一个包袋预设：

```ts
export const PHASE1_BAG_PRESET = {
  key: 'bag-studio-phase1',
  category: 'bags',
  label: '包袋高级感素材包',
  description: '白底电商主图 + 小红书封面 + 抖音竖图 + 平台文案',
  copyTone: 'premium',
  targetPlatforms: ['taobao', 'xiaohongshu', 'douyin'],
} satisfies Phase1Preset
```

- [ ] **Step 5: 提供只读查询函数**

实现：

```ts
export function getPhase1Preset(category: Phase1Category): Phase1Preset
export function isPhase1CategorySupported(category: string): category is Phase1Category
```

- [ ] **Step 6: 再跑脚本确认通过**

Run: `npx tsx scripts/test-phase1-presets.ts`  
Expected: PASS，并输出 `phase1 presets ok`。

- [ ] **Step 7: 跑类型检查**

Run: `npm run type-check`  
Expected: PASS，无 TypeScript 错误。

- [ ] **Step 8: Commit**

```bash
git add lib/seller-workflow/types.ts lib/seller-workflow/presets.ts scripts/test-phase1-presets.ts
git commit -m "feat: define phase1 seller workflow presets"
```

### Task 2: 素材包与平台文案核心服务

**Files:**
- Create: `lib/copy/platform-copy.ts`
- Create: `lib/seller-workflow/asset-pack.ts`
- Modify: `lib/agent/tools/generate-copy.ts`
- Modify: `lib/export/platform-adapter.ts`
- Test: `scripts/test-phase1-asset-pack.ts`

- [ ] **Step 1: 写失败的素材包验证脚本**

```ts
import { buildPhase1AssetPack } from '../lib/seller-workflow/asset-pack'

const pack = await buildPhase1AssetPack({
  category: 'bags',
  presetKey: 'bag-studio-phase1',
  titleSeed: '棕色皮质女包',
  thumbnailUrl: 'https://example.com/bag.jpg',
  modelDownloadUrl: 'https://example.com/model.glb',
})

if (pack.platformAssets.length !== 3) throw new Error('expected 3 platform assets')
if (!pack.copy.xiaohongshu.title) throw new Error('missing xiaohongshu title')
if (!pack.modelDownloadUrl) throw new Error('missing original model download url')
if (!pack.platformAssets[0].filename) throw new Error('missing platform asset filename')
if (!pack.platformAssets[0].downloadUrl) throw new Error('missing platform asset download url')
if (pack.manifest.filename !== 'asset-pack-manifest.json') throw new Error('missing asset-pack manifest')
```

- [ ] **Step 2: 运行脚本确认失败**

Run: `npx tsx scripts/test-phase1-asset-pack.ts`  
Expected: FAIL，提示缺少 `buildPhase1AssetPack` 或返回结构不完整。

- [ ] **Step 3: 把平台文案逻辑提纯**

在 `lib/copy/platform-copy.ts` 实现：

```ts
export async function generatePlatformCopy(input: {
  productDescription: string
  platform: 'xiaohongshu' | 'taobao' | 'douyin'
  style?: 'casual' | 'professional' | 'trendy'
  productAnalysis?: { category?: string; subcategory?: string; keywords?: string[]; style?: string[] }
}): Promise<{ title: string; content: string; tags: string[] }>
```

- [ ] **Step 4: 让 agent tool 复用纯服务**

修改 `lib/agent/tools/generate-copy.ts`，让 tool handler 调用 `generatePlatformCopy`，避免 UI/API 与 agent 各写一套文案逻辑。

- [ ] **Step 5: 抽离素材包构建逻辑**

在 `lib/seller-workflow/asset-pack.ts` 中实现：

```ts
export interface AssetPackManifest {
  filename: 'asset-pack-manifest.json'
  model: { downloadUrl: string; filename: 'model.glb' }
  assets: Array<{
    platform: 'taobao' | 'xiaohongshu' | 'douyin'
    filename: string
    previewUrl: string
    downloadUrl: string
    mimeType: 'image/jpeg' | 'image/png'
    width: number
    height: number
  }>
  copyFiles: Array<{ filename: string; content: string; mimeType: 'text/plain' | 'text/markdown' | 'application/json' }>
  strategyFile: { filename: 'strategy-summary.json'; content: string; mimeType: 'application/json' }
}

export interface Phase1AssetPack {
  presetKey: 'bag-studio-phase1'
  modelDownloadUrl: string
  manifest: AssetPackManifest
  snapshot: {
    version: 1
    copy: {
      taobao: { title: string; bullets: string[] }
      xiaohongshu: { title: string; content: string; tags: string[] }
      douyin: { hook: string; script: string; tags: string[] }
    }
    strategy: {
      recommendedPlatform: 'taobao' | 'xiaohongshu' | 'douyin'
      heroAngle: string
      styleDirection: string
      featureFocus: string[]
      materialFocus: string[]
      marketingHook: string
      reasoningSummary: string
    }
    manifest: AssetPackManifest
  }
  strategy: {
    recommendedPlatform: 'taobao' | 'xiaohongshu' | 'douyin'
    heroAngle: string
    styleDirection: string
    featureFocus: string[]
    materialFocus: string[]
    marketingHook: string
    reasoningSummary: string
  }
  platformAssets: Array<{
    platform: 'taobao' | 'xiaohongshu' | 'douyin'
    width: number
    height: number
    label: string
    filename: string
    previewUrl: string
    downloadUrl: string
    mimeType: 'image/jpeg' | 'image/png'
  }>
  copy: {
    taobao: { title: string; bullets: string[] }
    xiaohongshu: { title: string; content: string; tags: string[] }
    douyin: { hook: string; script: string; tags: string[] }
  }
}
```

要求：

1. `AssetPackManifest` 是素材包唯一 authoritative 下载合同
2. 结果页预览读取它
3. ZIP 打包读取它
4. 人工运营交付也读取它
5. `AssetPackManifest` 必须由统一 builder 从“已持久化的模型字段 + 已物化的 copy/strategy 数据”派生
6. `buildPhase1AssetPack` 本身必须是纯投影函数，不能在预览、下载或运营读取时再次触发新的 LLM/RAG 生成
7. `models.metadata.assetPackSnapshot` 的最小形状必须明确包含 `copy`、`strategy`、`manifest`
8. 平台图片导出必须明确以 Tripo 返回的 `thumbnail_url`/rendered image 为唯一源图，再通过平台适配器生成三种尺寸
9. `manifest.assets[].downloadUrl` 必须指向稳定的服务端导出路由，例如 `/api/models/:id/asset-pack-assets/:platform`
10. 物化函数必须接收 `modelId`，用于生成稳定的 per-model 下载地址

- [ ] **Step 6: 让平台规格只保留一份事实源**

把 `lib/export/platform-adapter.ts` 调整为复用统一的平台规格配置，不再在 seller workflow 层重复写 `800x800 / 1242x1660 / 1080x1920`。

- [ ] **Step 7: 物化一次素材包快照**

在 `lib/seller-workflow/asset-pack.ts` 中增加一个服务端物化函数，成功生成后只执行一次：

```ts
export async function materializePhase1AssetPackSnapshot(input: {
  modelId: string
  category: 'bags'
  presetKey: 'bag-studio-phase1'
  productDescription: string
  analysisSummary: { subcategory?: string; materials?: string[]; keyFeatures?: string[] }
  sourceImageUrl: string
  modelDownloadUrl: string
}): Promise<{
  copy: Phase1AssetPack['copy']
  strategy: Phase1AssetPack['strategy']
  manifest: AssetPackManifest
}>
```

要求：

1. 至少结合已有分析结果
2. 优先复用现有 RAG/知识检索能力，而不是写死文案
3. `modelId` 是必填输入，用于生成稳定的 `/api/models/:id/asset-pack-assets/:platform` 下载地址
4. `sourceImageUrl` 是必填输入，且只能使用已持久化的 `thumbnail_url`/rendered image，禁止在路由层临时猜测源图
5. 只允许在服务端成功回调阶段物化一次
6. 结果必须写回 `models.metadata.assetPackSnapshot`
7. 之后所有预览、ZIP 下载、运营交付都只能读取已持久化的 `assetPackSnapshot`

- [ ] **Step 8: 再跑素材包脚本确认通过**

Run: `npx tsx scripts/test-phase1-asset-pack.ts`  
Expected: PASS，并输出平台资产数量、manifest 文件名、文案字段完整性、策略摘要。

- [ ] **Step 9: 跑类型检查**

Run: `npm run type-check`  
Expected: PASS。

- [ ] **Step 10: Commit**

```bash
git add lib/copy/platform-copy.ts lib/seller-workflow/asset-pack.ts lib/agent/tools/generate-copy.ts lib/export/platform-adapter.ts scripts/test-phase1-asset-pack.ts
git commit -m "feat: add phase1 asset pack and copy services"
```

### Task 3: 模型 metadata 与解锁请求数据契约

**Files:**
- Create: `lib/seller-workflow/model-metadata.ts`
- Create: `lib/seller-workflow/unlock-request.ts`
- Create: `lib/seller-workflow/unlock-state.ts`
- Create: `supabase/phase1-seller-workflow.sql`
- Modify: `lib/supabase/types.ts`
- Test: `scripts/test-phase1-metadata.ts`
- Test: `scripts/test-phase1-unlock-request.ts`

- [ ] **Step 1: 写失败的 metadata 验证脚本**

```ts
import { buildPhase1ModelMetadata } from '../lib/seller-workflow/model-metadata'

const metadata = buildPhase1ModelMetadata({
  presetKey: 'bag-studio-phase1',
  category: 'bags',
  uploadMode: 'single',
})

if (metadata.workflowType !== 'seller_asset_pack_phase1') throw new Error('wrong workflow type')
if (metadata.unlockStatus !== 'preview_only') throw new Error('wrong unlock status')
```

- [ ] **Step 2: 运行脚本确认失败**

Run: `npx tsx scripts/test-phase1-metadata.ts`  
Expected: FAIL，提示模块缺失或字段不完整。

- [ ] **Step 3: 实现 metadata 生成器**

在 `lib/seller-workflow/model-metadata.ts` 中统一输出：

```ts
{
  workflowType: 'seller_asset_pack_phase1',
  category: 'bags',
  presetKey: 'bag-studio-phase1',
  unlockStatus: 'preview_only',
  analysisSummary: {...},
  assetPackPreviewReady: false
}
```

- [ ] **Step 4: 实现解锁请求 schema**

在 `lib/seller-workflow/unlock-request.ts` 中定义：

```ts
export type UnlockRequestStatus = 'submitted' | 'approved' | 'rejected'
export interface UnlockRequestPayload {
  modelId: string
  contactName: string
  contactChannel: 'wechat' | 'phone' | 'xiaohongshu'
  contactValue: string
  note?: string
}
export interface UnlockRequestView {
  currentState: 'preview_only' | 'requested' | 'approved' | 'rejected' | 'unlocked'
  currentRequestId: string | null
  latestRequestStatus: UnlockRequestStatus | null
  submittedAt?: string
  rejectedAt?: string
  approvedAt?: string
  fulfilledAt?: string
}
```

约定：

1. `GET /api/unlock-requests?modelId=...` 必须返回 `UnlockRequestView`
2. 若存在 `submitted/approved` 的活跃请求，返回该活跃请求作为 authoritative current state
3. 若没有活跃请求但历史上有 `rejected`，返回最新一条 `rejected` 作为当前状态
4. `models.metadata.unlockStatus` 只是派生缓存，不是 source of truth；source of truth 始终是 `unlock_requests` 与实际交付结果
5. 统一状态转换表如下：

| 事件 | unlock_requests.status | GET currentState | models.metadata.unlockStatus |
|------|------------------------|------------------|-------------------------------|
| 初始未提交 | 无 | `preview_only` | `preview_only` |
| 用户提交请求 | `submitted` | `requested` | `requested` |
| 运营审核通过但尚未交付 | `approved` | `approved` | `approved` |
| 运营完成交付/开通下载 | `approved` + delivery done | `unlocked` | `unlocked` |
| 运营拒绝请求 | `rejected` | `rejected` | `rejected` |
| 用户在拒绝后重提 | 新 `submitted` 行 | `requested` | `requested` |

- [ ] **Step 5: 写 Supabase SQL**

在 `supabase/phase1-seller-workflow.sql` 中新增 `unlock_requests` 表：

```sql
CREATE TABLE IF NOT EXISTS public.unlock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'submitted',
  contact_name TEXT NOT NULL,
  contact_channel TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  note TEXT,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unlock_requests_active_model_id
ON public.unlock_requests(model_id)
WHERE status IN ('submitted', 'approved');
```

- [ ] **Step 6: 扩展 Supabase TS 类型**

修改 `lib/supabase/types.ts`，为 `unlock_requests` 补全 Row/Insert/Update 类型，并把 `models.metadata` 的注释改成 Phase 1 可读结构。

- [ ] **Step 7: 抽共享解锁状态 helper**

在 `lib/seller-workflow/unlock-state.ts` 中实现共享函数：

```ts
export function deriveUnlockView(input: {
  activeRequest: { status: 'submitted' | 'approved'; fulfilledAt?: string | null } | null
  latestRejectedRequest: { status: 'rejected'; createdAt: string } | null
  metadataUnlockStatus?: UnlockStatus | null
}): UnlockRequestView
```

要求：

1. `deriveUnlockView` 是 `GET /api/models` 与 `GET /api/unlock-requests` 的唯一状态派生入口
2. `models.metadata.unlockStatus` 只作为写回缓存，不允许单独决定 UI
3. `approved + fulfilled_at` 必须稳定映射为 `unlocked`

- [ ] **Step 8: 跑两个脚本确认通过**

Run: `npx tsx scripts/test-phase1-metadata.ts`  
Expected: PASS。

Run: `npx tsx scripts/test-phase1-unlock-request.ts`  
Expected: PASS，并校验 payload 序列化成功、重复提交冲突映射为 `409`、`rejected` 状态允许重新发起请求、`fulfilled_at` 能正确驱动 `approved -> unlocked`。

- [ ] **Step 9: Commit**

```bash
git add lib/seller-workflow/model-metadata.ts lib/seller-workflow/unlock-request.ts lib/seller-workflow/unlock-state.ts lib/supabase/types.ts supabase/phase1-seller-workflow.sql scripts/test-phase1-metadata.ts scripts/test-phase1-unlock-request.ts
git commit -m "feat: define phase1 model metadata and unlock request schema"
```

### Task 4: 生成链路持久化与解锁请求 API

**Files:**
- Modify: `app/api/generate-smart/route.ts`
- Modify: `app/api/tripo/status/[taskId]/route.ts`
- Modify: `app/api/models/route.ts`
- Create: `app/api/unlock-requests/route.ts`
- Test: `scripts/test-phase1-api.ts`

- [ ] **Step 1: 写失败的 API 验证脚本**

脚本至少验证这 3 个接口契约：

1. `POST /api/generate-smart` 返回 `modelId`
2. `GET /api/models?id=<modelId>` 返回 Phase 1 metadata
3. `POST /api/unlock-requests` 成功创建请求
4. 并发/重复提交时返回 `409` 而不是 `500`

- [ ] **Step 2: 运行脚本确认失败**

Run: `npx tsx scripts/test-phase1-api.ts`  
Expected: FAIL，至少缺失 `modelId` 或找不到 `unlock-requests` 路由。

- [ ] **Step 3: 在生成开始时创建模型记录**

修改 `app/api/generate-smart/route.ts`：

1. 调用 Tripo 前创建 `models` 记录
2. 初始状态设为 `pending`
3. `metadata` 写入 `buildPhase1ModelMetadata(...)`
4. `createTask(...)` 成功后必须把 `trip_task_id` 立刻写回同一条 `models` 记录
5. 返回 `modelId`
6. 若 Tripo 创建任务失败，必须显式执行以下二选一之一：
   - 回滚刚创建的 `models` 记录
   - 或把该记录标记为 `failed` 且 `metadata.errorStage='task_creation'`

推荐：保留记录但标为 `failed`，这样 dashboard 不会出现幽灵任务，也能保留失败样本供排查。

- [ ] **Step 4: 在轮询状态路由中同步模型状态**

修改 `app/api/tripo/status/[taskId]/route.ts`：

1. 根据 `trip_task_id` 查找模型
2. 当 Tripo 成功时写入 `model_3d_url`、`thumbnail_url`、`status=completed`
3. 物化前必须先抢“单写者锁”，例如通过 `metadata.assetPackSnapshotStatus='materializing'` 的原子 compare-and-set 更新实现
4. 只有抢锁成功的请求才允许调用 `materializePhase1AssetPackSnapshot({ modelId, ... })`
5. 若抢锁失败，说明其他并发请求正在或已经完成物化；当前请求必须只读取现有快照或等待下一次轮询，禁止重复 LLM/RAG 物化
6. 首次成功物化后，把 `version/copy/strategy/manifest` 一次性写入 `models.metadata.assetPackSnapshot`，并清除 `assetPackSnapshotStatus`
7. 当 Tripo 失败时写入 `status=failed`
8. 在响应中带回 `modelId`

- [ ] **Step 5: 扩展模型列表接口**

修改 `app/api/models/route.ts`：

1. 列表和详情都带出 `metadata`
2. 通过 `deriveUnlockView(...)` 返回统一 `unlockStatus/currentState`
3. 返回已物化的 copy/strategy 摘要，避免 dashboard 重新触发生成
4. 返回 Phase 1 所需摘要字段，减少 dashboard 二次组装

- [ ] **Step 6: 新增解锁请求 API**

在 `app/api/unlock-requests/route.ts` 中支持：

1. `POST` 创建请求
2. 防重复提交（同一 `model_id` 若已有 `submitted/approved`，则返回 409）
3. `GET` 按 `modelId` 查询当前请求状态，并返回统一的 `UnlockRequestView`
4. 实现时不能只依赖应用层判断，必须配合数据库唯一约束或安全 upsert，确保重试和并发提交不会产生多条有效请求
5. 必须显式捕获唯一约束冲突并稳定映射为 `409 Conflict`，不能让数据库冲突冒泡成 `500`
6. `rejected` 状态下允许用户再次提交，因此唯一约束必须只限制活跃请求，而不是永久锁死 `model_id`
7. `GET` 的 authoritative 规则必须与 SQL 约束一致：优先返回活跃请求；若无活跃请求，则回退到最新的 `rejected` 历史请求
8. 若最新活跃请求为 `approved` 且 `fulfilled_at IS NULL`，则 `GET currentState='approved'`
9. 只有在最新活跃请求为 `approved` 且 `fulfilled_at IS NOT NULL` 时，`GET currentState='unlocked'`
10. `GET /api/unlock-requests` 与 `GET /api/models` 都必须调用 `deriveUnlockView(...)`，禁止各自实现一套状态判断

- [ ] **Step 7: 运行 SQL 并验证 API 脚本**

先在 Supabase Dashboard 执行：`supabase/phase1-seller-workflow.sql`

再运行：`npx tsx scripts/test-phase1-api.ts`  
Expected: PASS，打印 `modelId`、`unlock request created`。

- [ ] **Step 8: 跑静态检查**

Run: `npm run type-check`  
Expected: PASS。

Run: `npm run lint`  
Expected: PASS；若 `next lint` 与 Next 15 CLI 行为不一致，记录实际输出并修复可控问题。

- [ ] **Step 9: Commit**

```bash
git add app/api/generate-smart/route.ts 'app/api/tripo/status/[taskId]/route.ts' app/api/models/route.ts app/api/unlock-requests/route.ts scripts/test-phase1-api.ts
git commit -m "feat: persist phase1 generation workflow and unlock requests"
```

### Task 5: 生成页重构为卖家素材包工作流

**Files:**
- Create: `components/generate/phase1-preset-card.tsx`
- Create: `components/generate/asset-pack-preview.tsx`
- Create: `components/generate/unlock-request-form.tsx`
- Modify: `app/generate/page.tsx`
- Modify: `components/upload/UploadZone.tsx`
- Modify: `components/upload/MultiViewUploadZone.tsx`

- [ ] **Step 1: 先写 UI 行为清单**

把 `app/generate/page.tsx` 需要满足的行为写在任务注释顶部：

1. 明确写出当前只支持包袋/小皮具
2. 展示固定预设说明，而不是模板市场
3. 生成成功后直接展示素材包预览，不只显示 `GLB 下载`
4. 若未解锁，只允许预览和提交请求
5. 若已解锁，显示“下载完整素材包”

- [ ] **Step 2: 抽固定预设卡组件**

`components/generate/phase1-preset-card.tsx` 显示：

```ts
{
  label: '包袋高级感素材包',
  category: '包袋 / 小皮具',
  outputs: ['淘宝主图', '小红书封面', '抖音竖图', '平台文案'],
}
```

- [ ] **Step 3: 抽素材包预览组件**

`components/generate/asset-pack-preview.tsx` 至少展示：

1. 三个平台输出卡片
2. 文案卡片
3. 策略摘要
4. 当前解锁状态
5. 下载或解锁 CTA

- [ ] **Step 4: 抽解锁请求表单**

`components/generate/unlock-request-form.tsx` 提供：

1. 联系方式
2. 渠道类型
3. 备注
4. 成功/失败反馈

- [ ] **Step 5: 重构生成页主流程**

修改 `app/generate/page.tsx`：

1. 生成时把 `modelId` 存进状态
2. 成功后只读取已持久化的 `models.metadata.assetPackSnapshot`，禁止在页面重新触发 copy/strategy 生成
3. 替换“只下载 GLB”逻辑为“素材包预览 + 按状态下载”
4. 多视角仍保留，但文案上强调“包袋更推荐多视角”

- [ ] **Step 6: 微调上传组件文案**

修改上传组件，让文案不再是泛化“任意商品图”，而是明确：

1. 当前适合包袋/小皮具
2. 推荐拍法
3. 多视角的价值

- [ ] **Step 7: 本地手动验收**

Run: `npm run dev`  
Expected: Next dev server running on `http://localhost:3008`

手动检查：

1. 首页 CTA 跳到生成页
2. 生成页明确 Phase 1 范围
3. 生成成功后有素材包预览
4. 未解锁状态看不到完整下载按钮

- [ ] **Step 8: 跑静态检查**

Run: `npm run type-check`  
Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add app/generate/page.tsx components/generate/phase1-preset-card.tsx components/generate/asset-pack-preview.tsx components/generate/unlock-request-form.tsx components/upload/UploadZone.tsx components/upload/MultiViewUploadZone.tsx
git commit -m "feat: turn generate page into phase1 seller workflow"
```

### Task 6: 首页与 Dashboard 重定位

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/landing/hero-section.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `README.md`

- [ ] **Step 1: 先改首页 Hero 叙事**

把 Hero 从“AI 3D 生成平台”改成“卖家素材包工作台”，文案重点：

1. 包袋/小皮具优先
2. 多平台素材包
3. 重复上新效率
4. 预览免费，解锁下载

- [ ] **Step 2: 调整首页能力卡**

`app/page.tsx` 不再突出“能力展示”，改成：

1. 上传商品图
2. 生成素材包
3. 一键适配平台
4. 解锁完整包

- [ ] **Step 3: 改 Dashboard 定位**

`app/dashboard/page.tsx` 从“我的模型”改为“我的素材任务”：

1. 列出模型状态
2. 显示包袋预设
3. 显示解锁请求状态
4. 提供重新进入结果页的入口

- [ ] **Step 4: 更新 README**

README 至少同步：

1. 产品定位
2. Phase 1 支持范围
3. 当前工作流
4. 端口和启动说明（修正 `3008` 与旧文档漂移）

- [ ] **Step 5: 手动验收首页和 dashboard**

Run: `npm run dev`  
Expected: 手动访问首页和 `/dashboard` 页面，无明显旧定位残留。

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/landing/hero-section.tsx app/dashboard/page.tsx README.md
git commit -m "feat: reposition easy3d for seller asset workflow"
```

### Task 7: 下载、运营手册与最终验收

**Files:**
- Modify: `package.json`
- Create: `docs/phase1-manual-ops.md`
- Create: `scripts/test-phase1-e2e-checklist.ts`

- [ ] **Step 1: 决定完整素材包下载形式**

Phase 1 只支持一种完整交付形式：

1. 浏览器端 `Download Asset Pack ZIP` 按钮
2. 新增 `fflate`
3. ZIP 是唯一最终交付物；解锁后不再额外暴露“单独下载链接列表”作为主交付入口
4. ZIP 文件内容必须固定为以下 8 项，不允许“至少包含”这种模糊描述：
   - `assets/taobao-main.jpg`
   - `assets/xiaohongshu-cover.jpg`
   - `assets/douyin-vertical.jpg`
   - `copy/taobao-listing.md`
   - `copy/xiaohongshu-post.md`
   - `copy/douyin-script.md`
   - `strategy/strategy-summary.json`
   - `manifest/asset-pack-manifest.json`
5. `model/model.glb` 必须作为第 9 个文件实际打进 ZIP，而不是只放外链；若运行时拿不到 GLB 二进制，则本次 ZIP 视为生成失败并返回明确错误
6. `asset-pack-manifest.json` 中的 `model.downloadUrl` 与 `assets[].downloadUrl` 仍然保留，用于服务端稳定路由和运营复核，但不替代 ZIP 内实际文件
7. ZIP 内文件顺序必须固定，与 manifest 中的列举顺序保持一致，避免前后端或运营侧出现“同内容不同包”的歧义

- [ ] **Step 2: 写失败的最终验收脚本**

脚本只校验关键信息，不做真正浏览器自动化：

1. 首页定位文本
2. `generate-smart` 返回 `modelId`
3. `unlock-requests` 路由存在
4. dashboard 列表能拿到 Phase 1 metadata

- [ ] **Step 3: 如需 ZIP，补依赖与下载工具**

Modify: `package.json`

```json
{
  "dependencies": {
    "fflate": "^0.8.2"
  }
}
```

- [ ] **Step 4: 写运营手册**

`docs/phase1-manual-ops.md` 记录：

1. 用户提交解锁请求后的处理步骤
2. 在 Supabase 中如何把请求设为 `approved`
3. 在交付完成后如何写入 `unlock_requests.fulfilled_at`
4. 如何让共享 `deriveUnlockView(...)` 逻辑把缓存状态同步到 `models.metadata.unlockStatus`
5. 如何联系用户交付

- [ ] **Step 5: 跑最终验收命令**

Run: `npx tsx scripts/test-phase1-e2e-checklist.ts`  
Expected: PASS。

Run: `npm run type-check`  
Expected: PASS。

Run: `npm run lint`  
Expected: PASS 或记录可接受的已知 CLI 差异。

- [ ] **Step 6: 手动全链路验收**

在浏览器完成一次真实流程：

1. 首页进入生成页
2. 上传包袋图片
3. 生成成功
4. 看到素材包预览
5. 提交解锁请求
6. dashboard 能看到任务和状态

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json docs/phase1-manual-ops.md scripts/test-phase1-e2e-checklist.ts
git commit -m "feat: finish phase1 asset pack delivery and ops docs"
```

## 后续计划拆分建议

本计划完成后，不要在同一执行会话里直接顺手做 Phase 2。下一阶段应拆成独立计划：

1. `Phase 2A: 批量上新工作台`
   - 批量上传
   - 队列与任务状态
   - 批量导出

2. `Phase 2B: 可复用模板与品牌一致性`
   - 用户可保存模板
   - 品牌预设
   - 复用规则

3. `Phase 3: 内容工作流增强`
   - 小红书/抖音封面和脚本增强
   - 标签与角度建议
   - 轻量发布准备页

4. `Phase 4: Agent/RAG 护城河增强`
   - 展示策略建议
   - 自动化工作流
   - Blender 后处理

## 执行提示

1. 不要在 Phase 1 引入真正的模板市场、订阅系统或复杂支付。
2. 不要让“GLB 下载”重新成为主结果；主结果必须是“素材包”。
3. 不要同时支持多个首发品类。
4. 如果某一步会迫使你引入大型新基础设施，先停下来确认它是否真的属于 Phase 1。
