/**
 * 执行追踪器
 * 用于记录工作流执行过程，方便调试和面试展示
 *
 * 注意：百炼 Coding Plan Pro 为包月套餐，不按 token 计费
 */

import type { ExecutionTrace, StepTrace, VisualizationData } from './types'
import { calculateCost } from './llm'

export class Tracer {
  private trace: ExecutionTrace

  constructor(workflowId: string) {
    this.trace = {
      workflowId,
      status: 'pending',
      startTime: new Date(),
      totalTokens: 0,
      totalCost: 0,  // 包月套餐，成本显示为 0
      steps: []
    }
  }

  /**
   * 开始步骤
   */
  startStep(stepId: string, toolName: string, input: any): void {
    this.trace.steps.push({
      stepId,
      toolName,
      status: 'running',
      input,
      startTime: new Date()
    })
  }

  /**
   * 结束步骤（成功）
   */
  endStepSuccess(
    stepId: string,
    output: any,
    metadata?: { tokensUsed?: number; modelUsed?: string }
  ): void {
    const step = this.trace.steps.find(s => s.stepId === stepId)
    if (!step) return

    step.status = 'success'
    step.output = output
    step.endTime = new Date()
    step.duration = step.endTime.getTime() - step.startTime.getTime()

    if (metadata?.tokensUsed) {
      step.tokensUsed = metadata.tokensUsed
      step.cost = calculateCost(metadata.modelUsed || 'qwen3.5-plus', metadata.tokensUsed)
      this.trace.totalTokens += metadata.tokensUsed
      this.trace.totalCost += step.cost
    }
  }

  /**
   * 结束步骤（失败）
   */
  endStepFailed(stepId: string, error: string): void {
    const step = this.trace.steps.find(s => s.stepId === stepId)
    if (!step) return

    step.status = 'failed'
    step.error = error
    step.endTime = new Date()
    step.duration = step.endTime.getTime() - step.startTime.getTime()
  }

  /**
   * 跳过步骤
   */
  skipStep(stepId: string, reason: string): void {
    const step = this.trace.steps.find(s => s.stepId === stepId)
    if (!step) return

    step.status = 'skipped'
    step.error = reason
    step.endTime = new Date()
    step.duration = step.endTime.getTime() - step.startTime.getTime()
  }

  /**
   * 完成工作流
   */
  complete(status: 'completed' | 'failed' | 'cancelled'): void {
    this.trace.status = status
    this.trace.endTime = new Date()
    this.trace.totalDuration = this.trace.endTime.getTime() - this.trace.startTime.getTime()
  }

  /**
   * 获取追踪数据
   */
  getTrace(): ExecutionTrace {
    return this.trace
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
      cost: '包月',  // 显示包月而非金额
      steps: this.trace.steps.map(step => ({
        id: step.stepId,
        tool: step.toolName,
        status: step.status,
        duration: step.duration || 0,
        tokens: step.tokensUsed || 0,
        cost: '包月'
      }))
    }
  }

  /**
   * 重置追踪器
   */
  reset(): void {
    this.trace = {
      workflowId: this.trace.workflowId,
      status: 'pending',
      startTime: new Date(),
      totalTokens: 0,
      totalCost: 0,
      steps: []
    }
  }
}