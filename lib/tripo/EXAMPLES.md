# Tripo API 使用示例 - P1-20260311 高质量生成

本文档展示如何使用最新 P1-20260311 模型生成高质量 3D 模型。

---

## 🚀 快速开始

### 基础使用（推荐）

```typescript
import { generateHighQuality3D, pollTaskStatus } from '@easy3d/tripo'

// 从图片生成高质量 3D 模型
const result = await generateHighQuality3D(
  'https://example.com/product.jpg',
  '精致的机械手表，金属表壳，皮革表带，高端腕表'
)

console.log('任务 ID:', result.data.task_id)

// 轮询等待完成
const status = await pollTaskStatus(result.data.task_id, {
  onProgress: (progress) => console.log(`进度：${progress}%`)
})

if (status.data.status === 'success') {
  const modelUrl = status.data.output?.pbr_model?.url || status.data.result?.pbr_model?.url
  console.log('模型下载链接:', modelUrl)
}
```

---

## 📸 图生 3D（P1-20260311）

### 示例 1: 产品建模

```typescript
import { createTask, pollTaskStatus } from '@easy3d/tripo'

const result = await createTask({
  type: 'image_to_model',
  imageUrl: 'https://example.com/watch.jpg',
  prompt: '精致的机械手表，玫瑰金表壳，深蓝色表盘，罗马数字刻度，棕色皮革表带，微距摄影级别细节',
  config: {
    modelVersion: 'P1-20260311',  // 最新图生模型
    faceLimit: 15000,              // 高质量面数
    enableImageAutofix: true,      // 自动修复图片
    pbr: true,                     // 启用 PBR 材质
    autoSize: true,                // 自动真实尺寸
    negativePrompt: '模糊，低质量，塑料感，畸形',
  }
})

const status = await pollTaskStatus(result.data.task_id)
const modelUrl = status.data.output?.pbr_model?.url
```

### 示例 2: 角色建模

```typescript
const result = await createTask({
  type: 'image_to_model',
  imageUrl: 'https://example.com/character.jpg',
  prompt: '动漫风格女战士，银色长发，蓝色眼睛，穿着轻甲，手持长剑，动态姿势，细节丰富',
  config: {
    modelVersion: 'P1-20260311',
    faceLimit: 20000,              // 超高精度
    enableImageAutofix: true,
    pbr: true,
  }
})
```

### 示例 3: 使用便捷函数

```typescript
import { generateHighQuality3D } from '@easy3d/tripo'

// 最简单的方式
const result = await generateHighQuality3D(
  'https://example.com/item.jpg',
  '精致的陶瓷咖啡杯，白色，简约设计，工作室灯光'
)
```

---

## 📝 文生 3D（v3.1-20260211）

### 示例 1: 创意生成

```typescript
import { generateHighQuality3DFromText } from '@easy3d/tripo'

const result = await generateHighQuality3DFromText(
  '一只赛博朋克风格的机械龙，青绿色金属鳞片，金色电路纹路，蓝色发光眼睛，机械关节清晰可见，动态飞行姿势',
  {
    geometryQuality: 'detailed',   // Ultra Mode
    textureQuality: 'detailed',    // 高分辨率纹理
  }
)
```

### 示例 2: 使用 createTask

```typescript
const result = await createTask({
  type: 'text_to_model',
  prompt: '未来主义城市景观，高耸的摩天大楼，飞行汽车穿梭，霓虹灯招牌，赛博朋克风格，夜晚',
  config: {
    modelVersion: 'v3.1-20260211',  // 最新文生模型
    geometryQuality: 'detailed',    // Ultra Mode
    textureQuality: 'detailed',
    faceLimit: 15000,
    pbr: true,
    negativePrompt: '老旧建筑，交通堵塞，白天',
  }
})
```

---

## 🎯 多视角建模（P1-20260311）

### 示例：产品四视图

```typescript
const result = await createTask({
  type: 'multiview_to_model',
  images: [
    { url: 'https://example.com/product_front.jpg' },   // 正面
    { url: 'https://example.com/product_left.jpg' },    // 左侧
    { url: 'https://example.com/product_back.jpg' },    // 背面
    { url: 'https://example.com/product_right.jpg' },   // 右侧
  ],
  config: {
    modelVersion: 'P1-20260311',
    faceLimit: 15000,
    pbr: true,
    autoSize: true,
  }
})
```

---

## ⚙️ 高级配置

### 环境变量覆盖

```bash
# .env 文件
TRIPO_MODEL_VERSION=P1-20260311
TRIPO_FACE_LIMIT=20000
TRIPO_ENABLE_IMAGE_AUTOFIX=true
TRIPO_PBR=true
TRIPO_AUTO_SIZE=true
TRIPO_NEGATIVE_PROMPT=low quality, blurry, distorted
```

### 自定义配置

```typescript
const result = await createTask({
  type: 'image_to_model',
  imageUrl: 'https://example.com/item.jpg',
  config: {
    modelVersion: 'P1-20260311',
    faceLimit: 10000,              // 中等质量（更快）
    enableImageAutofix: true,
    pbr: true,
    autoSize: true,
    negativePrompt: '卡通，简笔画',
    pollInterval: 5000,            // 5 秒轮询
    pollTimeout: 300000,           // 5 分钟超时
  }
})
```

---

## 🎨 Prompt 最佳实践

### ✅ 好的 Prompt

```typescript
// 产品
'精致的机械手表，金属表壳，皮革表带，高端腕表，微距细节'

// 角色
'动漫风格女战士，银色长发，蓝色眼睛，轻甲，长剑，动态姿势'

// 场景
'赛博朋克城市，摩天大楼，飞行汽车，霓虹灯，夜晚，湿润街道'

// 动物
'威严的东方龙，青绿色鳞片，金色龙角，云雾，传统中国风格'
```

### ❌ 避免的 Prompt

```typescript
// 太模糊
'一个手表'

// 包含 emoji
'一个手表⌚'

// 太长（>1024 字符）
'一个非常非常详细的...（省略 500 字）'
```

---

## 📊 质量配置参考

| 场景 | faceLimit | geometryQuality | textureQuality | 用途 |
|------|-----------|-----------------|----------------|------|
| **快速原型** | 5000 | standard | standard | 概念验证 |
| **标准质量** | 10000 | detailed | detailed | 日常使用 |
| **高质量** | 15000 | detailed | detailed | 生产使用 |
| **电影级** | 20000 | detailed | detailed | 影视/广告 |

---

## 🔍 错误处理

```typescript
try {
  const result = await generateHighQuality3D(imageUrl, prompt)
  const status = await pollTaskStatus(result.data.task_id)
  
  if (status.data.status === 'failed') {
    console.error('生成失败:', status.data.error)
  }
} catch (error) {
  if (error.message.includes('余额不足')) {
    console.log('请充值 Tripo API')
  } else if (error.message.includes('认证失败')) {
    console.log('请检查 API Key 配置')
  } else {
    console.error('未知错误:', error)
  }
}
```

---

## 📚 相关文档

- [Tripo 官方文档](https://platform.tripo3d.ai/docs/generation)
- [P1-20260311 模型说明](https://platform.tripo3d.ai/docs/generation)
- [API 参考](https://platform.tripo3d.ai/docs/schema)

---

**提示**: P1-20260311 是图生 3D 专用模型，文生 3D 请使用 v3.1-20260211 🌀
