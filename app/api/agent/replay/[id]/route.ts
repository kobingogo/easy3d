/**
 * Replay API for Agent Workflow
 * Returns complete trace data for workflow visualization replay
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowStatus } from '@/lib/agent/workflow-store'

export const dynamic = 'force-dynamic'

interface ReplayThought {
  id: string
  type: 'reasoning' | 'action' | 'observation'
  content: string
  timestamp: number
}

interface ReplayStep {
  stepId: string
  toolName: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  startedAt?: number
  completedAt?: number
  input?: any
  output?: any
  error?: string
  thoughts: ReplayThought[]
}

interface ReplayData {
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  totalSteps: number
  steps: ReplayStep[]
  trace?: any
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workflowId } = await params

  if (!workflowId) {
    return NextResponse.json(
      { error: 'Workflow ID is required' },
      { status: 400 }
    )
  }

  // Get workflow status from store
  const status = getWorkflowStatus(workflowId)

  if (!status) {
    return NextResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    )
  }

  // Build replay data
  const replayData: ReplayData = {
    workflowId: status.id,
    status: status.status,
    startedAt: status.startedAt.toISOString(),
    completedAt: status.completedAt?.toISOString(),
    totalSteps: status.totalSteps,
    steps: [],
    trace: status.workflow?.trace
  }

  // Extract step data from results
  if (status.results) {
    status.results.forEach((result, stepId) => {
      // Get step info from workflow if available
      const workflowStep = status.workflow?.steps.find(s => s.id === stepId)

      replayData.steps.push({
        stepId,
        toolName: workflowStep?.tool || 'unknown',
        status: result.status,
        startedAt: result.startedAt?.getTime(),
        completedAt: result.completedAt?.getTime(),
        input: workflowStep?.input,
        output: result.result?.data,
        error: result.result?.error?.message,
        thoughts: extractThoughtsFromTrace(status.workflow?.trace, stepId)
      })
    })
  }

  return NextResponse.json(replayData)
}

/**
 * Extract thoughts from trace data for a specific step
 */
function extractThoughtsFromTrace(trace: any, stepId: string): ReplayThought[] {
  if (!trace || !trace.steps) return []

  const stepTrace = trace.steps.find((s: any) => s.stepId === stepId)
  if (!stepTrace || !stepTrace.thoughts) return []

  return stepTrace.thoughts
}