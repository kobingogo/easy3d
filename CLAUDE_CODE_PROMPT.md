# easy3d 项目 - Claude Code 开发指令

**任务类型**: 项目脚手架搭建  
**优先级**: P0 (MVP)  
**预计时间**: 2-3 小时  
**输出**: 可运行的 Next.js 项目框架

---

## 🎯 项目概述

**easy3d** 是一款面向电商卖家的 AI 3D 展示生成工具。

**Slogan**: 一张图，30 秒，生成你的 3D 商品展示

**核心功能**:
1. 用户上传图片
2. 调用 Tripo AI API 生成 3D 模型
3. Three.js 在线预览
4. 导出 GLB/GIF/MP4

**技术栈**:
- Next.js 14 (App Router)
- TypeScript 5
- Three.js + @react-three/fiber
- Tailwind CSS + shadcn/ui
- Supabase (DB + Storage + Auth)
- Vercel 部署

---

## 📁 项目结构

请创建以下目录结构：

```
easy3d/
├── app/
│   ├── layout.tsx              # 根布局 (含 Provider)
│   ├── page.tsx                # 首页 (Landing Page)
│   ├── globals.css             # 全局样式
│   ├── login/
│   │   └── page.tsx            # 登录页
│   ├── dashboard/
│   │   ├── page.tsx            # 用户后台 (模型列表)
│   │   └── [id]/
│   │       └── page.tsx        # 模型详情/编辑器
│   ├── generate/
│   │   └── page.tsx            # 3D 生成页面
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts    # NextAuth 路由
│       ├── upload/
│       │   └── route.ts        # 图片上传
│       ├── generate/
│       │   └── route.ts        # 3D 生成触发
│       ├── models/
│       │   ├── route.ts        # 获取模型列表
│       │   └── [id]/
│       │       └── route.ts    # 模型详情/删除
│       └── usage/
│           └── route.ts        # 使用额度查询
├── components/
│   ├── ui/                     # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── toast.tsx
│   ├── 3d/
│   │   ├── ModelViewer.tsx     # 3D 模型播放器
│   │   ├── ModelControls.tsx   # 控制组件 (旋转/缩放)
│   │   └── Environment.tsx     # 光照环境
│   ├── upload/
│   │   ├── UploadZone.tsx      # 拖拽上传区域
│   │   └── ImagePreview.tsx    # 图片预览
│   ├── layout/
│   │   ├── Header.tsx          # 顶部导航
│   │   └── Footer.tsx          # 页脚
│   └── providers/
│       ├── AuthProvider.tsx    # 认证上下文
│       └── ThreeProvider.tsx   # Three.js 上下文
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase 客户端
│   │   ├── server.ts           # 服务端客户端
│   │   └── types.ts            # 数据库类型
│   ├── tripo/
│   │   └── index.ts            # Tripo API 封装
│   ├── auth/
│   │   └── options.ts          # NextAuth 配置
│   ├── utils.ts                # 工具函数
│   └── constants.ts            # 常量配置
├── hooks/
│   ├── useAuth.ts              # 认证 Hook
│   ├── useModels.ts            # 模型列表 Hook
│   └── useGenerate.ts          # 生成状态 Hook
├── types/
│   ├── index.ts                # 全局类型
│   └── api.ts                  # API 响应类型
├── public/
│   ├── logo.svg
│   └── og.png
├── .env.local.example          # 环境变量示例
├── .env.local                  # 本地环境变量 (你创建)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📋 开发任务清单

### Phase 1: 项目初始化 (30 分钟)

```bash
# 1. 创建 Next.js 项目
npx create-next-app@latest easy3d --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"

# 2. 安装核心依赖
cd easy3d
npm install three @types/three @react-three/fiber @react-three/drei
npm install @supabase/supabase-js @supabase/ssr
npm install next-auth @auth/supabase-adapter
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react  # 图标

# 3. 初始化 shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog progress toast
```

**验收标准**:
- [ ] `npm run dev` 正常启动
- [ ] 访问 localhost:3000 无报错
- [ ] Tailwind CSS 正常工作

---

### Phase 2: 基础组件 (45 分钟)

#### 2.1 创建工具函数 (`lib/utils.ts`)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
```

#### 2.2 创建 Header 组件 (`components/layout/Header.tsx`)
- Logo + 导航链接
- 登录状态显示
- 用户头像下拉菜单

#### 2.3 创建 UploadZone 组件 (`components/upload/UploadZone.tsx`)
- 拖拽上传支持
- 点击上传支持
- 格式校验 (JPG/PNG/WebP)
- 大小校验 (≤10MB)

**验收标准**:
- [ ] 组件可独立渲染
- [ ] 拖拽功能正常
- [ ] 错误提示友好

---

### Phase 3: Supabase 配置 (30 分钟)

#### 3.1 创建客户端 (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 3.2 创建服务端客户端 (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中忽略
          }
        },
      },
    }
  )
}
```

#### 3.3 创建数据库类型 (`lib/supabase/types.ts`)
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wechat_openid: string
          wechat_avatar: string | null
          wechat_nickname: string | null
          plan_type: string
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wechat_openid: string
          wechat_avatar?: string | null
          wechat_nickname?: string | null
          plan_type?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      models: {
        Row: {
          id: string
          user_id: string
          original_image_url: string
          model_3d_url: string | null
          thumbnail_url: string | null
          status: string
          quality: string
          trip_task_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
```

**验收标准**:
- [ ] Supabase 客户端可正常导入
- [ ] 类型定义完整

---

### Phase 4: Tripo API 封装 (30 分钟)

#### 创建 API 封装 (`lib/tripo/index.ts`)
```typescript
const TRIPO_API_KEY = process.env.TRIPO_API_KEY!
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

export interface TripoTaskResponse {
  code: number
  msg: string
  data: {
    task_id: string
    quota_type: string
  }
}

export interface TripoTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  progress: number
  result?: {
    model_id: string
    files: Array<{
      file_type: string
      file_url: string
    }>
  }
}

export async function createTask(imageUrl: string): Promise<TripoTaskResponse> {
  const response = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'image_to_model',
      file: {
        type: 'url',
        url: imageUrl,
      },
    }),
  })
  return response.json()
}

export async function getTaskStatus(taskId: string): Promise<TripoTaskStatus> {
  const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
    },
  })
  return response.json()
}

export async function pollTaskStatus(
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<TripoTaskStatus> {
  const maxAttempts = 60
  const interval = 5000 // 5 秒

  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTaskStatus(taskId)
    
    if (onProgress) {
      onProgress(status.progress)
    }

    if (status.status === 'success' || status.status === 'failed') {
      return status
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('Task timeout')
}
```

**验收标准**:
- [ ] API 函数可正常调用
- [ ] 错误处理完善
- [ ] 轮询逻辑正确

---

### Phase 5: 核心页面 (45 分钟)

#### 5.1 首页 (`app/page.tsx`)
- Hero Section (标题 + CTA)
- 功能特性展示
- 使用流程说明
- 价格方案

#### 5.2 生成页面 (`app/generate/page.tsx`)
- UploadZone 组件
- 生成进度显示
- 3D 预览区域
- 导出按钮

#### 5.3 3D 播放器 (`components/3d/ModelViewer.tsx`)
```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'

interface ModelViewerProps {
  modelUrl: string
  autoRotate?: boolean
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export function ModelViewer({ modelUrl, autoRotate = true }: ModelViewerProps) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model url={modelUrl} />
      <OrbitControls autoRotate={autoRotate} makeDefault />
    </Canvas>
  )
}
```

**验收标准**:
- [ ] 页面路由正常
- [ ] 3D 模型可加载显示
- [ ] 交互控制正常

---

### Phase 6: API 路由 (30 分钟)

#### 6.1 上传 API (`app/api/upload/route.ts`)
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from('original-images')
    .upload(`${Date.now()}-${file.name}`, file)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('original-images')
    .getPublicUrl(data.path)

  return NextResponse.json({ 
    id: data.path,
    url: publicUrl 
  })
}
```

#### 6.2 生成 API (`app/api/generate/route.ts`)
- 调用 Tripo API
- 创建数据库记录
- 返回任务 ID

**验收标准**:
- [ ] API 可正常调用
- [ ] 错误处理完善
- [ ] 响应格式正确

---

### Phase 7: 环境变量与配置 (15 分钟)

#### 创建 `.env.local.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Tripo AI
TRIPO_API_KEY=your_tripo_api_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 微信开放平台 (可选，v1.1)
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
```

#### 创建 `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## ✅ 最终验收清单

### 功能验收
- [ ] `npm run dev` 正常启动
- [ ] 首页可访问且样式正常
- [ ] 图片上传功能可用
- [ ] 3D 模型可预览
- [ ] API 路由可调用

### 代码质量
- [ ] TypeScript 无类型错误
- [ ] ESLint 无报错
- [ ] 组件可复用
- [ ] 错误处理完善

### 文档
- [ ] README.md 包含项目说明
- [ ] README.md 包含本地开发指南
- [ ] .env.local.example 完整

---

## 🚀 快速启动命令

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入实际值

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000
```

---

## 📞 遇到问题时

1. **依赖安装失败**: 检查 Node.js 版本 (建议 18+)
2. **Supabase 连接错误**: 检查环境变量
3. **Three.js 渲染问题**: 确保组件使用 `'use client'`
4. **API 路由 404**: 检查 App Router 目录结构

---

**开始工作吧！有任何不确定的地方随时问我。** 🌀
