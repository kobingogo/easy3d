/**
 * 工作流执行引擎
 */

import type {
  Workflow,
  WorkflowStep,
  StepResult,
  ToolContext,
  ToolResult,
  StepInput
} from './types'
import { Tracer } from './tracer'
import { getTool } from './tools'

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

      // 开始追踪
      tracer.startStep(step.id, step.tool, step.input)

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

      // 处理失败
      if (stepResult.status === 'failed') {
        const handled = await this.handleError(step, stepResult, results, tracer)
        if (!handled) {
          tracer.complete('failed')
          workflow.status = 'failed'
          workflow.trace = tracer.getTrace()
          return { workflow, results }
        }
      }
    }

    tracer.complete('completed')
    workflow.status = 'completed'
    workflow.trace = tracer.getTrace()

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
        return true
      }

      // 填充有效的图片 URL
      if ('imageUrl' in result && !isValidImageUrl(result.imageUrl) && imageUrl && isValidImageUrl(imageUrl)) {
        result.imageUrl = imageUrl
      }

      // 如果 imageUrl 不是有效的 URL，清空它并设置 description
      if ('imageUrl' in result && !isValidImageUrl(result.imageUrl)) {
        result.imageUrl = undefined  // 清空无效的 URL
        // 如果没有 description，使用用户描述
        if (!result.description && userDescription) {
          result.description = userDescription
        }
      }

      // 确保有 description（用于 analyze_product）
      if (!result.description && userDescription) {
        result.description = userDescription
      }

      return result
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
        return input
    }

    // 处理 result 对象中的 imageUrl 和 description
    if (typeof result === 'object' && result !== null) {
      // 验证是否为有效的图片 URL
      const isValidImageUrl = (url: string | undefined): boolean => {
        if (!url || typeof url !== 'string') return false
        const trimmed = url.trim()
        if (trimmed === '') return false
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false
        return true
      }

      // 如果 imageUrl 不是有效的 URL，清空它并设置 description
      if ('imageUrl' in result && !isValidImageUrl(result.imageUrl)) {
        delete result.imageUrl  // 删除无效的 URL
        // 如果没有 description，使用用户描述
        if (!result.description && userDescription) {
          result.description = userDescription
        }
      }

      // 确保有 description（用于 analyze_product）
      if (!result.description && userDescription) {
        result.description = userDescription
      }
    }

    return result
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return obj

    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
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