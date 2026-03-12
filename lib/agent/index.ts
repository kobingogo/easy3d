/**
 * Agent 模块入口
 */

export * from './types'
export * from './llm'
export * from './tracer'
export * from './planner'
export * from './engine'
export * from './tools'

// 便捷函数
import type { Workflow, WorkflowStep, StepInput } from './types'
import { Tracer } from './tracer'
import { ReActPlanner } from './planner'
import { WorkflowEngine } from './engine'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  try {
    // 动态导入 uuid
    const { v4 } = require('uuid')
    return v4()
  } catch {
    // uuid not available, use fallback
    return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }
}

/**
 * 创建工作流
 */
export function createWorkflow(
  name: string,
  steps: WorkflowStep[],
  description?: string
): Workflow {
  const id = generateId()
  const tracer = new Tracer(id)

  return {
    id,
    name,
    description: description || name,
    status: 'pending',
    steps,
    results: new Map(),
    trace: tracer.getTrace(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * 从计划创建工作流
 */
export async function createWorkflowFromPlan(
  userInput: string,
  imageUrl?: string
): Promise<Workflow> {
  const planner = new ReActPlanner()
  const plan = await planner.plan(userInput)

  const steps: WorkflowStep[] = plan.steps.map((step: any) => ({
    id: step.id,
    tool: step.tool,
    input: { type: 'static', value: step.input } as StepInput,
    description: step.description
  }))

  return createWorkflow(
    `Agent Workflow: ${userInput.slice(0, 50)}`,
    steps,
    plan.reasoning
  )
}

/**
 * 执行 Agent 任务
 */
export async function executeAgent(
  userInput: string,
  imageUrl?: string
): Promise<{
  workflow: Workflow
  results: Map<string, any>
  visualization: any
}> {
  // 创建工作流
  const workflow = await createWorkflowFromPlan(userInput, imageUrl)

  // 执行
  const engine = new WorkflowEngine()
  const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl)

  // 生成可视化数据
  const tracer = new Tracer(workflow.id)
  const visualization = tracer.exportForVisualization()

  return {
    workflow: completedWorkflow,
    results: new Map(
      Array.from(results.entries()).map(([k, v]: [string, any]) => [k, v.result?.data])
    ),
    visualization
  }
}