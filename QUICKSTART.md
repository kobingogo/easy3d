# easy3d - Claude Code 快速启动卡

**目标**: 2 小时内完成 MVP 框架搭建

---

## 🎯 一句话指令

> "请按照 CLAUDE_CODE_PROMPT.md 中的任务清单，从 Phase 1 开始逐步搭建 easy3d 项目框架。每个 Phase 完成后暂停，等我确认后再继续。"

---

## 📁 核心文档

| 文档 | 用途 |
|------|------|
| `CLAUDE_CODE_PROMPT.md` | **主指令文档** - 包含完整技术栈、目录结构、任务清单 |
| `TASKS.md` | 任务追踪清单 - 勾选完成状态 |
| `PRD-v1.0.md` | 产品需求参考 - 了解功能细节 |
| `ARCH-v1.0.md` | 架构设计参考 - 了解技术决策 |

---

## 🚀 开始命令

```bash
# 1. 进入项目目录
cd /Users/bingo/.openclaw/workspace/projects/easy3d

# 2. 用 Claude Code 打开
claude

# 3. 输入以下 prompt:
```

---

## 💬 推荐 Prompt

### 首次启动
```
你好！请帮我搭建 easy3d 项目的框架。

核心信息：
- 项目定位：电商卖家的 AI 3D 商品展示生成工具
- 技术栈：Next.js 14 + TypeScript + Three.js + Supabase
- 文档位置：./CLAUDE_CODE_PROMPT.md

请从 Phase 1 (项目初始化) 开始，逐步执行任务清单。
每个 Phase 完成后暂停，等我确认后再继续。

当前时间：2026-03-12
目标：今天完成 MVP 框架搭建
```

### 继续下一阶段
```
Phase X 已完成，请继续 Phase X+1。
当前任务文件：./TASKS.md
```

### 遇到问题时
```
在实现 XXX 时遇到问题：[描述问题]
请帮我分析原因并提供解决方案。
```

---

## ✅ 验收检查点

### Phase 1 完成后检查
- [ ] `npm run dev` 正常启动
- [ ] 访问 localhost:3000 无报错
- [ ] Tailwind CSS 正常工作

### Phase 3 完成后检查
- [ ] Supabase 客户端可导入
- [ ] 数据库表已创建
- [ ] Storage Bucket 已创建

### Phase 5 完成后检查
- [ ] 首页可访问
- [ ] 3D 模型可加载预览
- [ ] 上传功能可用

### 全部完成后检查
- [ ] 完整流程可跑通 (上传→生成→预览→导出)
- [ ] 无 TypeScript 错误
- [ ] README.md 完整

---

## 🔑 必需账号与 Key

| 服务 | 用途 | 获取链接 |
|------|------|----------|
| Supabase | 数据库 + 存储 | https://supabase.com |
| Tripo AI | 3D 模型生成 | https://tripo3d.ai |
| Vercel | 部署托管 | https://vercel.com |

**环境变量模板** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
TRIPO_API_KEY=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
```

---

## 📞 常用命令

```bash
# 开发
npm run dev

# 类型检查
npm run type-check

# ESLint
npm run lint

# 构建
npm run build

# 查看端口占用
lsof -i :3000

# 杀死占用端口的进程
kill -9 $(lsof -t -i :3000)
```

---

## 🆘 常见问题

| 问题 | 解决方案 |
|------|----------|
| Node 版本过低 | 升级到 18+ (`nvm use 22`) |
| 依赖安装失败 | 删除 node_modules 重新安装 |
| Supabase 连接失败 | 检查环境变量 |
| Three.js 不渲染 | 确保组件使用 `'use client'` |
| API 路由 404 | 检查目录结构 (app/api/...) |

---

**准备好就开始吧！🌀**
