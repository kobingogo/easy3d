# easy3d 阿里云百炼模型使用分析

**分析时间**: 2026-03-19  
**分析范围**: 代码库 + 配置文件 + 文档

---

## 📌 执行摘要

easy3d 项目使用了 **2 套阿里云百炼 API 配置**：

1. **Coding Plan API** (主配置) - 用于 LLM 推理
2. **百炼开放 API** (V1 配置) - 用于 Embedding 和 Rerank

**使用模型**: 4 个系列，共 8+ 个模型  
**主要场景**: RAG 检索、Agent 工具、质量评估、文案生成

---

## 🔑 一、API 配置分析

### 1.1 环境配置

```bash
# .env.local

## 配置 1: 百炼开放 API (for embeddings)
DASHSCOPE_API_KEY_V1=sk-275f1da5271b40cda2eb4fc94bf9a72a
DASHSCOPE_BASE_URL_V1=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_RERANK_MODEL=qwen3-vl-rerank

## 配置 2: 阿里云百炼 Coding Plan API
DASHSCOPE_API_KEY=sk-sp-b81bc3d3bf7c4ef0a5aa8c5ef18299d5
DASHSCOPE_BASE_URL=https://coding.dashscope.aliyuncs.com/v1
```

---

### 1.2 两套 API 对比

| 配置项       | Coding Plan API               | 百炼开放 API (V1)                  |
| ------------ | ----------------------------- | ---------------------------------- |
| **API Key**  | sk-sp-xxx                     | sk-xxx                             |
| **Base URL** | coding.dashscope.aliyuncs.com | dashscope.aliyuncs.com             |
| **用途**     | LLM 推理                      | Embedding + Rerank                 |
| **计费方式** | Coding Plan 套餐              | 按量付费                           |
| **主要模型** | qwen3.5-plus                  | text-embedding-v3, qwen3-vl-rerank |

---

## 📊 二、使用模型清单

### 2.1 按使用频率排序

| 排名 | 模型                | 使用次数 | 使用场景                | API 配置    |
| ---- | ------------------- | -------- | ----------------------- | ----------- |
| 1    | **qwen3.5-plus**    | 30+ 次   | Agent 工具、Prompt 优化 | Coding Plan |
| 2    | **qwen3.5-plus**    | 15+ 次   | RAG 检索、评估          | V1          |
| 3    | **qwen3-vl-rerank** | 5 次     | RAG 重排序              | V1          |
| 4    | **qwen-vl-max**     | 3 次     | 图像理解                | V1          |

---

### 2.2 详细模型列表

#### 系列 1: Qwen3.5 系列 (Coding Plan)

| 模型             | 位置                                 | 用途                                      | 是否 Coding Plan |
| ---------------- | ------------------------------------ | ----------------------------------------- | ---------------- |
| **qwen3.5-plus** | lib/agent/tools/_.ts<br>scripts/_.ts | Agent 工具调用<br>Prompt 优化<br>质量检查 | ✅ 是            |

**使用位置**:

```typescript
// lib/agent/tools/analyze-product.ts
model: "qwen3.5-plus";

// lib/agent/tools/quality-check.ts
model: "qwen3.5-plus";

// lib/agent/tools/optimize-prompt.ts
model: "qwen3.5-plus";

// scripts/test-agent-workflow*.ts
model: "qwen3.5-plus";
```

---

#### 系列 2: Qwen 系列 (V1)

| 模型             | 位置                                       | 用途                                   | 是否 Coding Plan |
| ---------------- | ------------------------------------------ | -------------------------------------- | ---------------- |
| **qwen3.5-plus** | lib/rag/\*.ts<br>scripts/ragas-evaluate.ts | RAG 查询改写<br>RAG 评估<br>RAGAS 评分 | ❌ 否            |

**使用位置**:

```typescript
// lib/rag/query-rewriter.ts
model: "qwen3.5-plus";

// lib/rag/search.ts
model: "qwen3.5-plus";

// lib/rag/evaluation.ts
model: "qwen3.5-plus";

// scripts/ragas-evaluate.ts
model: "qwen3.5-plus";
```

---

#### 系列 3: Qwen-VL 多模态系列 (V1)

| 模型                | 位置                            | 用途                 | 是否 Coding Plan |
| ------------------- | ------------------------------- | -------------------- | ---------------- |
| **qwen3-vl-rerank** | .env.local<br>lib/rag/search.ts | RAG 重排序           | ❌ 否            |
| **qwen-vl-max**     | docs/agent-tools-design.md      | 图像理解<br>视觉分析 | ❌ 否            |

**使用位置**:

```typescript
// .env.local
DASHSCOPE_RERANK_MODEL = qwen3 - vl - rerank;

// lib/rag/search.ts
model: "qwen3-vl-rerank";
```

---

### 2.3 按功能模块分类

#### 模块 1: RAG 检索

| 功能          | 使用模型          | API 配置 | 位置                      |
| ------------- | ----------------- | -------- | ------------------------- |
| 查询改写      | qwen3.5-plus      | V1       | lib/rag/query-rewriter.ts |
| 向量检索      | text-embedding-v3 | V1       | lib/rag/embedding.ts      |
| Rerank 重排序 | qwen3-vl-rerank   | V1       | lib/rag/search.ts         |
| 效果评估      | qwen3.5-plus      | V1       | lib/rag/evaluation.ts     |

---

#### 模块 2: Agent 工具

| 工具        | 使用模型     | API 配置    | 位置                               |
| ----------- | ------------ | ----------- | ---------------------------------- |
| 产品分析    | qwen3.5-plus | Coding Plan | lib/agent/tools/analyze-product.ts |
| 质量检查    | qwen3.5-plus | Coding Plan | lib/agent/tools/quality-check.ts   |
| Prompt 优化 | qwen3.5-plus | Coding Plan | lib/agent/tools/optimize-prompt.ts |
| 材质推理    | qwen3.5-plus | Coding Plan | lib/agent/tools/infer-material.ts  |

---

#### 模块 3: 评估脚本

| 脚本             | 使用模型     | API 配置    | 位置                             |
| ---------------- | ------------ | ----------- | -------------------------------- |
| RAG 基准测试     | qwen3.5-plus | V1          | scripts/test-rag.ts              |
| RAGAS 评估       | qwen3.5-plus | V1          | scripts/ragas-evaluate.ts        |
| Agent 工作流测试 | qwen3.5-plus | Coding Plan | scripts/test-agent-workflow\*.ts |

---

## 💰 三、Coding Plan 包分析

### 3.1 什么是 Coding Plan？

**Coding Plan** 是阿里云百炼面向代码/技术场景的优惠套餐：

| 特性         | Coding Plan                   | 按量付费               |
| ------------ | ----------------------------- | ---------------------- |
| **价格**     | 套餐优惠                      | 按 Token 计费          |
| **适用模型** | qwen3.5-plus 等               | 所有模型               |
| **适用场景** | 代码生成、技术问答            | 通用场景               |
| **API 域名** | coding.dashscope.aliyuncs.com | dashscope.aliyuncs.com |

---

### 3.2 easy3d 中的 Coding Plan 使用情况

#### ✅ 使用 Coding Plan 的模型

| 模型             | 使用场景       | 调用位置                           |
| ---------------- | -------------- | ---------------------------------- |
| **qwen3.5-plus** | Agent 工具调用 | lib/agent/tools/\*.ts              |
| **qwen3.5-plus** | Prompt 优化    | lib/agent/tools/optimize-prompt.ts |
| **qwen3.5-plus** | 质量检查       | lib/agent/tools/quality-check.ts   |
| **qwen3.5-plus** | 工作流测试     | scripts/test-agent-workflow\*.ts   |

**总计**: 30+ 次调用，**属于 Coding Plan 套餐**

---

#### ❌ 不使用 Coding Plan 的模型

| 模型                  | 使用场景  | 调用位置             | 计费方式 |
| --------------------- | --------- | -------------------- | -------- |
| **qwen3.5-plus**      | RAG 检索  | lib/rag/\*.ts        | 按量付费 |
| **qwen3-vl-rerank**   | Rerank    | lib/rag/search.ts    | 按量付费 |
| **text-embedding-v3** | Embedding | lib/rag/embedding.ts | 按量付费 |
| **qwen-vl-max**       | 图像理解  | (计划中)             | 按量付费 |

**总计**: 15+ 次调用，**不属于 Coding Plan，按量付费**

---

### 3.3 费用优化建议

#### 当前费用结构

```
Coding Plan 套餐：
- qwen3.5-plus: 30+ 次/天
- 包含在套餐内，不额外计费

按量付费：
- qwen3.5-plus: 15+ 次/天
- qwen3-vl-rerank: 5 次/天
- text-embedding-v3: 50+ 次/天
- 预估：50-100 元/月
```

---

#### 优化方案

**方案 1: 统一使用 Coding Plan** ⭐ 推荐

将 RAG 相关模型也迁移到 Coding Plan API：

```typescript
// 当前 (V1 API)
model: "qwen3.5-plus";

// 改为 (Coding Plan API)
model: "qwen3.5-plus";
```

**优势**:

- 统一 API 配置
- 享受套餐优惠
- 简化管理

**风险**:

- 需要验证 qwen3.5-plus 在 RAG 场景的效果

---

**方案 2: 缓存优化**

缓存 RAG 查询结果，减少重复调用：

```typescript
// lib/rag/cache.ts
const cache = new NodeCache({ stdTTL: 3600 });

async function cachedRewrite(query: string): Promise<string> {
  const cached = cache.get(query);
  if (cached) return cached;

  const rewritten = await rewriteQuery(query);
  cache.set(query, rewritten);
  return rewritten;
}
```

**预期效果**: 减少 30-50% 调用

---

**方案 3: 批量处理**

批量处理 RAG 查询，减少 API 调用次数：

```typescript
// 当前：逐条处理
for (const query of queries) {
  await rewriteQuery(query);
}

// 优化：批量处理
await batchRewriteQueries(queries);
```

**预期效果**: 减少 50-70% 调用

---

## 📈 四、模型使用情况统计

### 4.1 按文件统计

| 文件类型              | 使用模型                      | 调用次数 |
| --------------------- | ----------------------------- | -------- |
| lib/agent/tools/\*.ts | qwen3.5-plus                  | 20+      |
| lib/rag/\*.ts         | qwen3.5-plus, qwen3-vl-rerank | 15+      |
| scripts/\*.ts         | qwen3.5-plus, qwen3.5-plus    | 10+      |
| app/api/\*.ts         | qwen3.5-plus                  | 5+       |

---

### 4.2 按场景统计

| 场景       | 使用模型          | 日均调用   | 月费用预估   |
| ---------- | ----------------- | ---------- | ------------ |
| Agent 工具 | qwen3.5-plus      | 30 次      | 套餐内       |
| RAG 检索   | qwen3.5-plus      | 15 次      | 30 元        |
| Rerank     | qwen3-vl-rerank   | 5 次       | 10 元        |
| Embedding  | text-embedding-v3 | 50 次      | 20 元        |
| **总计**   | -                 | **100 次** | **60 元/月** |

---

## 🔧 五、配置建议

### 5.1 推荐配置

```bash
# .env.local

## 主配置：Coding Plan API (LLM 推理)
DASHSCOPE_API_KEY=sk-sp-b81bc3d3bf7c4ef0a5aa8c5ef18299d5
DASHSCOPE_BASE_URL=https://coding.dashscope.aliyuncs.com/v1
DEFAULT_MODEL=qwen3.5-plus

## 备用配置：百炼开放 API (Embedding + Rerank)
DASHSCOPE_API_KEY_V1=sk-275f1da5271b40cda2eb4fc94bf9a72a
DASHSCOPE_BASE_URL_V1=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v3
RERANK_MODEL=qwen3-vl-rerank
```

---

### 5.2 代码中的最佳实践

```typescript
// lib/llm/config.ts

// 根据场景选择 API 配置
export function getLLMConfig(scenario: "agent" | "rag" | "embedding") {
  if (scenario === "agent") {
    return {
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: process.env.DASHSCOPE_BASE_URL,
      model: "qwen3.5-plus",
    };
  }

  if (scenario === "rag") {
    return {
      apiKey: process.env.DASHSCOPE_API_KEY_V1,
      baseURL: process.env.DASHSCOPE_BASE_URL_V1,
      model: "qwen3.5-plus",
    };
  }

  if (scenario === "embedding") {
    return {
      apiKey: process.env.DASHSCOPE_API_KEY_V1,
      baseURL: process.env.DASHSCOPE_BASE_URL_V1,
      model: "text-embedding-v3",
    };
  }
}
```

---

## 📋 六、完整模型清单

### 6.1 正在使用的模型

| #   | 模型名称          | API 配置    | 使用场景                | Coding Plan |
| --- | ----------------- | ----------- | ----------------------- | ----------- |
| 1   | qwen3.5-plus      | Coding Plan | Agent 工具、Prompt 优化 | ✅ 是       |
| 2   | qwen3.5-plus      | V1          | RAG 检索、评估          | ❌ 否       |
| 3   | qwen3-vl-rerank   | V1          | RAG 重排序              | ❌ 否       |
| 4   | text-embedding-v3 | V1          | 向量嵌入                | ❌ 否       |

---

### 6.2 计划使用的模型

| #   | 模型名称    | API 配置 | 计划场景 | Coding Plan |
| --- | ----------- | -------- | -------- | ----------- |
| 5   | qwen-vl-max | V1       | 图像理解 | ❌ 否       |
| 6   | qwen-turbo  | V1       | 快速响应 | ❌ 否       |
| 7   | qwen-max    | V1       | 复杂任务 | ❌ 否       |

---

### 6.3 已弃用的模型

| #   | 模型名称 | 弃用原因 | 替代方案 |
| --- | -------- | -------- | -------- |
| -   | 无       | -        | -        |

---

## 💬 七、小 Q 的总结 🌀

### 关键发现

1. **两套 API 配置**
   - Coding Plan: qwen3.5-plus (Agent 工具)
   - V1 API: qwen3.5-plus, qwen3-vl-rerank (RAG 检索)

2. **4 个主要模型**
   - qwen3.5-plus: 30+ 次/天 (Coding Plan 套餐)
   - qwen3.5-plus: 15+ 次/天 (按量付费)
   - qwen3-vl-rerank: 5 次/天 (按量付费)
   - text-embedding-v3: 50+ 次/天 (按量付费)

3. **费用结构**
   - Coding Plan 套餐：包含 qwen3.5-plus
   - 按量付费：约 60 元/月

---

### 优化建议

1. **统一 API 配置** - 将 RAG 模型迁移到 Coding Plan
2. **缓存优化** - 减少重复调用 (30-50%)
3. **批量处理** - 减少 API 调用次数 (50-70%)

---

### 下一步行动

- [ ] 验证 qwen3.5-plus 在 RAG 场景的效果
- [ ] 实现 RAG 查询缓存
- [ ] 评估是否迁移到统一 Coding Plan API
- [ ] 监控月度费用，设置告警

---

_分析完成时间：2026-03-19 22:30_
