/**
 * 工作流状态存储
 * 用于异步执行和状态查询
 *
 * 使用文件持久化存储解决 Next.js serverless 函数内存隔离问题
 */

import type { Workflow, StepResult, Thought } from './types'
import {
  saveWorkflowStatus as persistWorkflow,
  getWorkflowStatus as loadWorkflowStatus,
  deleteWorkflowStatus as removeWorkflow,
  getEventBuffer,
  addEventToBuffer,
  clearEventBuffer as clearBuffer,
  type SerializableWorkflowStatus,
  type SSEEvent
} from './workflow-storage'

// 重新导出 SSEEvent 类型
export type { SSEEvent }

export interface WorkflowStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  startedAt: Date
  completedAt?: Date
  error?: string
  results?: Map<string, StepResult>
  workflow?: Workflow
}

// SSE 订阅者类型 - 支持异步回调
type SSESubscriber = (event: SSEEvent) => void | Promise<void>

// SSE 订阅者存储（运行时内存，仅在当前连接有效）
const subscribers = new Map<string, Set<SSESubscriber>>()

/**
 * 将 WorkflowStatus 转换为可序列化格式
 */
function toSerializable(status: WorkflowStatus): SerializableWorkflowStatus {
  return {
    id: status.id,
    status: status.status,
    currentStep: status.currentStep,
    totalSteps: status.totalSteps,
    startedAt: status.startedAt.toISOString(),
    completedAt: status.completedAt?.toISOString(),
    error: status.error,
    results: status.results ? Object.fromEntries(
      Array.from(status.results.entries()).map(([k, v]) => [k, v])
    ) : undefined,
    workflow: status.workflow
  }
}

/**
 * 从可序列化格式转换为 WorkflowStatus
 */
function fromSerializable(serialized: SerializableWorkflowStatus): WorkflowStatus {
  return {
    id: serialized.id,
    status: serialized.status,
    currentStep: serialized.currentStep,
    totalSteps: serialized.totalSteps,
    startedAt: new Date(serialized.startedAt),
    completedAt: serialized.completedAt ? new Date(serialized.completedAt) : undefined,
    error: serialized.error,
    results: serialized.results ? new Map(Object.entries(serialized.results)) : undefined,
    workflow: serialized.workflow
  }
}

/**
 * 订阅工作流事件
 * 会自动重放缓冲区中的历史事件
 */
export function subscribeToWorkflow(workflowId: string, callback: SSESubscriber): () => void {
  if (!subscribers.has(workflowId)) {
    subscribers.set(workflowId, new Set())
  }
  subscribers.get(workflowId)!.add(callback)

  // 重放缓冲区中的历史事件
  const bufferedEvents = getEventBuffer(workflowId)
  if (bufferedEvents && bufferedEvents.length > 0) {
    console.log(`[SSE] Replaying ${bufferedEvents.length} buffered events for workflow ${workflowId}`)
    bufferedEvents.forEach(event => {
      const result = callback(event)
      if (result instanceof Promise) {
        result.catch(err => console.error('[SSE] Buffered event callback error:', err))
      }
    })
  }

  // 返回取消订阅函数
  return () => {
    subscribers.get(workflowId)?.delete(callback)
  }
}

/**
 * 发布 SSE 事件
 * 如果没有订阅者，则缓存事件
 */
export async function publishSSEEvent(event: SSEEvent): Promise<void> {
  const workflowSubscribers = subscribers.get(event.workflowId)

  if (workflowSubscribers && workflowSubscribers.size > 0) {
    // 有订阅者，并行执行所有回调
    const callbacks = [...workflowSubscribers]
    await Promise.all(callbacks.map(async callback => {
      try {
        await callback(event)
      } catch (error) {
        console.error(`[SSE] Callback error for workflow ${event.workflowId}:`, error)
      }
    }))
    console.log(`[SSE] Sent event ${event.type} to ${callbacks.length} subscribers for workflow ${event.workflowId}`)
  } else {
    // 没有订阅者，缓存事件到持久化存储
    addEventToBuffer(event)
  }
}

/**
 * 清除事件缓冲区
 */
export function clearEventBuffer(workflowId: string): void {
  clearBuffer(workflowId)
}

/**
 * 发布思维链事件
 */
export async function publishThoughtEvent(workflowId: string, stepId: string, thought: Thought): Promise<void> {
  await publishSSEEvent({
    type: 'thought',
    workflowId,
    timestamp: Date.now(),
    data: { stepId, thought }
  })
}

/**
 * 发布步骤开始事件
 */
export async function publishStepStartEvent(workflowId: string, stepId: string, toolName: string, input: any): Promise<void> {
  await publishSSEEvent({
    type: 'step_start',
    workflowId,
    timestamp: Date.now(),
    data: { stepId, toolName, input }
  })
}

/**
 * 发布步骤结束事件
 */
export async function publishStepEndEvent(workflowId: string, stepId: string, status: string, output?: any, error?: string): Promise<void> {
  await publishSSEEvent({
    type: 'step_end',
    workflowId,
    timestamp: Date.now(),
    data: { stepId, status, output, error }
  })
}

/**
 * 发布工作流完成事件
 */
export async function publishWorkflowCompleteEvent(workflowId: string, status: 'completed' | 'failed', trace?: any): Promise<void> {
  await publishSSEEvent({
    type: status === 'completed' ? 'workflow_complete' : 'workflow_failed',
    workflowId,
    timestamp: Date.now(),
    data: { status, trace }
  })
}

/**
 * 保存工作流状态（持久化）
 */
export function saveWorkflowStatus(status: WorkflowStatus): void {
  persistWorkflow(toSerializable(status))
}

/**
 * 获取工作流状态（从持久化存储）
 */
export function getWorkflowStatus(workflowId: string): WorkflowStatus | undefined {
  const serialized = loadWorkflowStatus(workflowId)
  if (!serialized) return undefined
  return fromSerializable(serialized)
}

/**
 * 删除工作流状态
 */
export function deleteWorkflowStatus(workflowId: string): void {
  removeWorkflow(workflowId)
  subscribers.delete(workflowId)
}

/**
 * 获取所有工作流
 */
export function getAllWorkflows(): WorkflowStatus[] {
  const { getAllWorkflows: getAllFromStorage } = require('./workflow-storage')
  const all = getAllFromStorage()
  return all.map(fromSerializable)
}

/**
 * 清理过期的工作流（超过 1 小时）
 */
export function cleanupExpiredWorkflows(): void {
  const { cleanupExpiredWorkflows: cleanupStorage } = require('./workflow-storage')
  cleanupStorage()

  // 清理内存中的订阅者
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [id, status] of subscribers.entries()) {
    // 订阅者本身不需要清理，会在连接断开时自动清理
  }
}