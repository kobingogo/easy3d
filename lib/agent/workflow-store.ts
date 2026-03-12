/**
 * 工作流状态存储
 * 用于异步执行和状态查询
 */

import type { Workflow, StepResult } from './types'

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

// 内存存储（生产环境应使用 Redis 或数据库）
const workflowStore = new Map<string, WorkflowStatus>()

/**
 * 保存工作流状态
 */
export function saveWorkflowStatus(status: WorkflowStatus): void {
  workflowStore.set(status.id, status)
}

/**
 * 获取工作流状态
 */
export function getWorkflowStatus(workflowId: string): WorkflowStatus | undefined {
  return workflowStore.get(workflowId)
}

/**
 * 删除工作流状态
 */
export function deleteWorkflowStatus(workflowId: string): void {
  workflowStore.delete(workflowId)
}

/**
 * 获取所有工作流
 */
export function getAllWorkflows(): WorkflowStatus[] {
  return Array.from(workflowStore.values())
}

/**
 * 清理过期的工作流（超过 1 小时）
 */
export function cleanupExpiredWorkflows(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000

  for (const [id, status] of workflowStore.entries()) {
    if (status.startedAt.getTime() < oneHourAgo) {
      workflowStore.delete(id)
    }
  }
}