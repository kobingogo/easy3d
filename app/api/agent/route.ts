import { NextRequest, NextResponse } from 'next/server'
import { ReActPlanner, WorkflowEngine, createWorkflow } from '@/lib/agent'
import type { WorkflowStep, StepInput } from '@/lib/agent'

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

    // 执行工作流
    if (action === 'execute') {
      if (!workflowData) {
        return NextResponse.json({ error: 'Workflow data is required' }, { status: 400 })
      }

      // 构建工作流
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

      // 执行
      const engine = new WorkflowEngine()
      const startTime = Date.now()
      const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl, workflowData.description)
      const duration = Date.now() - startTime

      // 格式化结果
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

    // 一键执行（规划 + 执行）
    if (action === 'run') {
      if (!userInput) {
        return NextResponse.json({ error: 'User input is required' }, { status: 400 })
      }

      const planner = new ReActPlanner()
      const plan = await planner.plan(userInput)

      // 构建工作流步骤
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

      // 执行
      const engine = new WorkflowEngine()
      const startTime = Date.now()
      const { workflow: completedWorkflow, results } = await engine.execute(workflow, imageUrl, userInput)
      const duration = Date.now() - startTime

      // 格式化结果
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
      error: 'Invalid action. Use: plan, execute, run'
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
      error: 'Invalid action. Use: tools'
    }, { status: 400 })

  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}