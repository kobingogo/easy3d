# easy3d 🌀

> 一张图，30 秒，生成你的 3D 商品展示

面向电商卖家的 AI 3D 展示生成工具，让卖家无需专业建模技能，即可将商品图片快速转换为 3D 展示内容。

![easy3d](./public/og.png)

## ✨ 特性

- 🖼️ **图片转 3D** - 上传商品图，AI 自动生成 3D 模型
- 🎮 **实时预览** - Three.js 在线预览，支持旋转/缩放
- 📦 **批量处理** - 一次上传多张图片，批量生成
- 💾 **多格式导出** - GLB / GIF / MP4 随意导出
- 🔌 **一键嵌入** - HTML 代码嵌入店铺页面

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / bun
- Supabase 账号
- Tripo AI API Key

### 安装

```bash
# 克隆项目
git clone https://github.com/your-org/easy3d.git
cd easy3d

# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local

# 编辑 .env.local 填入实际值
# - Supabase URL 和 Key
# - Tripo API Key
# - NextAuth Secret

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
easy3d/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── generate/          # 生成页面
│   ├── dashboard/         # 用户后台
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── 3d/               # 3D 相关组件
│   ├── upload/           # 上传组件
│   └── ui/               # UI 组件
├── lib/                   # 工具库
│   ├── supabase/         # Supabase 客户端
│   ├── tripo/            # Tripo API 封装
│   └── utils.ts          # 工具函数
└── types/                 # TypeScript 类型
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS + shadcn/ui |
| 3D | Three.js + @react-three/fiber |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | NextAuth.js |
| 部署 | Vercel |
| AI | Tripo AI API |

## 📋 核心功能

### 1. 图片上传
- 支持格式：JPG, PNG, WebP
- 单张大小：≤10MB
- 批量上限：10 张/次 (v1.0)

### 2. 3D 生成
- 引擎：Tripo AI
- 耗时：30-60 秒/个
- 输出：GLB 格式

### 3. 3D 预览
- 交互：旋转、缩放、平移
- 光照：可调节环境光
- 背景：可选纯色/透明

### 4. 导出分享
- 格式：GLB / GIF / MP4
- 嵌入代码：一键复制
- 分享链接：7 天有效

## 💰 定价

| 计划 | 价格 | 额度 |
|------|------|------|
| 免费 | ¥0 | 3 个/日 |
| 月卡 | ¥99 | 无限生成 |
| 季卡 | ¥267 | 无限生成 + 优先队列 |

## 🔧 开发

### 命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产启动
npm start

# 类型检查
npm run type-check

# ESLint
npm run lint
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key |
| `SUPABASE_SERVICE_KEY` | Supabase 服务 Key |
| `TRIPO_API_KEY` | Tripo AI API Key |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 |
| `NEXTAUTH_URL` | NextAuth 回调 URL |

## 📄 文档

- [产品需求文档](./PRD-v1.0.md)
- [架构设计文档](./ARCH-v1.0.md)
- [Claude Code 开发指令](./CLAUDE_CODE_PROMPT.md)

## 🗺️ 路线图

### v1.0 (MVP) - 2026-03-15
- [x] 图片上传
- [ ] 3D 生成
- [ ] 3D 预览
- [ ] 基础导出

### v1.1 - 2026-03-30
- [ ] 批量上传
- [ ] 视频导出
- [ ] 嵌入代码
- [ ] 付费系统

### v1.2 - 2026-04-15
- [ ] 小红书直连发布
- [ ] 模板库
- [ ] 数据看板

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📝 License

MIT © 2026 easy3d Team

---

**Built with 🌀 by Bingo**
