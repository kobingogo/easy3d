# easy3d 架构设计文档 v1.0

**文档状态**: 草稿  
**创建时间**: 2026-03-12  
**负责人**: Bingo  
**版本**: 1.0 (MVP)

---

## 一、技术栈选型

### 1.1 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| **框架** | Next.js 14 | SSR + 静态生成 |
| **语言** | TypeScript 5 | 类型安全 |
| **3D 引擎** | Three.js r160+ | Web 3D 渲染 |
| **React 集成** | @react-three/fiber | React + Three.js |
| **UI 组件** | shadcn/ui | 轻量可定制 |
| **样式** | Tailwind CSS 3 | 原子化 CSS |
| **状态管理** | Zustand | 轻量状态 |
| **部署** | Vercel | 全球 CDN |

### 1.2 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| **框架** | Next.js API Routes | 无服务端运维 |
| **数据库** | Supabase (PostgreSQL) | 免费额度充足 |
| **认证** | NextAuth.js | 微信扫码集成 |
| **存储** | Supabase Storage | 用户文件存储 |
| **缓存** | Vercel KV (Redis) | 限流/会话 |

### 1.3 第三方服务
| 服务 | 用途 | 成本 |
|------|------|------|
| **Tripo AI API** | 3D 模型生成 | $20/月 (专业版) |
| **硅基流动** | AI 对话/辅助 | 免费额度 |
| **微信开放平台** | 扫码登录 | 免费 |
| **Vercel Analytics** | 数据分析 | 免费 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  桌面端  │  │  移动端  │  │  小程序  │ (v2.0)           │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel CDN/Edge                        │
│                   (静态资源 + API 路由)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Next.js 应用层                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Pages/     │  │  API/       │  │  Components/│         │
│  │  (SSR/SSG)  │  │  (Routes)   │  │  (3D/UI)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Supabase       │ │   Tripo AI API   │ │   Vercel KV      │
│   (DB + Storage) │ │   (3D 生成)       │ │   (缓存/限流)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 2.2 数据流架构

```
用户上传图片
     │
     ▼
┌─────────────────┐
│ 前端压缩/校验   │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Supabase Storage│ ← 存储原图
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ API: /api/generate│
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Tripo AI API    │ ← 调用 3D 生成
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Supabase Storage│ ← 存储 3D 模型
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Supabase DB     │ ← 记录元数据
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ 前端 Three.js   │ ← 加载预览
│ 播放器渲染      │
└─────────────────┘
```

---

## 三、模块设计

### 3.1 前端模块

#### 3.1.1 页面结构
```
src/
├── app/
│   ├── page.tsx              # 首页 (Landing)
│   ├── login/                # 登录页
│   ├── dashboard/            # 用户后台
│   │   ├── page.tsx          # 模型列表
│   │   └── [id]/page.tsx     # 模型详情/编辑
│   ├── generate/             # 生成页面
│   └── api/                  # API 路由
├── components/
│   ├── ui/                   # 基础 UI 组件
│   ├── 3d/                   # 3D 相关组件
│   │   ├── ModelViewer.tsx   # 3D 播放器
│   │   ├── ModelControls.tsx # 控制栏
│   │   └── LightSettings.tsx # 光照设置
│   └── upload/               # 上传组件
└── lib/
    ├── supabase.ts           # Supabase 客户端
    ├── tripo.ts              # Tripo API 封装
    └── utils.ts              # 工具函数
```

#### 3.1.2 核心组件

**ModelViewer.tsx** (3D 播放器)
```typescript
interface ModelViewerProps {
  modelUrl: string;
  autoRotate?: boolean;
  showControls?: boolean;
  onExport?: (format: 'glb' | 'gif' | 'mp4') => void;
}

// 功能:
// - GLB 模型加载
// - 轨道控制 (旋转/缩放/平移)
// - 环境光/方向光配置
// - 导出触发
```

**UploadZone.tsx** (上传组件)
```typescript
interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // MB
  acceptedTypes?: string[];
}

// 功能:
// - 拖拽上传
// - 进度显示
// - 格式校验
// - 压缩处理
```

### 3.2 后端模块

#### 3.2.1 API 路由设计

| 路由 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/auth/wechat` | POST | 微信扫码登录 | 否 |
| `/api/upload` | POST | 上传图片 | 是 |
| `/api/generate` | POST | 触发 3D 生成 | 是 |
| `/api/models` | GET | 获取模型列表 | 是 |
| `/api/models/[id]` | GET | 获取模型详情 | 是 |
| `/api/models/[id]` | DELETE | 删除模型 | 是 |
| `/api/export` | POST | 导出模型 | 是 |
| `/api/usage` | GET | 获取使用额度 | 是 |

#### 3.2.2 核心 API 实现

**`/api/generate`** (3D 生成)
```typescript
// 请求
POST /api/generate
{
  "imageId": "supabase_file_id",
  "quality": "standard" | "hd"
}

// 响应
{
  "taskId": "xxx",
  "status": "processing",
  "estimatedTime": 45 // 秒
}

// 流程:
// 1. 验证用户额度
// 2. 从 Storage 获取图片
// 3. 调用 Tripo API
// 4. 轮询生成状态
// 5. 存储结果到 DB
```

### 3.3 数据库设计

#### 3.3.1 Supabase 表结构

**users** (用户表)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wechat_openid VARCHAR(255) UNIQUE,
  wechat_avatar VARCHAR(512),
  wechat_nickname VARCHAR(100),
  plan_type VARCHAR(20) DEFAULT 'free', -- free, monthly, quarterly
  credits_remaining INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**models** (模型表)
```sql
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  original_image_url VARCHAR(512),
  model_3d_url VARCHAR(512),
  thumbnail_url VARCHAR(512),
  status VARCHAR(20), -- pending, processing, completed, failed
  quality VARCHAR(20), -- standard, hd
  trip_task_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_status ON models(status);
```

**usage_logs** (使用记录表)
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50), -- generate, export, download
  credits_used INT,
  model_id UUID REFERENCES models(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
```

---

## 四、关键流程

### 4.1 3D 生成流程

```
1. 用户上传图片
        │
2. 前端压缩 (≤10MB)
        │
3. 上传到 Supabase Storage
        │
4. 调用 /api/generate
        │
5. 服务端:
   - 检查用户额度
   - 调用 Tripo API
   - 返回 taskId
        │
6. 前端轮询状态 (每 5 秒)
        │
7. Tripo 完成 → 回调/轮询获取结果
        │
8. 下载 3D 模型到 Storage
        │
9. 更新 DB 状态 = completed
        │
10. 前端展示 3D 预览
```

### 4.2 限流策略

```typescript
// Vercel KV 实现
const rateLimit = async (userId: string) => {
  const key = `ratelimit:${userId}`;
  const count = await kv.incr(key);
  
  if (count === 1) {
    await kv.expire(key, 86400); // 24 小时过期
  }
  
  if (count > 10) { // 免费用户每日 10 次
    throw new Error('今日额度已用完');
  }
};
```

---

## 五、部署方案

### 5.1 环境配置

| 环境 | 用途 | 域名 |
|------|------|------|
| Development | 本地开发 | localhost:3000 |
| Preview | PR 预览 | *.vercel.app |
| Production | 线上环境 | easy3d.cn (待购买) |

### 5.2 环境变量

```bash
# Supabase
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Tripo AI
TRIPO_API_KEY=xxx

# NextAuth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://easy3d.cn

# 微信开放平台
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
```

### 5.3 CI/CD 流程

```
GitHub Push
     │
     ▼
Vercel Auto Deploy
     │
     ├──→ Preview (分支)
     │
     └──→ Production (main 分支)
              │
              ▼
         自动域名
         自动 HTTPS
```

---

## 六、成本估算

### 6.1 初期成本 (月)

| 项目 | 费用 | 备注 |
|------|------|------|
| Vercel Pro | $20 | 必要 (自定义域名 + 分析) |
| Tripo API | $20 | 专业版 (含 API) |
| Supabase | $0 | 免费额度足够 |
| Vercel KV | $0 | 免费 1 万读/天 |
| 域名 | ¥50/年 | easy3d.cn (待查) |
| **合计** | **~¥300/月** | |

### 6.2 规模化成本 (1000 用户/月)

| 项目 | 费用 | 备注 |
|------|------|------|
| Vercel Pro | $20 | 带宽升级 |
| Tripo API | $200 | 批量生成 |
| Supabase Pro | $25 | 存储升级 |
| 硅基流动 API | ¥500 | AI 辅助 |
| **合计** | **~¥2000/月** | |

---

## 七、风险与技术债

### 7.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Tripo API 不稳定 | 中 | 高 | 备用方案 (Meshy/腾讯云) |
| Three.js 性能问题 | 低 | 中 | 模型简化 + LOD |
| 微信登录审核 | 中 | 高 | 准备手机号登录备选 |
| Vercel 国内访问 | 高 | 中 | 阿里云 CDN 镜像 |

### 7.2 技术债 (MVP 阶段)

- [ ] 硬编码 Tripo API 调用 (需抽象为 Provider 接口)
- [ ] 无单元测试 (优先保证上线)
- [ ] 错误处理不完善 (逐步补充)
- [ ] 无国际化 (仅中文)

---

## 八、开发计划

### 8.1 时间线 (2 天 MVP)

**Day 1 (2026-03-12)**
- [ ] 项目初始化 (Next.js + TS + Tailwind)
- [ ] Supabase 配置 (DB + Storage)
- [ ] 上传组件开发
- [ ] Tripo API 对接

**Day 2 (2026-03-13)**
- [ ] Three.js 播放器开发
- [ ] 微信登录接入
- [ ] 用户额度系统
- [ ] 部署上线

**Day 3-7 (2026-03-14 ~ 20)**
- [ ] 小红书测试发布
- [ ] 收集反馈迭代
- [ ] 付费系统接入

### 8.2 任务分解

详见 GitHub Projects: https://github.com/xxx/easy3d/projects/1

---

## 九、附录

### 9.1 参考项目
- https://github.com/meshy-labs/meshy-api-examples
- https://github.com/tripo3d/tripo-js
- https://github.com/pmndrs/react-three-fiber

### 9.2 设计资源
- Figma: https://figma.com/file/xxx (待创建)
- shadcn/ui: https://ui.shadcn.com

### 9.3 API 文档
- Tripo API: https://docs.tripo3d.ai
- Supabase: https://supabase.com/docs
- NextAuth: https://next-auth.js.org

---

**文档变更记录**:
| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-12 | 初始版本 | 小 Q 🌀 |
