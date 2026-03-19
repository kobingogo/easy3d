# Agent 工具接口设计文档

**版本**: v2.0
**创建时间**: 2026-03-12
**更新时间**: 2026-03-12

---

## 一、技术选型

### 1.1 LLM 服务（阿里云百炼）

| 模型类型      | 模型名称          | 用途             | 说明           |
| ------------- | ----------------- | ---------------- | -------------- |
| **文本生成**  | qwen3.5-plus      | 规划、提示词生成 | 平衡性能与成本 |
| **视觉理解**  | qwen-vl-max       | 商品图片分析     | 支持图像理解   |
| **Embedding** | text-embedding-v3 | RAG 向量化       | 1024 维        |

### 1.2 Agent 框架选型

| 方案         | 选择                         | 理由                     |
| ------------ | ---------------------------- | ------------------------ |
| **框架**     | 自定义实现                   | 面试能讲清原理，灵活可控 |
| **工具定义** | OpenAI Function Calling 格式 | 业界标准，兼容性好       |
| **规划策略** | ReAct + 预定义模板           | 灵活且稳定               |

---

## 二、Agent 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户输入                                │
│  "帮我生成一个适合小红书的女包 3D 展示"                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Planner (规划器)                          │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │  ReAct Planner      │ or │  Template Planner   │        │
│  │  (复杂任务/动态规划) │    │  (简单任务/预定义)   │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 执行计划
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Engine (执行引擎)                │
│  - 步骤调度                                                  │
│  - 状态管理                                                  │
│  - 错误处理                                                  │
│  - Tracing (执行追踪) ← 新增                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 调用工具
┌─────────────────────────────────────────────────────────────┐
│                    Tools (工具集)                            │
│  OpenAI Function Calling 格式定义                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │analyze   │ │optimize  │ │generate  │ │quality   │       │
│  │_product  │ │_prompt   │ │_3d       │ │_check    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、核心类型定义

### 3.1 工具定义（对齐 OpenAI Function Calling）

```typescript
// lib/agent/types.ts

import { JSONSchema7 } from "json-schema";

// ==================== 工具定义（OpenAI 格式）====================

/**
 * 工具定义 - 对齐 OpenAI Function Calling 格式
 * 好处：业界标准，方便切换不同 LLM 提供商
 */
interface Tool<TInput = any, TOutput = any> {
  type: "function";
  function: {
    name: string; // 工具名称
    description: string; // 工具描述（给 LLM 看）
    parameters: JSONSchema7; // 输入参数 Schema（标准 JSON Schema）
  };
  handler: ToolHandler<TInput, TOutput>; // 执行函数
  config?: ToolConfig; // 工具配置
}

interface ToolConfig {
  timeout?: number; // 超时时间 (ms)
  retryable?: boolean; // 是否可重试
  maxRetries?: number; // 最大重试次数
  cacheable?: boolean; // 是否可缓存
  cacheKey?: (input: any) => string; // 缓存 key 生成函数
}

type ToolHandler<TInput, TOutput> = (
  input: TInput,
  context: ToolContext,
) => Promise<ToolResult<TOutput>>;

// ==================== 执行上下文 ====================

interface ToolContext {
  workflowId: string;
  stepId: string;
  userId: string;
  previousResults: Map<string, any>; // 前序步骤结果
  logger: Logger;
  tracer: Tracer; // 执行追踪器 ← 新增
  signal?: AbortSignal; // 用于取消
}

// ==================== 执行结果 ====================

interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: ToolError;
  metadata?: ResultMetadata;
}

interface ResultMetadata {
  duration: number; // 执行耗时 (ms)
  tokensUsed?: number; // Token 使用量
  modelUsed?: string; // 使用的模型
  cost?: number; // 成本（元）
  [key: string]: any;
}

interface ToolError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

// ==================== 执行追踪 ====================

interface ExecutionTrace {
  workflowId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  totalTokens: number;
  totalCost: number;
  steps: StepTrace[];
}

interface StepTrace {
  stepId: string;
  toolName: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  input: any;
  output?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tokensUsed?: number;
  cost?: number;
  retryCount?: number;
}

// ==================== 工作流定义 ====================

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  currentStep?: number;
  results: StepResult[];
  trace: ExecutionTrace; // 执行追踪 ← 新增
  createdAt: Date;
  updatedAt: Date;
}

type WorkflowStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

interface WorkflowStep {
  id: string;
  tool: string;
  input: StepInput;
  condition?: StepCondition;
  onError?: ErrorHandling;
}

type StepInput =
  | { type: "static"; value: any }
  | { type: "reference"; stepId: string; path: string }
  | { type: "template"; template: string };

interface StepResult {
  stepId: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  result?: ToolResult;
  startedAt?: Date;
  completedAt?: Date;
  retries?: number;
}
```

### 3.2 Tracer 模块

```typescript
// lib/agent/tracer.ts

/**
 * 执行追踪器
 * 用于记录工作流执行过程，方便调试和面试展示
 */
export class Tracer {
  private trace: ExecutionTrace;
  private costCalculator: CostCalculator;

  constructor(workflowId: string) {
    this.trace = {
      workflowId,
      status: "pending",
      startTime: new Date(),
      totalTokens: 0,
      totalCost: 0,
      steps: [],
    };
    this.costCalculator = new CostCalculator();
  }

  /**
   * 开始步骤
   */
  startStep(stepId: string, toolName: string, input: any): void {
    this.trace.steps.push({
      stepId,
      toolName,
      status: "running",
      input,
      startTime: new Date(),
    });
  }

  /**
   * 结束步骤（成功）
   */
  endStepSuccess(
    stepId: string,
    output: any,
    metadata?: { tokensUsed?: number; modelUsed?: string },
  ): void {
    const step = this.trace.steps.find((s) => s.stepId === stepId);
    if (!step) return;

    step.status = "success";
    step.output = output;
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();

    if (metadata?.tokensUsed) {
      step.tokensUsed = metadata.tokensUsed;
      step.cost = this.costCalculator.calculate(
        metadata.modelUsed,
        metadata.tokensUsed,
      );
      this.trace.totalTokens += metadata.tokensUsed;
      this.trace.totalCost += step.cost;
    }
  }

  /**
   * 结束步骤（失败）
   */
  endStepFailed(stepId: string, error: string): void {
    const step = this.trace.steps.find((s) => s.stepId === stepId);
    if (!step) return;

    step.status = "failed";
    step.error = error;
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();
  }

  /**
   * 完成工作流
   */
  complete(status: "completed" | "failed" | "cancelled"): void {
    this.trace.status = status;
    this.trace.endTime = new Date();
    this.trace.totalDuration =
      this.trace.endTime.getTime() - this.trace.startTime.getTime();
  }

  /**
   * 获取追踪数据
   */
  getTrace(): ExecutionTrace {
    return this.trace;
  }

  /**
   * 导出为可视化数据（面试展示用）
   */
  exportForVisualization(): VisualizationData {
    return {
      workflowId: this.trace.workflowId,
      status: this.trace.status,
      duration: this.trace.totalDuration || 0,
      tokens: this.trace.totalTokens,
      cost: this.trace.totalCost.toFixed(4),
      steps: this.trace.steps.map((step) => ({
        id: step.stepId,
        tool: step.toolName,
        status: step.status,
        duration: step.duration || 0,
        tokens: step.tokensUsed || 0,
        cost: step.cost?.toFixed(4) || "0.0000",
      })),
    };
  }
}

/**
 * 成本计算器
 */
class CostCalculator {
  // 阿里云百炼价格（元/千tokens）
  private pricing: Record<string, { input: number; output: number }> = {
    "qwen3.5-plus": { input: 0.0008, output: 0.002 },
    "qwen-turbo": { input: 0.0003, output: 0.0006 },
    "qwen-vl-max": { input: 0.02, output: 0.02 },
    "text-embedding-v3": { input: 0.0007, output: 0 },
  };

  calculate(model: string, tokens: number): number {
    const price = this.pricing[model] || { input: 0.001, output: 0.001 };
    return ((tokens / 1000) * (price.input + price.output)) / 2;
  }
}

interface VisualizationData {
  workflowId: string;
  status: string;
  duration: number;
  tokens: number;
  cost: string;
  steps: Array<{
    id: string;
    tool: string;
    status: string;
    duration: number;
    tokens: number;
    cost: string;
  }>;
}
```

---

## 四、LLM 客户端封装

```typescript
// lib/llm/client.ts

import OpenAI from "openai";

/**
 * 阿里云百炼 LLM 客户端
 * 兼容 OpenAI SDK 格式
 */
class BailianClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

  /**
   * 文本生成
   */
  async generate(options: {
    model?: "qwen3.5-plus" | "qwen-turbo" | "qwen-max";
    messages: Array<{ role: string; content: string }>;
    tools?: Tool[];
    temperature?: number;
    responseFormat?: { type: "text" | "json_object" };
  }): Promise<GenerateResult> {
    const {
      model = "qwen3.5-plus",
      messages,
      tools,
      temperature = 0.7,
      responseFormat,
    } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      tools: tools?.map((t) => ({
        type: "function",
        function: t.function,
      })),
      response_format: responseFormat,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || "",
      toolCalls: choice.message.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * 视觉理解
   */
  async vision(options: {
    model?: "qwen-vl-max" | "qwen-vl-plus";
    imageUrls: string[];
    prompt: string;
  }): Promise<VisionResult> {
    const { model = "qwen-vl-max", imageUrls, prompt } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            ...imageUrls.map((url) => ({
              type: "image_url" as const,
              image_url: { url },
            })),
            { type: "text" as const, text: prompt },
          ],
        },
      ],
    });

    return {
      content: response.choices[0].message.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }
}

// 单例导出
export const llm = new BailianClient();

// 类型定义
interface GenerateResult {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: any;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface VisionResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

---

## 五、工具定义详解

### 5.1 商品分析工具 (analyze_product)

```typescript
// lib/agent/tools/analyze-product.ts

import { Tool } from "../types";
import { llm } from "@/lib/llm/client";

export const analyzeProductTool: Tool<
  AnalyzeProductInput,
  AnalyzeProductOutput
> = {
  type: "function",
  function: {
    name: "analyze_product",
    description: "分析商品图片，识别类别、风格、颜色、材质等属性",
    parameters: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "商品图片 URL",
        },
      },
      required: ["imageUrl"],
    },
  },

  config: {
    timeout: 30000,
    retryable: true,
    maxRetries: 2,
  },

  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      // 调用视觉模型分析
      const result = await llm.vision({
        model: "qwen-vl-max",
        imageUrls: [input.imageUrl],
        prompt: ANALYZE_PROMPT,
      });

      const analysis = parseAnalysisResponse(result.content);

      // 记录追踪
      context.tracer?.endStepSuccess(context.stepId, analysis, {
        tokensUsed: result.usage.totalTokens,
        modelUsed: "qwen-vl-max",
      });

      return {
        success: true,
        data: analysis,
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: result.usage.totalTokens,
          modelUsed: "qwen-vl-max",
        },
      };
    } catch (error) {
      context.tracer?.endStepFailed(context.stepId, error.message);

      return {
        success: false,
        error: {
          code: "ANALYSIS_FAILED",
          message: error.message,
          recoverable: true,
        },
      };
    }
  },
};

// ==================== 输入输出类型 ====================

interface AnalyzeProductInput {
  imageUrl: string;
}

interface AnalyzeProductOutput {
  category: ProductCategory;
  subcategory: string;
  style: string[];
  colors: string[];
  materials: string[];
  targetAudience: string;
  priceRange: "budget" | "mid" | "premium" | "luxury";
  keywords: string[];
  confidence: number;
  suggestedStyle: StyleTemplate;
}

type ProductCategory =
  | "clothing"
  | "shoes"
  | "beauty"
  | "electronics"
  | "home"
  | "jewelry"
  | "food"
  | "bags"
  | "accessories"
  | "other";

type StyleTemplate = "minimal" | "luxury" | "tech" | "natural" | "trendy";

// ==================== 分析 Prompt ====================

const ANALYZE_PROMPT = `
你是一个电商产品分析专家。请分析这张商品图片，返回以下信息：

1. 商品类别：从 [clothing, shoes, beauty, electronics, home, jewelry, food, bags, accessories, other] 中选择
2. 子类别：具体的商品类型
3. 风格标签：如 [简约, 潮流, 商务, 可爱, 复古] 等
4. 主色调：识别 2-3 个主要颜色
5. 材质：如 [皮革, 金属, 塑料, 棉麻] 等
6. 目标用户：如 [年轻女性, 商务人士, 学生] 等
7. 价格定位：budget(平价) / mid(中端) / premium(高端) / luxury(奢侈)
8. 关键词：5-8 个描述关键词
9. 推荐风格：minimal(极简) / luxury(奢华) / tech(科技) / natural(自然) / trendy(潮流)
10. 置信度：0-1 之间的数字

请以 JSON 格式返回结果。
`;
```

### 5.2 提示词优化工具 (optimize_prompt)

```typescript
// lib/agent/tools/optimize-prompt.ts

import { Tool } from "../types";
import { llm } from "@/lib/llm/client";
import { searchKnowledge } from "@/lib/rag/search";

export const optimizePromptTool: Tool<
  OptimizePromptInput,
  OptimizePromptOutput
> = {
  type: "function",
  function: {
    name: "optimize_prompt",
    description: "基于 RAG 检索和商品分析，生成优化的 3D 生成提示词",
    parameters: {
      type: "object",
      properties: {
        analysis: {
          type: "object",
          description: "商品分析结果（来自 analyze_product）",
        },
        style: {
          type: "string",
          enum: ["default", "luxury", "tech", "natural", "trendy"],
          description: "展示风格",
          default: "default",
        },
        platform: {
          type: "string",
          enum: ["taobao", "xiaohongshu", "douyin", "amazon"],
          description: "目标平台",
        },
      },
      required: ["analysis"],
    },
  },

  config: {
    timeout: 15000,
    retryable: true,
    maxRetries: 2,
  },

  handler: async (input, context) => {
    const startTime = Date.now();
    const { analysis, style = "default", platform } = input;

    try {
      // 1. RAG 检索相关知识
      const knowledge = await searchKnowledge(
        `${analysis.category} ${analysis.subcategory} ${style}`,
        {
          category: ["product_category", "style_template", "lighting"],
          limit: 3,
          enableRerank: true,
        },
      );

      // 2. 选择模板
      const template = PROMPT_TEMPLATES[style] || PROMPT_TEMPLATES.default;

      // 3. 生成优化提示词
      const result = await llm.generate({
        model: "qwen3.5-plus",
        messages: [
          {
            role: "user",
            content: buildPromptGenerationMessage(
              analysis,
              knowledge,
              template,
              platform,
            ),
          },
        ],
        responseFormat: { type: "json_object" },
      });

      const optimizedPrompt = parsePromptResponse(result.content);

      context.tracer?.endStepSuccess(context.stepId, optimizedPrompt, {
        tokensUsed: result.usage.totalTokens,
        modelUsed: "qwen3.5-plus",
      });

      return {
        success: true,
        data: {
          ...optimizedPrompt,
          knowledgeReferences: knowledge.map((k) => k.entry.id),
        },
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: result.usage.totalTokens,
          modelUsed: "qwen3.5-plus",
        },
      };
    } catch (error) {
      context.tracer?.endStepFailed(context.stepId, error.message);

      return {
        success: false,
        error: {
          code: "PROMPT_OPTIMIZATION_FAILED",
          message: error.message,
          recoverable: true,
        },
      };
    }
  },
};

// 提示词模板
const PROMPT_TEMPLATES: Record<string, string> = {
  default: `Professional product photography of {product}, {lighting}, {background}, 4K, highly detailed, e-commerce ready`,
  luxury: `Luxury product showcase of {product}, premium lighting with soft shadows, elegant gradient background, 8K, photorealistic, high-end commercial photography`,
  tech: `High-tech product render of {product}, futuristic lighting with blue accents, metallic reflective background, 8K, hyperrealistic, product visualization`,
  natural: `Natural product photography of {product}, soft natural daylight, organic background with green elements, 4K, lifestyle product shot, clean and fresh aesthetic`,
  trendy: `Trendy product showcase of {product}, dynamic angle, vibrant colors, modern aesthetic, social media ready, 4K, eye-catching composition`,
};
```

### 5.3 其他工具（简化示例）

```typescript
// lib/agent/tools/generate-3d.ts

export const generate3DTool: Tool = {
  type: "function",
  function: {
    name: "generate_3d",
    description: "调用 Tripo API 生成 3D 模型",
    parameters: {
      type: "object",
      properties: {
        imageUrl: { type: "string", description: "商品图片 URL" },
        prompt: { type: "string", description: "优化后的提示词" },
        quality: {
          type: "string",
          enum: ["standard", "hd"],
          default: "standard",
        },
      },
      required: ["imageUrl", "prompt"],
    },
  },
  config: { timeout: 120000, retryable: true, maxRetries: 1 },
  handler: async (input, context) => {
    /* ... */
  },
};

// lib/agent/tools/quality-check.ts

export const qualityCheckTool: Tool = {
  type: "function",
  function: {
    name: "quality_check",
    description: "检查 3D 模型质量，识别潜在问题",
    parameters: {
      type: "object",
      properties: {
        modelUrl: { type: "string", description: "3D 模型 URL" },
        thumbnailUrl: { type: "string", description: "模型预览图 URL" },
        originalImageUrl: { type: "string", description: "原始商品图片 URL" },
      },
      required: ["modelUrl", "thumbnailUrl"],
    },
  },
  config: { timeout: 30000, retryable: false },
  handler: async (input, context) => {
    /* ... */
  },
};

// lib/agent/tools/export-model.ts

export const exportModelTool: Tool = {
  type: "function",
  function: {
    name: "export_model",
    description: "导出 3D 模型为指定格式",
    parameters: {
      type: "object",
      properties: {
        modelUrl: { type: "string", description: "3D 模型 URL" },
        format: {
          type: "string",
          enum: ["glb", "gif", "mp4"],
          description: "导出格式",
        },
      },
      required: ["modelUrl", "format"],
    },
  },
  config: { timeout: 60000, retryable: true, maxRetries: 1 },
  handler: async (input, context) => {
    /* ... */
  },
};
```

---

## 六、工具注册表

```typescript
// lib/agent/tools/index.ts

import { Tool } from "../types";
import { analyzeProductTool } from "./analyze-product";
import { optimizePromptTool } from "./optimize-prompt";
import { generate3DTool } from "./generate-3d";
import { qualityCheckTool } from "./quality-check";
import { exportModelTool } from "./export-model";

/**
 * 工具注册表
 * 统一管理所有可用工具
 */
export const toolRegistry: Map<string, Tool> = new Map([
  ["analyze_product", analyzeProductTool],
  ["optimize_prompt", optimizePromptTool],
  ["generate_3d", generate3DTool],
  ["quality_check", qualityCheckTool],
  ["export_model", exportModelTool],
]);

/**
 * 获取工具定义列表（给 LLM 使用）
 */
export function getToolDefinitions(): Array<{
  type: "function";
  function: any;
}> {
  return Array.from(toolRegistry.values()).map((tool) => ({
    type: "function",
    function: tool.function,
  }));
}

/**
 * 获取工具
 */
export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name);
}
```

---

## 七、ReAct 规划器

```typescript
// lib/agent/planner.ts

import { llm } from "@/lib/llm/client";
import { getToolDefinitions } from "./tools";

export class ReActPlanner {
  /**
   * 判断是否使用 ReAct 动态规划
   */
  shouldUseReAct(userInput: string): boolean {
    const complexIndicators = [
      "定制",
      "自定义",
      "特殊",
      "复杂",
      "多",
      "同时",
      "然后",
      "再",
      "同时",
    ];
    return complexIndicators.some((indicator) => userInput.includes(indicator));
  }

  /**
   * 使用 ReAct 模式规划任务
   */
  async plan(userInput: string): Promise<ExecutionPlan> {
    const toolDefinitions = getToolDefinitions();

    const result = await llm.generate({
      model: "qwen3.5-plus",
      messages: [
        {
          role: "user",
          content: `
你是一个任务规划专家。用户想要完成一个任务，请分析并制定执行计划。

用户输入：${userInput}

可用工具：
${toolDefinitions.map((t) => `- ${t.function.name}: ${t.function.description}`).join("\n")}

请按照 ReAct (Reason-Act-Observe) 模式规划：

1. **分析任务**：理解用户意图，确定需要哪些工具
2. **制定计划**：列出执行步骤，包括输入参数和依赖关系
3. **预估时间**：估计总执行时间

请返回 JSON 格式：
{
  "reasoning": "任务分析过程",
  "steps": [
    {
      "id": "step_1",
      "tool": "工具名称",
      "description": "步骤描述",
      "input": { ... },
      "dependencies": []
    }
  ],
  "estimatedTime": 60
}
`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    return JSON.parse(result.content);
  }
}
```

---

## 八、执行引擎

```typescript
// lib/agent/workflow-engine.ts

import { Tracer } from "./tracer";
import { getTool } from "./tools";
import { Workflow, WorkflowStep, StepResult, ToolContext } from "./types";

export class WorkflowEngine {
  /**
   * 执行工作流
   */
  async execute(workflow: Workflow): Promise<WorkflowResult> {
    const tracer = new Tracer(workflow.id);
    const results = new Map<string, StepResult>();

    workflow.trace = tracer.getTrace();

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.currentStep = i;
      workflow.status = "running";

      // 开始追踪
      tracer.startStep(step.id, step.tool, step.input);

      // 执行步骤
      const stepResult = await this.executeStep(
        step,
        results,
        workflow.id,
        tracer,
      );
      results.set(step.id, stepResult);

      // 处理失败
      if (stepResult.status === "failed") {
        const handled = await this.handleError(
          step,
          stepResult,
          results,
          tracer,
        );
        if (!handled) {
          tracer.complete("failed");
          workflow.status = "failed";
          return { workflow, results };
        }
      }
    }

    tracer.complete("completed");
    workflow.status = "completed";
    workflow.trace = tracer.getTrace();

    return { workflow, results };
  }

  private async executeStep(
    step: WorkflowStep,
    previousResults: Map<string, StepResult>,
    workflowId: string,
    tracer: Tracer,
  ): Promise<StepResult> {
    const tool = getTool(step.tool);

    if (!tool) {
      tracer.endStepFailed(step.id, `Tool ${step.tool} not found`);
      return {
        stepId: step.id,
        status: "failed",
        result: {
          success: false,
          error: {
            code: "TOOL_NOT_FOUND",
            message: `Tool ${step.tool} not found`,
            recoverable: false,
          },
        },
      };
    }

    // 解析输入
    const input = this.resolveInput(step.input, previousResults);

    // 构建上下文
    const context: ToolContext = {
      workflowId,
      stepId: step.id,
      userId: "", // 填充
      previousResults,
      logger: createLogger(step.id),
      tracer,
    };

    // 执行工具
    const result = await tool.handler(input, context);

    return {
      stepId: step.id,
      status: result.success ? "success" : "failed",
      result,
      completedAt: new Date(),
    };
  }

  private resolveInput(
    input: StepInput,
    previousResults: Map<string, StepResult>,
  ): any {
    switch (input.type) {
      case "static":
        return input.value;
      case "reference":
        const stepResult = previousResults.get(input.stepId);
        return getNestedValue(stepResult?.result?.data, input.path);
      case "template":
        return renderTemplate(input.template, previousResults);
    }
  }

  private async handleError(
    step: WorkflowStep,
    stepResult: StepResult,
    results: Map<string, StepResult>,
    tracer: Tracer,
  ): Promise<boolean> {
    const errorHandling = step.onError || { strategy: "abort" };

    switch (errorHandling.strategy) {
      case "skip":
        return true;
      case "retry":
        // 重试逻辑
        for (let r = 0; r < (errorHandling.retryCount || 1); r++) {
          const retryResult = await this.executeStep(step, results, "", tracer);
          if (retryResult.status === "success") {
            results.set(step.id, retryResult);
            return true;
          }
        }
        return false;
      default:
        return false;
    }
  }
}
```

---

## 九、错误处理策略

| 错误类型     | 错误码               | 恢复策略             | 说明           |
| ------------ | -------------------- | -------------------- | -------------- |
| API 超时     | TIMEOUT              | 重试，最多 2 次      | 网络问题       |
| API 限流     | RATE_LIMITED         | 等待 60 秒后重试     | 百炼 API 限制  |
| 模型分析失败 | ANALYSIS_FAILED      | 返回默认分析结果     | 降级处理       |
| 生成失败     | GENERATION_FAILED    | 重试或降级到标准质量 | Tripo API 问题 |
| 质量检查失败 | QUALITY_CHECK_FAILED | 记录问题，继续流程   | 非关键步骤     |
| 导出失败     | EXPORT_FAILED        | 重试 1 次            | 渲染问题       |

---

## 十、配置与环境变量

```bash
# .env.local

# 阿里云百炼 API
DASHSCOPE_API_KEY=sk-xxx

# Tripo AI API
TRIPO_API_KEY=xxx

# Qdrant 向量数据库
QDRANT_URL=http://localhost:6333
```

---

**文档版本**: v2.0
**最后更新**: 2026-03-12
**主要变更**:

- LLM 服务改为阿里云百炼
- 工具定义对齐 OpenAI Function Calling 格式
- 添加 Tracer 执行追踪模块
- 添加成本计算功能
