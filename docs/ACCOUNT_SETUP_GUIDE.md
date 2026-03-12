# easy3d 账号申请指南

**更新时间**: 2026-03-12  
**适用项目**: easy3d v2.0  
**预计时间**: 30 分钟

---

## 📋 账号清单

| 服务 | 用途 | 免费额度 | 必需 |
|------|------|----------|------|
| **Tripo AI** | 3D 模型生成 | 免费试用 | ⭐⭐⭐ |
| **Supabase** | 数据库 + 存储 | 免费额度充足 | ⭐⭐⭐ |
| **硅基流动** | AI 文本/Embedding | 免费额度 | ⭐⭐ |
| **Vercel** | 项目部署 | 免费额度 | ⭐⭐ |
| **Qdrant** | 向量数据库 | 免费云/本地 | ⭐ |

---

## 1️⃣ Tripo AI 账号申请

### 1.1 注册地址
**https://tripo3d.ai**

### 1.2 注册流程

```
Step 1: 打开 Tripo AI 官网
        ↓
Step 2: 点击右上角 "Sign Up"
        ↓
Step 3: 选择注册方式
        - Google 账号（推荐）
        - GitHub 账号
        - 邮箱注册
        ↓
Step 4: 验证邮箱（如使用邮箱注册）
        ↓
Step 5: 完成注册，进入控制台
```

### 1.3 获取 API Key

```
1. 登录 Tripo AI 控制台
2. 点击右上角头像 → "Settings"
3. 进入 "API Keys" 标签页
4. 点击 "Create New Key"
5. 输入 Key 名称（如：easy3d-dev）
6. 复制并保存 API Key（只显示一次！）
```

### 1.4 免费额度说明

| 项目 | 免费额度 | 说明 |
|------|----------|------|
| 试用额度 | 约 20-50 次生成 | 注册赠送 |
| 专业版 | $20/月 | 含 API 访问 |
| 企业版 | 联系销售 | 批量处理 |

### 1.5 配置到项目

```bash
# 编辑 .env.local
cd /Users/bingo/.openclaw/workspace/projects/easy3d
nano .env.local

# 添加以下内容
TRIPO_API_KEY=你的 Tripo API Key
```

### 1.6 验证 API Key

```bash
# 测试 API 调用
curl -X POST "https://api.tripo3d.ai/v2/openapi/task" \
  -H "Authorization: Bearer 你的 API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"image_to_model","file":{"type":"url","url":"https://example.com/test.jpg"}}'
```

---

## 2️⃣ Supabase 账号申请

### 2.1 注册地址
**https://supabase.com**

### 2.2 注册流程

```
Step 1: 打开 Supabase 官网
        ↓
Step 2: 点击 "Start your project" 或 "Sign Up"
        ↓
Step 3: 选择登录方式
        - GitHub（推荐）
        - 邮箱注册
        ↓
Step 4: 验证邮箱（如使用邮箱注册）
        ↓
Step 5: 完成个人资料
        ↓
Step 6: 进入控制台
```

### 2.3 创建项目

```
1. 点击 "New Project"
2. 填写项目信息：
   - Name: easy3d
   - Database Password: 设置强密码（保存！）
   - Region: 选择最近的（推荐：Asia East - Tokyo）
   - Pricing Plan: Free（免费）
3. 点击 "Create new project"
4. 等待 2-3 分钟项目创建完成
```

### 2.4 获取配置信息

```
1. 进入项目控制台
2. 点击左下角 "Settings"（齿轮图标）
3. 进入 "API" 页面
4. 复制以下信息：
   - Project URL: https://xxxxx.supabase.co
   - anon/public key: eyJhbG...（公开密钥）
   - service_role key: eyJhbG...（服务密钥，保密！）
```

### 2.5 创建数据表

```sql
-- 在 Supabase SQL Editor 中执行

-- 创建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wechat_openid VARCHAR(255) UNIQUE,
  wechat_avatar VARCHAR(512),
  wechat_nickname VARCHAR(100),
  plan_type VARCHAR(20) DEFAULT 'free',
  credits_remaining INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建 models 表
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  original_image_url VARCHAR(512),
  model_3d_url VARCHAR(512),
  thumbnail_url VARCHAR(512),
  status VARCHAR(20),
  quality VARCHAR(20),
  trip_task_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建 usage_logs 表
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  credits_used INT,
  model_id UUID REFERENCES models(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
```

### 2.6 创建 Storage Bucket

```
1. 进入项目控制台
2. 点击左侧 "Storage"
3. 点击 "New Bucket"
4. 创建以下 Bucket：
   - original-images（公开）
   - 3d-models（公开）
5. 设置 Policy 为 "Public"（允许公开访问）
```

### 2.7 配置到项目

```bash
# 编辑 .env.local
nano .env.local

# 添加以下内容
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
SUPABASE_SERVICE_KEY=你的 service_role key
```

### 2.8 免费额度说明

| 资源 | 免费额度 | 说明 |
|------|----------|------|
| 数据库 | 500MB | 足够开发测试 |
| 存储 | 1GB | 约 1000 张图片 |
| 带宽 | 2GB/月 | 足够开发测试 |
| API 请求 | 5 万次/月 | 足够开发测试 |

---

## 3️⃣ 硅基流动账号申请（可选）

### 3.1 注册地址
**https://siliconflow.cn**

### 3.2 注册流程

```
Step 1: 打开硅基流动官网
        ↓
Step 2: 点击右上角 "注册"
        ↓
Step 3: 选择注册方式
        - 手机号
        - GitHub
        ↓
Step 4: 完成验证
        ↓
Step 5: 进入控制台
```

### 3.3 获取 API Key

```
1. 登录控制台
2. 点击左侧 "API Keys"
3. 点击 "创建新密钥"
4. 输入名称（如：easy3d-dev）
5. 复制并保存 API Key
```

### 3.4 免费额度说明

| 模型 | 免费额度 | 说明 |
|------|----------|------|
| Qwen3.5 | 免费 | 每日限额 |
| Embedding | 免费 | 每日限额 |
| 其他模型 | 赠送额度 | 注册赠送 |

### 3.5 配置到项目

```bash
# 编辑 .env.local
nano .env.local

# 添加以下内容
SILICONFLOW_API_KEY=你的硅基流动 API Key
```

---

## 4️⃣ Vercel 账号申请（部署用）

### 4.1 注册地址
**https://vercel.com**

### 4.2 注册流程

```
Step 1: 打开 Vercel 官网
        ↓
Step 2: 点击 "Sign Up"
        ↓
Step 3: 选择 GitHub 登录（推荐）
        ↓
Step 4: 授权 Vercel 访问 GitHub
        ↓
Step 5: 完成注册
```

### 4.3 部署项目

```
1. 将项目推送到 GitHub
2. 登录 Vercel 控制台
3. 点击 "Add New Project"
4. 选择 GitHub 仓库
5. 配置环境变量
6. 点击 "Deploy"
```

### 4.4 免费额度说明

| 资源 | 免费额度 | 说明 |
|------|----------|------|
| 带宽 | 100GB/月 | 足够个人项目 |
| 构建 | 6000 分钟/月 | 足够开发测试 |
| Serverless | 100GB-Hrs/月 | 足够开发测试 |

---

## 5️⃣ Qdrant 向量数据库（可选）

### 方案 A: Qdrant Cloud（推荐）

**注册地址**: https://cloud.qdrant.io

**免费额度**:
- 1GB 存储
- 免费集群（7 天试用）

### 方案 B: 本地 Docker（开发用）

```bash
# 使用 Docker 运行本地 Qdrant
docker run -p 6333:6333 qdrant/qdrant

# 访问 http://localhost:6333
```

### 配置到项目

```bash
# 编辑 .env.local
nano .env.local

# 添加以下内容（二选一）

# Qdrant Cloud
QDRANT_URL=https://你的集群.cloud.qdrant.io
QDRANT_API_KEY=你的 API Key

# 或本地 Qdrant
QDRANT_URL=http://localhost:6333
```

---

## ✅ 配置验证清单

### 环境变量检查

```bash
# 创建 .env.local 文件
cd /Users/bingo/.openclaw/workspace/projects/easy3d
cat > .env.local << EOF
# Tripo AI
TRIPO_API_KEY=你的 Tripo API Key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
SUPABASE_SERVICE_KEY=你的 service_role key

# 硅基流动（可选）
SILICONFLOW_API_KEY=你的硅基流动 API Key

# Qdrant（可选）
QDRANT_URL=http://localhost:6333
EOF
```

### 权限检查

```bash
# 确保 .env.local 不被提交
echo ".env.local" >> .gitignore

# 检查权限
chmod 600 .env.local
```

---

## 🐛 常见问题

### Q1: Tripo API Key 无效
**A**: 检查以下几点：
1. API Key 是否复制完整
2. 是否已验证邮箱
3. 免费额度是否用完

### Q2: Supabase 连接失败
**A**: 检查以下几点：
1. Project URL 是否正确
2. 数据库密码是否记住
3. 防火墙是否允许访问

### Q3: Storage 上传失败
**A**: 检查以下几点：
1. Bucket 是否设置为 Public
2. Policy 是否正确配置
3. CORS 是否允许跨域

---

## 📞 支持资源

| 服务 | 文档 | 支持 |
|------|------|------|
| Tripo AI | https://docs.tripo3d.ai | support@tripo3d.ai |
| Supabase | https://supabase.com/docs | https://github.com/supabase/supabase/discussions |
| 硅基流动 | https://docs.siliconflow.cn | 官网客服 |
| Vercel | https://vercel.com/docs | https://vercel.com/support |
| Qdrant | https://qdrant.tech/documentation | https://discord.gg/qdrant |

---

## 📝 账号信息记录表

**⚠️ 重要：请将以下信息保存到密码管理器！**

```
=== Tripo AI ===
注册邮箱：_________________
API Key: ___________________
注册日期：_________________

=== Supabase ===
注册邮箱：_________________
Project URL: _______________
Anon Key: _________________
Service Role Key: __________
Database Password: _________
注册日期：_________________

=== 硅基流动 ===
注册手机/邮箱：___________
API Key: ___________________
注册日期：_________________

=== Vercel ===
GitHub 账号：______________
注册日期：_________________
```

---

**完成时间**: 预计 30 分钟  
**下一步**: 运行 `npm run dev` 启动项目

🌀 小 Q 整理 · 2026-03-12
