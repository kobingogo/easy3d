/**
 * Agent 类型定义
 * 对齐 OpenAI Function Calling 格式
 */

// ==================== 工具定义 ====================

export interface Tool<TInput = any, TOutput = any> {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, any>
  }
  handler: ToolHandler<TInput, TOutput>
  config?: ToolConfig
}

export interface ToolConfig {
  timeout?: number
  retryable?: boolean
  maxRetries?: number
  cacheable?: boolean
}

export type ToolHandler<TInput, TOutput> = (
  input: TInput,
  context: ToolContext
) => Promise<ToolResult<TOutput>>

// ==================== 执行上下文 ====================

export interface ToolContext {
  workflowId: string
  stepId: string
  userId?: string
  previousResults: Map<string, any>
  tracer: any // Tracer type
  signal?: AbortSignal
}

// ==================== 执行结果 ====================

export interface ToolResult<T = any> {
  success: boolean
  data?: T
  error?: ToolError
  metadata?: ResultMetadata
}

export interface ResultMetadata {
  duration: number
  tokensUsed?: number
  modelUsed?: string
  cost?: number
}

export interface ToolError {
  code: string
  message: string
  details?: any
  recoverable: boolean
}

// ==================== 执行追踪 ====================

/**
 * 思维链记录（ReAct 模式）
 */
export interface Thought {
  id: string
  type: 'reasoning' | 'action' | 'observation'
  content: string
  timestamp: number
}

export interface ExecutionTrace {
  workflowId: string
  status: WorkflowStatus
  startTime: Date
  endTime?: Date
  totalDuration?: number
  totalTokens: number
  totalCost: number
  steps: StepTrace[]
}

// Tracer 类型引用
export type { Tracer } from './tracer'

export interface StepTrace {
  stepId: string
  toolName: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  input: any
  output?: any
  error?: string
  startTime: Date
  endTime?: Date
  duration?: number
  tokensUsed?: number
  cost?: number
  thoughts: Thought[]  // 思维链记录
}

// ==================== 工作流定义 ====================

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  steps: WorkflowStep[]
  currentStep?: number
  results: Map<string, StepResult>
  trace: ExecutionTrace
  createdAt: Date
  updatedAt: Date
}

export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface WorkflowStep {
  id: string
  tool: string
  input: StepInput
  description?: string
  condition?: StepCondition
  onError?: ErrorHandling
}

export type StepInput =
  | { type: 'static'; value: any }
  | { type: 'reference'; stepId: string; path: string }
  | { type: 'template'; template: string }

export interface StepCondition {
  type: 'if' | 'unless'
  expression: string
}

export interface ErrorHandling {
  strategy: 'abort' | 'skip' | 'retry'
  retryCount?: number
}

export interface StepResult {
  stepId: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  result?: ToolResult
  startedAt?: Date
  completedAt?: Date
}

// ==================== 商品分析结果 ====================

export interface ProductAnalysis {
  category: ProductCategory
  subcategory: string
  style: string[]
  colors: string[]
  materials: string[]
  targetAudience: string
  priceRange: 'budget' | 'mid' | 'premium' | 'luxury'
  keywords: string[]
  confidence: number
  suggestedStyle: StyleTemplate
}

export type ProductCategory =
  | 'clothing' | 'shoes' | 'beauty' | 'electronics'
  | 'home' | 'jewelry' | 'food' | 'bags' | 'accessories' | 'other'

export type StyleTemplate = 'minimal' | 'luxury' | 'tech' | 'natural' | 'trendy'

// ==================== 提示词优化结果 ====================

export interface OptimizedPrompt {
  prompt: string
  style: StyleTemplate
  lighting: string
  background: string
  camera: string
  keywords: string[]
  knowledgeReferences?: string[]
  productType?: string      // 商品英文类型（如 handbag, lipstick）
  confidence?: number       // 置信度
}

// ==================== 生成结果 ====================

export interface GenerationResult {
  taskId: string
  modelId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  modelUrl?: string
  thumbnailUrl?: string
  mode?: 'image_to_model' | 'text_to_model'
}

// ==================== 质量检查结果 ====================

export interface QualityCheckResult {
  overallScore: number
  dimensions: {
    geometry: number
    texture: number
    lighting: number
    completeness: number
  }
  issues: QualityIssue[]
  suggestions: string[]
}

export interface QualityIssue {
  type: 'critical' | 'warning' | 'info'
  message: string
  area: string
}

// ==================== 导出结果 ====================

export interface ExportResult {
  format: 'glb' | 'gif' | 'mp4'
  url: string
  size: number
  expiresAt: Date
}

// ==================== 执行计划 ====================

export interface ExecutionPlan {
  reasoning: string
  steps: PlannedStep[]
  estimatedTime: number
}

export interface PlannedStep {
  id: string
  tool: string
  description: string
  input: Record<string, any>
  dependencies: string[]
}

// ==================== 可视化数据 ====================

export interface VisualizationData {
  workflowId: string
  status: string
  duration: number
  tokens: number
  cost: string  // 显示 "包月" 而非金额
  steps: Array<{
    id: string
    tool: string
    status: string
    duration: number
    tokens: number
    cost: string
    thoughts: Thought[]  // 思维链记录
  }>
}