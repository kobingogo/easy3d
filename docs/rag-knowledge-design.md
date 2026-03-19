# RAG 知识库设计文档

**版本**: v2.0
**创建时间**: 2026-03-12
**更新时间**: 2026-03-12

---

## 一、技术选型

### 1.1 向量数据库

| 选型           | 决定                | 理由                                        |
| -------------- | ------------------- | ------------------------------------------- |
| **向量数据库** | Qdrant              | 开源免费，支持本地 Docker，性能优秀         |
| **部署方式**   | 本地开发 + 可选云端 | 开发阶段本地运行，生产可迁移到 Qdrant Cloud |

### 1.2 LLM 服务（阿里云百炼）

| 模型类型      | 模型名称          | 用途                 | 说明                  |
| ------------- | ----------------- | -------------------- | --------------------- |
| **Embedding** | text-embedding-v3 | 文本向量化           | 1024 维，中英文效果好 |
| **文本生成**  | qwen3.5-plus      | 知识生成、提示词优化 | 平衡性能与成本        |
| **视觉理解**  | qwen-vl-max       | 商品图片分析         | 支持图像理解          |

**百炼 API 配置**:

```bash
# 阿里云百炼 API
DASHSCOPE_API_KEY=sk-xxx
```

### 1.3 检索策略

| 策略            | 说明                    | 目的             |
| --------------- | ----------------------- | ---------------- |
| 向量检索        | 基于语义相似度          | 召回语义相关内容 |
| 关键词过滤      | 基于 tags/keywords 字段 | 精确匹配特定类别 |
| Reranker 重排序 | Cross-Encoder 精排      | 提升排序准确性   |

---

## 二、知识库整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    知识库 (product-knowledge)                │
├─────────────────────────────────────────────────────────────┤
│  分类 1: 商品品类知识 (50 条)                                 │
│  分类 2: 场景设计知识 (30 条)                                 │
│  分类 3: 光照摄影知识 (20 条)                                 │
│  分类 4: 风格模板知识 (20 条)                                 │
│  分类 5: 平台规范知识 (10 条)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    向量数据库 (Qdrant)                       │
│  - Collection: product-knowledge                            │
│  - Vector Size: 1024 (text-embedding-v3)                    │
│  - Distance: Cosine                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、数据结构定义

```typescript
// lib/rag/types.ts

interface KnowledgeEntry {
  id: string; // UUID
  text: string; // 知识内容 (核心检索字段)
  vector?: number[]; // 嵌入向量 (入库后生成)
  category: KnowledgeCategory; // 分类
  tags: string[]; // 标签 (辅助过滤)
  keywords: string[]; // 关键词 (辅助检索)
  priority: number; // 优先级 1-5 (影响排序)
  source: string; // 来源 ("llm-generated" | "manual")
  examples?: string[]; // 示例商品
  metadata?: Record<string, any>; // 扩展元数据
}

type KnowledgeCategory =
  | "product_category" // 商品品类
  | "scene_design" // 场景设计
  | "lighting" // 光照摄影
  | "style_template" // 风格模板
  | "platform_spec"; // 平台规范

interface SearchResult {
  entry: KnowledgeEntry;
  score: number; // 相似度 0-1
  rerankScore?: number; // 重排序分数
  highlights?: string[]; // 高亮片段
}
```

---

## 四、核心模块实现

### 4.1 Embedding 模块

```typescript
// lib/rag/embedding.ts

import OpenAI from "openai";

// 阿里云百炼兼容 OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const EMBEDDING_MODEL = "text-embedding-v3";
const EMBEDDING_DIMENSION = 1024;

/**
 * 文本向量化
 * @param text 待向量化的文本
 * @returns 向量数组
 */
export async function embedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSION,
  });

  return response.data[0].embedding;
}

/**
 * 批量文本向量化
 * @param texts 文本数组
 * @returns 向量数组
 */
export async function batchEmbedding(texts: string[]): Promise<number[][]> {
  // 百炼 API 限制每批最多 25 条
  const BATCH_SIZE = 25;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSION,
    });
    results.push(...response.data.map((d) => d.embedding));
  }

  return results;
}
```

### 4.2 Reranker 模块

```typescript
// lib/rag/reranker.ts

/**
 * Reranker - 使用 Cross-Encoder 对检索结果重排序
 * 提升检索准确率 5-10%
 */

interface RerankResult {
  index: number;
  relevanceScore: number;
}

/**
 * 使用百炼的 Rerank API 进行重排序
 * @param query 查询文本
 * @param documents 文档列表
 * @param topK 返回前 K 个结果
 */
export async function rerank(
  query: string,
  documents: string[],
  topK: number = 5,
): Promise<RerankResult[]> {
  // 方案 1: 使用百炼 Rerank API（推荐）
  // 注意：百炼暂无独立 Rerank API，可使用 qwen3.5-plus 进行打分
  const response = await client.chat.completions.create({
    model: "qwen3.5-plus",
    messages: [
      {
        role: "user",
        content: `
你是一个相关性评估专家。请对以下文档与查询的相关性进行打分。

查询：${query}

文档列表：
${documents.map((doc, i) => `[${i}] ${doc}`).join("\n\n")}

请返回 JSON 格式：
{
  "scores": [
    { "index": 0, "score": 0.95 },
    { "index": 1, "score": 0.72 },
    ...
  ]
}

评分标准：0-1 之间，1 表示完全相关，0 表示完全不相关。
`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content);

  // 按分数降序排列，返回 topK
  return result.scores
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, topK)
    .map((item: any) => ({
      index: item.index,
      relevanceScore: item.score,
    }));
}

/**
 * 对 SearchResult 列表进行重排序
 */
export async function rerankSearchResults(
  query: string,
  results: SearchResult[],
  topK: number = 5,
): Promise<SearchResult[]> {
  if (results.length === 0) return results;

  const documents = results.map((r) => r.entry.text);
  const rerankResults = await rerank(query, documents, topK);

  return rerankResults.map((r) => ({
    ...results[r.index],
    rerankScore: r.relevanceScore,
  }));
}
```

### 4.3 向量数据库模块

```typescript
// lib/rag/qdrant.ts

import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "product-knowledge";
const VECTOR_SIZE = 1024;

/**
 * 初始化 Collection
 */
export async function initCollection(): Promise<void> {
  const collections = await client.getCollections();

  if (!collections.collections.find((c) => c.name === COLLECTION_NAME)) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
    console.log(`Collection ${COLLECTION_NAME} created`);
  }
}

/**
 * 插入知识条目
 */
export async function upsertEntries(entries: KnowledgeEntry[]): Promise<void> {
  const points = entries.map((entry) => ({
    id: entry.id,
    vector: entry.vector!,
    payload: {
      text: entry.text,
      category: entry.category,
      tags: entry.tags,
      keywords: entry.keywords,
      priority: entry.priority,
      source: entry.source,
      examples: entry.examples || [],
      metadata: entry.metadata || {},
    },
  }));

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });
}

/**
 * 向量检索
 */
export async function vectorSearch(
  queryVector: number[],
  options: {
    limit?: number;
    threshold?: number;
    category?: KnowledgeCategory;
    tags?: string[];
  } = {},
): Promise<SearchResult[]> {
  const { limit = 5, threshold = 0.7, category, tags } = options;

  // 构建过滤条件
  const filter: any = { must: [] };

  if (category) {
    filter.must.push({
      key: "category",
      match: { value: category },
    });
  }

  if (tags && tags.length > 0) {
    filter.must.push({
      key: "tags",
      match: { any: tags },
    });
  }

  const response = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    score_threshold: threshold,
    filter: filter.must.length > 0 ? filter : undefined,
  });

  return response.map((r) => ({
    entry: r.payload as unknown as KnowledgeEntry,
    score: r.score,
  }));
}
```

### 4.4 检索服务

```typescript
// lib/rag/search.ts

/**
 * 知识库检索服务
 */

export interface SearchOptions {
  category?: KnowledgeCategory;
  tags?: string[];
  limit?: number;
  threshold?: number;
  enableRerank?: boolean; // 是否启用重排序
}

export async function searchKnowledge(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const {
    limit = 5,
    threshold = 0.7,
    enableRerank = true,
    ...filterOptions
  } = options;

  // 1. 向量化查询
  const queryVector = await embedding(query);

  // 2. 向量检索（召回更多候选）
  const candidates = await vectorSearch(queryVector, {
    limit: enableRerank ? limit * 3 : limit, // 重排序时多召回
    threshold,
    ...filterOptions,
  });

  // 3. 重排序（可选）
  if (enableRerank && candidates.length > limit) {
    return rerankSearchResults(query, candidates, limit);
  }

  // 4. 规则重排（priority 加权）
  return candidates
    .map((r) => ({
      ...r,
      score: r.score * (1 + (r.entry.priority - 3) * 0.1), // priority 1-5
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 检索并生成建议（RAG 完整流程）
 */
export async function suggestDisplay(
  productDescription: string,
  style?: string,
): Promise<string> {
  // 1. RAG 检索
  const knowledge = await searchKnowledge(
    `${productDescription} ${style || ""}`,
    {
      categories: ["product_category", "style_template", "lighting"],
      limit: 3,
    },
  );

  // 2. LLM 生成
  const response = await client.chat.completions.create({
    model: "qwen3.5-plus",
    messages: [
      {
        role: "user",
        content: `
你是一个电商3D展示专家。基于以下专业知识，为商品推荐3D展示方案。

商品信息：${productDescription}
${style ? `风格偏好：${style}` : ""}

参考资料：
${knowledge.map((k) => k.entry.text).join("\n\n")}

请给出：
1. 背景推荐
2. 光照设置
3. 展示角度
4. 注意事项
`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}
```

---

## 五、分类体系详解

### 5.1 商品品类知识 (50 条)

**目的**: 根据商品类型推荐最佳展示方案

**二级分类**:
| 二级分类 | 条目数 | 示例关键词 |
|----------|--------|------------|
| 服装鞋帽 | 8 | 女装、男装、运动鞋、高跟鞋 |
| 美妆护肤 | 8 | 口红、粉底、香水、面膜 |
| 3C 数码 | 8 | 手机壳、耳机、充电宝、键盘 |
| 家居生活 | 8 | 抱枕、台灯、餐具、收纳 |
| 珠宝配饰 | 6 | 项链、手链、墨镜、手表 |
| 食品饮料 | 6 | 零食、茶叶、咖啡、酒水 |
| 母婴用品 | 4 | 奶瓶、玩具、童装 |
| 其他 | 2 | 文创、礼品 |

**示例条目**:

```typescript
{
  id: "prod-001",
  text: "口红类化妆品适合纯色背景搭配柔光拍摄，推荐使用粉色或渐变背景突出女性气质，展示时建议45度斜角摆放，重点展示膏体质感和颜色饱和度",
  category: "product_category",
  tags: ["化妆品", "口红", "美妆"],
  keywords: ["口红", "唇膏", "彩妆"],
  priority: 5,
  examples: ["YSL口红", "MAC口红", "迪奥口红"]
}
```

---

### 5.2 场景设计知识 (30 条)

**目的**: 推荐合适的 3D 展示场景

| 二级分类 | 条目数 | 适用商品   |
| -------- | ------ | ---------- |
| 纯色背景 | 5      | 全品类通用 |
| 渐变背景 | 5      | 美妆、珠宝 |
| 自然场景 | 5      | 食品、家居 |
| 室内场景 | 5      | 家居、3C   |
| 科技场景 | 5      | 3C 数码    |
| 节日场景 | 5      | 礼品、食品 |

---

### 5.3 光照摄影知识 (20 条)

**目的**: 推荐最佳光照设置

| 二级分类 | 条目数 | 适用场景   |
| -------- | ------ | ---------- |
| 基础打光 | 5      | 全品类     |
| 材质表现 | 5      | 珠宝、3C   |
| 氛围营造 | 5      | 美妆、食品 |
| 阴影处理 | 5      | 高级展示   |

---

### 5.4 风格模板知识 (20 条)

**目的**: 快速匹配展示风格

| 风格   | 条目数 | 适用商品   | 特点                 |
| ------ | ------ | ---------- | -------------------- |
| 极简风 | 4      | 全品类     | 干净、留白、突出产品 |
| 奢华风 | 4      | 珠宝、美妆 | 金色元素、高级感     |
| 科技风 | 4      | 3C 数码    | 金属质感、蓝色调     |
| 自然风 | 4      | 食品、家居 | 绿植、木质元素       |
| 潮流风 | 4      | 服装、鞋帽 | 动感、年轻化         |

---

### 5.5 平台规范知识 (10 条)

**目的**: 符合电商平台要求

| 平台      | 条目数 | 关注点               |
| --------- | ------ | -------------------- |
| 淘宝/天猫 | 2      | 主图规范、详情页要求 |
| 抖音      | 2      | 视频尺寸、交互要求   |
| 小红书    | 2      | 竖版比例、种草风格   |
| 闲鱼      | 2      | 真实感、生活化       |
| 跨境电商  | 2      | 亚马逊、Temu 规范    |

---

## 六、检索流程图

```
用户查询 "红色口红怎么展示"
        │
        ▼
┌─────────────────────────────────────┐
│  1. Embedding                        │
│  text-embedding-v3 → 1024 维向量     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  2. 向量检索 (Qdrant)                │
│  召回 15 个候选 (limit × 3)          │
│  阈值过滤 (score > 0.7)              │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  3. Reranker (qwen3.5-plus 打分)       │
│  Cross-Encoder 风格重排序            │
│  返回 Top 5                         │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  4. 规则重排                         │
│  priority 加权                       │
│  最终结果                            │
└─────────────────────────────────────┘
```

---

## 七、知识库维护

### 7.1 构建脚本

```typescript
// scripts/build-knowledge.ts

import { initCollection, upsertEntries } from "@/lib/rag/qdrant";
import { batchEmbedding } from "@/lib/rag/embedding";
import { knowledgeBase } from "./knowledge-base";

async function buildKnowledgeBase() {
  console.log("Initializing Qdrant collection...");
  await initCollection();

  console.log("Generating embeddings...");
  const texts = knowledgeBase.map((entry) => entry.text);
  const vectors = await batchEmbedding(texts);

  console.log("Upserting entries...");
  const entriesWithVectors = knowledgeBase.map((entry, i) => ({
    ...entry,
    vector: vectors[i],
  }));

  // 分批插入，每批 100 条
  const BATCH_SIZE = 100;
  for (let i = 0; i < entriesWithVectors.length; i += BATCH_SIZE) {
    const batch = entriesWithVectors.slice(i, i + BATCH_SIZE);
    await upsertEntries(batch);
    console.log(`Upserted ${i + batch.length}/${entriesWithVectors.length}`);
  }

  console.log("Knowledge base built successfully!");
}

buildKnowledgeBase();
```

### 7.2 质量评估

```typescript
// scripts/evaluate-rag.ts

const TEST_CASES = [
  { query: "口红展示", expectedCategory: "product_category" },
  { query: "科技感背景", expectedCategory: "scene_design" },
  // ... 更多测试用例
];

async function evaluateRAG() {
  let correct = 0;

  for (const test of TEST_CASES) {
    const results = await searchKnowledge(test.query, { enableRerank: true });
    if (results[0]?.entry.category === test.expectedCategory) {
      correct++;
    }
  }

  const accuracy = correct / TEST_CASES.length;
  console.log(`Accuracy: ${(accuracy * 100).toFixed(1)}%`);

  return accuracy;
}
```

---

## 八、与 Agent 集成

```typescript
// lib/agent/tools/optimize-prompt.ts

import { searchKnowledge } from "@/lib/rag/search";

export const optimizePromptTool = {
  name: "optimize_prompt",

  handler: async (input: { analysis: any; style?: string }) => {
    // 1. RAG 检索相关知识
    const knowledge = await searchKnowledge(
      `${input.analysis.category} ${input.analysis.subcategory} ${input.style || ""}`,
      {
        category: ["product_category", "style_template", "lighting"],
        limit: 3,
        enableRerank: true,
      },
    );

    // 2. LLM 生成优化提示词
    const response = await client.chat.completions.create({
      model: "qwen3.5-plus",
      messages: [
        {
          role: "user",
          content: buildPromptGenerationMessage(input.analysis, knowledge),
        },
      ],
    });

    return {
      prompt: response.choices[0].message.content,
      knowledgeReferences: knowledge.map((k) => k.entry.id),
    };
  },
};
```

---

## 九、配置与环境变量

```bash
# .env.local

# 阿里云百炼 API
DASHSCOPE_API_KEY=sk-xxx

# Qdrant 向量数据库
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                    # 可选，云端需要

# Embedding 配置
EMBEDDING_MODEL=text-embedding-v3
EMBEDDING_DIMENSION=1024
```

---

**文档版本**: v2.0
**最后更新**: 2026-03-12
**主要变更**:

- LLM 服务改为阿里云百炼
- Embedding 模型改为 text-embedding-v3 (1024维)
- 添加 Reranker 模块
- 更新代码示例
