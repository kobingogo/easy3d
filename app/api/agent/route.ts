import { NextRequest, NextResponse } from 'next/server'
import { ReActPlanner, WorkflowEngine, createWorkflow } from '@/lib/agent'
import { saveWorkflowStatus, getWorkflowStatus, cleanupExpiredWorkflows } from '@/lib/agent/workflow-store'
import type { WorkflowStep, StepInput } from '@/lib/agent'

// 定期清理过期工作流
cleanupExpiredWorkflows()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userInput, imageUrl, workflow: workflowData } = body

    // 规划任务
    if (action === 'plan') {
      if (!userInput) {
        return NextResponse.json({ error: 'User input is required' }, { status: 400 })
      }

      const planner = new ReActPlanner()
      const plan = await planner.plan(userInput)

      return NextResponse.json({
        success: true,
        plan
      })
    }

    // 执行工作流（同步）
    if (action === 'execute') {
      if (!workflowData) {
        return NextResponse.json({ error: 'Workflow data is required' }, { status: 400 })
      }

      const steps: WorkflowStep[] = workflowData.steps.map((step: any) => ({
        id: step.id,
        tool: step.tool,
        input: { type: 'static', value: step.input } as StepInput,
        description: step.description
      }))

      const workflow = createWorkflow(
        workflowData.name || 'Agent Workflow',
        steps,
        workflowData.description
      )

      const engine = new WorkflowEngine()
      const startTime = Date.now()
      const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl, workflowData.description)
      const duration = Date.now() - startTime

      const formattedResults = Array.from(results.entries()).map(([stepId, result]) => ({
        stepId,
        status: result.status,
        data: result.result?.data,
        error: result.result?.error
      }))

      return NextResponse.json({
        success: true,
        workflow: {
          id: completedWorkflow.id,
          status: completedWorkflow.status,
          duration,
          trace: completedWorkflow.trace
        },
        results: formattedResults
      })
    }

    // 异步启动工作流
    if (action === 'start') {
      if (!userInput) {
        return NextResponse.json({ error: 'User input is required' }, { status: 400 })
      }

      const planner = new ReActPlanner()
      const plan = await planner.plan(userInput)

      const steps: WorkflowStep[] = plan.steps.map((step: any) => ({
        id: step.id,
        tool: step.tool,
        input: { type: 'static', value: step.input } as StepInput,
        description: step.description
      }))

      const workflow = createWorkflow(
        `Agent: ${userInput.slice(0, 50)}`,
        steps,
        plan.reasoning
      )

      // 保存初始状态
      const workflowStatus = {
        id: workflow.id,
        status: 'pending' as const,
        currentStep: 0,
        totalSteps: steps.length,
        startedAt: new Date(),
        workflow
      }
      saveWorkflowStatus(workflowStatus)

      // 异步执行（不等待）
      executeWorkflowAsync(workflow, imageUrl, userInput)

      // 立即返回 workflow ID
      return NextResponse.json({
        success: true,
        workflowId: workflow.id,
        plan,
        message: 'Workflow started. Poll /api/agent?workflowId=xxx for status.'
      })
    }

    // 查询工作流状态
    if (action === 'status') {
      const workflowId = body.workflowId
      if (!workflowId) {
        return NextResponse.json({ error: 'workflowId is required' }, { status: 400 })
      }

      const status = getWorkflowStatus(workflowId)
      if (!status) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        ...status,
        results: status.results ? Array.from(status.results.entries()).map(([stepId, result]) => ({
          stepId,
          status: result.status,
          data: result.result?.data,
          error: result.result?.error
        })) : []
      })
    }

    // 一键执行（同步，用于简单请求）
    if (action === 'run') {
      if (!userInput) {
        return NextResponse.json({ error: 'User input is required' }, { status: 400 })
      }

      const planner = new ReActPlanner()
      const plan = await planner.plan(userInput)

      const steps: WorkflowStep[] = plan.steps.map((step: any) => ({
        id: step.id,
        tool: step.tool,
        input: { type: 'static', value: step.input } as StepInput,
        description: step.description
      }))

      const workflow = createWorkflow(
        `Agent: ${userInput.slice(0, 50)}`,
        steps,
        plan.reasoning
      )

      const engine = new WorkflowEngine()
      const startTime = Date.now()
      const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl, userInput)
      const duration = Date.now() - startTime

      const formattedResults = Array.from(results.entries()).map(([stepId, result]) => {
        const step = completedWorkflow.steps.find((s: any) => s.id === stepId)
        return {
          stepId,
          tool: step?.tool,
          status: result.status,
          data: result.result?.data,
          error: result.result?.error,
          duration: result.completedAt && result.startedAt
            ? result.completedAt.getTime() - result.startedAt.getTime()
            : 0
        }
      })

      return NextResponse.json({
        success: true,
        plan,
        workflow: {
          id: completedWorkflow.id,
          status: completedWorkflow.status,
          duration,
          trace: completedWorkflow.trace
        },
        results: formattedResults
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: plan, execute, run, start, status'
    }, { status: 400 })

  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const workflowId = searchParams.get('workflowId')

    // 查询工作流状态（GET 方式）
    if (workflowId) {
      const status = getWorkflowStatus(workflowId)
      if (!status) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        ...status,
        results: status.results ? Array.from(status.results.entries()).map(([stepId, result]) => ({
          stepId,
          status: result.status,
          data: result.result?.data,
          error: result.result?.error
        })) : []
      })
    }

    // 获取工具列表
    if (action === 'tools') {
      const { getToolDefinitions, getToolNames } = await import('@/lib/agent/tools')
      const tools = getToolDefinitions()
      const names = getToolNames()

      return NextResponse.json({
        success: true,
        tools: tools.map(t => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters
        })),
        toolNames: names
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: tools or provide workflowId'
    }, { status: 400 })

  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * 异步执行工作流
 */
async function executeWorkflowAsync(
  workflow: any,
  imageUrl: string | undefined,
  userInput: string
): Promise<void> {
  const engine = new WorkflowEngine()

  // 更新状态为 running
  const runningStatus = getWorkflowStatus(workflow.id)
  if (runningStatus) {
    runningStatus.status = 'running'
    saveWorkflowStatus(runningStatus)
  }

  try {
    const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl, userInput)

    // 更新状态为 completed
    const finalStatus = getWorkflowStatus(workflow.id)
    if (finalStatus) {
      finalStatus.status = completedWorkflow.status as 'completed' | 'failed'
      finalStatus.completedAt = new Date()
      finalStatus.results = results
      finalStatus.workflow = completedWorkflow
      saveWorkflowStatus(finalStatus)
    }
  } catch (error: any) {
    // 更新状态为 failed
    const failedStatus = getWorkflowStatus(workflow.id)
    if (failedStatus) {
      failedStatus.status = 'failed'
      failedStatus.completedAt = new Date()
      failedStatus.error = error.message
      saveWorkflowStatus(failedStatus)
    }
  }
}