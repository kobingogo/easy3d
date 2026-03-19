/**
 * 工作流持久化存储
 * 解决 Next.js serverless 函数内存隔离问题
 *
 * 生产环境建议替换为 Redis 或数据库
 */

import * as fs from 'fs'
import * as path from 'path'

// 存储目录
const STORAGE_DIR = path.join(process.cwd(), '.workflow-storage')
const WORKFLOW_FILE = path.join(STORAGE_DIR, 'workflows.json')
const EVENTS_FILE = path.join(STORAGE_DIR, 'events.json')

// 确保存储目录存在
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

// 工作流状态（可序列化版本）
export interface SerializableWorkflowStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  startedAt: string  // ISO string
  completedAt?: string
  error?: string
  results?: Record<string, any>  // Map 转为 Record
  workflow?: any
}

// SSE 事件
export interface SSEEvent {
  type: 'thought' | 'step_start' | 'step_end' | 'workflow_complete' | 'workflow_failed'
  workflowId: string
  timestamp: number
  data: any
}

const MAX_BUFFER_SIZE = 100

/**
 * 读取所有工作流状态
 */
export function readAllWorkflows(): Record<string, SerializableWorkflowStatus> {
  try {
    ensureStorageDir()
    if (fs.existsSync(WORKFLOW_FILE)) {
      const content = fs.readFileSync(WORKFLOW_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('[Storage] Error reading workflows:', error)
  }
  return {}
}

/**
 * 写入所有工作流状态
 */
export function writeAllWorkflows(workflows: Record<string, SerializableWorkflowStatus>): void {
  try {
    ensureStorageDir()
    fs.writeFileSync(WORKFLOW_FILE, JSON.stringify(workflows, null, 2), 'utf-8')
  } catch (error) {
    console.error('[Storage] Error writing workflows:', error)
  }
}

/**
 * 保存单个工作流状态
 */
export function saveWorkflowStatus(status: SerializableWorkflowStatus): void {
  const workflows = readAllWorkflows()
  workflows[status.id] = status
  writeAllWorkflows(workflows)
  console.log(`[Storage] Saved workflow ${status.id} with status ${status.status}`)
}

/**
 * 获取工作流状态
 */
export function getWorkflowStatus(workflowId: string): SerializableWorkflowStatus | undefined {
  const workflows = readAllWorkflows()
  return workflows[workflowId]
}

/**
 * 删除工作流状态
 */
export function deleteWorkflowStatus(workflowId: string): void {
  const workflows = readAllWorkflows()
  delete workflows[workflowId]
  writeAllWorkflows(workflows)

  // 同时删除事件缓冲
  const events = readAllEvents()
  delete events[workflowId]
  writeAllEvents(events)

  console.log(`[Storage] Deleted workflow ${workflowId}`)
}

/**
 * 读取所有事件缓冲
 */
export function readAllEvents(): Record<string, SSEEvent[]> {
  try {
    ensureStorageDir()
    if (fs.existsSync(EVENTS_FILE)) {
      const content = fs.readFileSync(EVENTS_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('[Storage] Error reading events:', error)
  }
  return {}
}

/**
 * 写入所有事件缓冲
 */
export function writeAllEvents(events: Record<string, SSEEvent[]>): void {
  try {
    ensureStorageDir()
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8')
  } catch (error) {
    console.error('[Storage] Error writing events:', error)
  }
}

/**
 * 获取工作流的事件缓冲
 */
export function getEventBuffer(workflowId: string): SSEEvent[] {
  const events = readAllEvents()
  return events[workflowId] || []
}

/**
 * 添加事件到缓冲
 */
export function addEventToBuffer(event: SSEEvent): void {
  const events = readAllEvents()

  if (!events[event.workflowId]) {
    events[event.workflowId] = []
  }

  events[event.workflowId].push(event)

  // 限制缓冲区大小
  if (events[event.workflowId].length > MAX_BUFFER_SIZE) {
    events[event.workflowId].shift()
  }

  writeAllEvents(events)
  console.log(`[Storage] Buffered event ${event.type} for workflow ${event.workflowId}`)
}

/**
 * 清除事件缓冲
 */
export function clearEventBuffer(workflowId: string): void {
  const events = readAllEvents()
  delete events[workflowId]
  writeAllEvents(events)
}

/**
 * 获取所有工作流列表
 */
export function getAllWorkflows(): SerializableWorkflowStatus[] {
  const workflows = readAllWorkflows()
  return Object.values(workflows)
}

/**
 * 清理过期的工作流（超过 1 小时）
 */
export function cleanupExpiredWorkflows(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const workflows = readAllWorkflows()
  const events = readAllEvents()

  let changed = false
  for (const [id, status] of Object.entries(workflows)) {
    const startedAt = new Date(status.startedAt).getTime()
    if (startedAt < oneHourAgo) {
      delete workflows[id]
      delete events[id]
      changed = true
    }
  }

  if (changed) {
    writeAllWorkflows(workflows)
    writeAllEvents(events)
    console.log('[Storage] Cleaned up expired workflows')
  }
}