/**
 * 工作流执行引擎
 */

import type {
  Workflow,
  WorkflowStep,
  StepResult,
  ToolContext,
  ToolResult,
  StepInput,
  Thought
} from './types'
import { Tracer } from './tracer'
import { getTool } from './tools'
import {
  publishStepStartEvent,
  publishStepEndEvent,
  publishThoughtEvent,
  publishWorkflowCompleteEvent
} from './workflow-store'

export interface WorkflowEngineResult {
  workflow: Workflow
  results: Map<string, StepResult>
}

export class WorkflowEngine {
  /**
   * 执行工作流
   */
  async execute(workflow: Workflow, imageUrl?: string, userDescription?: string): Promise<WorkflowEngineResult> {
    const tracer = new Tracer(workflow.id)
    const results = new Map<string, StepResult>()

    workflow.trace = tracer.getTrace()
    workflow.status = 'running'

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      workflow.currentStep = i

      // 解析输入（提前解析，用于 SSE 事件）
      const input = this.resolveInput(step.input, results, imageUrl, userDescription)

      // 发布步骤开始事件
      await publishStepStartEvent(workflow.id, step.id, step.tool, input)

      // 开始追踪
      tracer.startStep(step.id, step.tool, input)

      // 记录 reasoning thought
      const reasoningThought = `分析任务：使用 ${step.tool} 工具处理 ${step.description || step.id}`
      tracer.recordThought(step.id, 'reasoning', reasoningThought)
      await publishThoughtEvent(workflow.id, step.id, {
        id: `${step.id}-thought-reasoning-${Date.now()}`,
        type: 'reasoning',
        content: reasoningThought,
        timestamp: Date.now()
      })

      // 执行步骤
      const stepResult = await this.executeStep(
        step,
        results,
        workflow.id,
        tracer,
        imageUrl,
        userDescription
      )
      results.set(step.id, stepResult)

      // 记录 action thought
      const actionThought = `执行 ${step.tool} 工具`
      tracer.recordThought(step.id, 'action', actionThought)
      await publishThoughtEvent(workflow.id, step.id, {
        id: `${step.id}-thought-action-${Date.now()}`,
        type: 'action',
        content: actionThought,
        timestamp: Date.now()
      })

      // 记录 observation thought
      const observationThought = stepResult.status === 'success'
        ? `工具执行成功：${JSON.stringify(stepResult.result?.data || {}).slice(0, 200)}`
        : `工具执行失败：${stepResult.result?.error?.message || 'Unknown error'}`
      tracer.recordThought(step.id, 'observation', observationThought)
      await publishThoughtEvent(workflow.id, step.id, {
        id: `${step.id}-thought-observation-${Date.now()}`,
        type: 'observation',
        content: observationThought,
        timestamp: Date.now()
      })

      // 发布步骤结束事件
      await publishStepEndEvent(
        workflow.id,
        step.id,
        stepResult.status,
        stepResult.result?.data,
        stepResult.result?.error?.message
      )

      // 处理失败
      if (stepResult.status === 'failed') {
        const handled = await this.handleError(step, stepResult, results, tracer)
        if (!handled) {
          tracer.complete('failed')
          workflow.status = 'failed'
          workflow.trace = tracer.getTrace()
          await publishWorkflowCompleteEvent(workflow.id, 'failed', workflow.trace)
          return { workflow, results }
        }
      }
    }

    tracer.complete('completed')
    workflow.status = 'completed'
    workflow.trace = tracer.getTrace()
    await publishWorkflowCompleteEvent(workflow.id, 'completed', workflow.trace)

    return { workflow, results }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(
    step: WorkflowStep,
    previousResults: Map<string, StepResult>,
    workflowId: string,
    tracer: Tracer,
    imageUrl?: string,
    userDescription?: string
  ): Promise<StepResult> {

    const tool = getTool(step.tool)

    if (!tool) {
      tracer.endStepFailed(step.id, `Tool ${step.tool} not found`)
      return {
        stepId: step.id,
        status: 'failed',
        result: {
          success: false,
          error: {
            code: 'TOOL_NOT_FOUND',
            message: `Tool ${step.tool} not found`,
            recoverable: false
          }
        },
        completedAt: new Date()
      }
    }

    // 解析输入
    const input = this.resolveInput(step.input, previousResults, imageUrl, userDescription)

    // 构建上下文
    const context: ToolContext = {
      workflowId,
      stepId: step.id,
      previousResults: new Map(
        Array.from(previousResults.entries()).map(([k, v]) => [k, v.result?.data])
      ),
      tracer
    }

    try {
      // 执行工具
      const result = await tool.handler(input, context)

      return {
        stepId: step.id,
        status: result.success ? 'success' : 'failed',
        result,
        completedAt: new Date()
      }
    } catch (error: any) {
      tracer.endStepFailed(step.id, error.message)

      return {
        stepId: step.id,
        status: 'failed',
        result: {
          success: false,
          error: {
            code: 'EXECUTION_ERROR',
            message: error.message,
            recoverable: true
          }
        },
        completedAt: new Date()
      }
    }
  }

  /**
   * 解析输入
   */
  private resolveInput(
    input: StepInput | Record<string, any>,
    previousResults: Map<string, StepResult>,
    imageUrl?: string,
    userDescription?: string
  ): any {
    // 如果是普通对象，直接返回（填充 imageUrl 和 description）
    if (typeof input === 'object' && !('type' in input)) {
      const result = { ...input }

      // 验证是否为有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (trimmed === '') return false
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        // 检测假 URL 或占位符
        const lowerUrl = trimmed.toLowerCase()
        if (lowerUrl.includes('example.com')) return false
        if (lowerUrl.includes('placeholder')) return false
        if (lowerUrl.includes('用户') || lowerUrl.includes('提供')) return false
        if (lowerUrl.includes('requires_user')) return false
        return true
      }

      // 【修复】如果传入了有效的 imageUrl，填充它
      if (imageUrl && isValidImageUrl(imageUrl)) {
        if (!result.imageUrl || !isValidImageUrl(result.imageUrl)) {
          result.imageUrl = imageUrl
        }
      }

      // 如果 imageUrl 不是有效的 URL，清空它
      if (result.imageUrl && !isValidImageUrl(result.imageUrl)) {
        delete result.imageUrl
      }

      // 确保有 description（用于 analyze_product）
      if (!result.description && userDescription) {
        result.description = userDescription
      }

      // 递归解析 result 中的嵌套引用对象
      return this.resolveNestedReferences(result, previousResults)
    }

    // 处理 StepInput 类型
    const stepInput = input as StepInput

    let result: any

    switch (stepInput.type) {
      case 'static':
        result = { ...stepInput.value }
        break

      case 'reference':
        const stepResult = previousResults.get(stepInput.stepId)
        result = this.getNestedValue(stepResult?.result?.data, stepInput.path)
        break

      case 'template':
        result = this.renderTemplate(stepInput.template, previousResults)
        break

      default:
        // 处理直接传入的对象（可能包含引用）
        result = { ...input }
    }

    // 递归解析 result 中的引用对象 { type: 'reference', stepId, path }
    result = this.resolveNestedReferences(result, previousResults)

    // 处理 result 对象中的 imageUrl 和 description
    if (typeof result === 'object' && result !== null) {
      // 验证是否为有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (trimmed === '') return false
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        // 检测假 URL 或占位符
        const lowerUrl = trimmed.toLowerCase()
        if (lowerUrl.includes('example.com')) return false
        if (lowerUrl.includes('placeholder')) return false
        if (lowerUrl.includes('用户') || lowerUrl.includes('提供')) return false
        if (lowerUrl.includes('requires_user')) return false
        return true
      }

      // 【修复】如果传入了有效的 imageUrl，填充它
      if (imageUrl && isValidImageUrl(imageUrl)) {
        // 如果 result 中没有 imageUrl 或 imageUrl 无效，使用传入的 imageUrl
        if (!result.imageUrl || !isValidImageUrl(result.imageUrl)) {
          result.imageUrl = imageUrl
          console.log(`[resolveInput] Injected imageUrl: ${imageUrl}`)
        }
      }

      // 如果 imageUrl 不是有效的 URL，清空它
      if (result.imageUrl && !isValidImageUrl(result.imageUrl)) {
        delete result.imageUrl
      }

      // 确保有 description（用于 analyze_product）
      if (!result.description && userDescription) {
        result.description = userDescription
      }
    }

    return result
  }

  /**
   * 递归解析嵌套的引用对象
   */
  private resolveNestedReferences(obj: any, previousResults: Map<string, StepResult>): any {
    if (!obj || typeof obj !== 'object') return obj

    // 检查是否是引用对象
    if (obj.type === 'reference' && obj.stepId && obj.path) {
      const stepResult = previousResults.get(obj.stepId)
      const value = this.getNestedValue(stepResult?.result?.data, obj.path)
      console.log(`[resolveNestedReferences] Resolving reference: stepId=${obj.stepId}, path=${obj.path}`)
      console.log(`[resolveNestedReferences] stepResult exists: ${!!stepResult}, result exists: ${!!stepResult?.result}, data exists: ${!!stepResult?.result?.data}`)
      console.log(`[resolveNestedReferences] Resolved value:`, JSON.stringify(value).slice(0, 300))
      return value
    }

    // 递归处理数组和对象
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveNestedReferences(item, previousResults))
    }

    const result: any = {}
    for (const key of Object.keys(obj)) {
      result[key] = this.resolveNestedReferences(obj[key], previousResults)
    }
    return result
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj) return obj

    // 特殊处理：空路径或 "." 表示整个对象
    if (!path || path === '.' || path === '') {
      return obj
    }

    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
      // 跳过空键（处理 "data." 或 ".data" 等情况）
      if (key === '') continue

      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        return undefined
      }
    }

    return result
  }

  /**
   * 渲染模板
   */
  private renderTemplate(template: string, previousResults: Map<string, StepResult>): string {
    let result = template

    // 替换 {{stepId.path}} 格式的引用
    const matches = template.match(/\{\{([^}]+)\}\}/g)
    if (matches) {
      for (const match of matches) {
        const ref = match.slice(2, -2) // 移除 {{ }}
        const [stepId, ...pathParts] = ref.split('.')
        const path = pathParts.join('.')

        const stepResult = previousResults.get(stepId)
        const value = this.getNestedValue(stepResult?.result?.data, path)

        if (value !== undefined) {
          result = result.replace(match, String(value))
        }
      }
    }

    return result
  }

  /**
   * 错误处理
   */
  private async handleError(
    step: WorkflowStep,
    stepResult: StepResult,
    results: Map<string, StepResult>,
    tracer: Tracer
  ): Promise<boolean> {
    const errorHandling = step.onError || { strategy: 'abort' }

    switch (errorHandling.strategy) {
      case 'skip':
        tracer.skipStep(step.id, 'Skipped due to error')
        return true

      case 'retry':
        // 简化重试逻辑
        return false

      default:
        return false
    }
  }
}