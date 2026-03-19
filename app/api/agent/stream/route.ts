/**
 * SSE Streaming API for Agent Workflow
 * Real-time event streaming for thought chain visualization
 *
 * 使用 ReadableStream 直接模式，确保 Next.js serverless 兼容
 */

import { NextRequest } from 'next/server'
import {
  getWorkflowStatus,
  type SSEEvent
} from '@/lib/agent/workflow-store'
import { getEventBuffer } from '@/lib/agent/workflow-storage'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workflowId = searchParams.get('workflowId')

  if (!workflowId) {
    return new Response(
      JSON.stringify({ error: 'workflowId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check if workflow exists
  const existingStatus = getWorkflowStatus(workflowId)
  if (!existingStatus) {
    return new Response(
      JSON.stringify({ error: 'Workflow not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const encoder = new TextEncoder()

  // Track sent events to avoid duplicates
  const sentEventIds = new Set<string>()
  let lastProcessedTimestamp = 0
  let isClosed = false

  // Create ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Send event helper
      const sendEvent = (event: SSEEvent) => {
        if (isClosed) return
        try {
          const eventData = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(eventData))
          console.log(`[SSE] Sent event ${event.type} for workflow ${workflowId}`)
        } catch (e) {
          console.error(`[SSE] Error sending event ${event.type}:`, e)
        }
      }

      // Send initial status
      const currentStatus = getWorkflowStatus(workflowId)
      if (currentStatus) {
        // For completed/failed workflows, replay ALL buffered events first
        if (currentStatus.status === 'completed' || currentStatus.status === 'failed') {
          const bufferedEvents = getEventBuffer(workflowId)
          console.log(`[SSE] Workflow already ${currentStatus.status}, replaying ${bufferedEvents.length} events`)

          // Send all buffered events in order
          for (const event of bufferedEvents) {
            sendEvent(event)
          }

          // Send final status event
          sendEvent({
            type: currentStatus.status === 'completed' ? 'workflow_complete' : 'workflow_failed',
            workflowId,
            timestamp: Date.now(),
            data: {
              status: currentStatus.status,
              results: currentStatus.results ?
                Array.from(currentStatus.results.entries()).map(([stepId, result]) => ({
                  stepId,
                  status: result.status,
                  data: result.result?.data
                })) : []
            }
          })

          isClosed = true
          controller.close()
          return
        }

        // For running workflows, send initial status
        const initialEvent: SSEEvent = {
          type: 'status',
          workflowId,
          timestamp: Date.now(),
          data: {
            status: currentStatus.status,
            currentStep: currentStatus.currentStep,
            totalSteps: currentStatus.totalSteps,
            results: currentStatus.results ?
              Array.from(currentStatus.results.entries()).map(([stepId, result]) => ({
                stepId,
                status: result.status,
                data: result.result?.data
              })) : []
          }
        }
        sendEvent(initialEvent)
      }

      // Poll for events
      const pollInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(pollInterval)
          return
        }

        try {
          const bufferedEvents = getEventBuffer(workflowId)
          console.log(`[SSE] Poll: found ${bufferedEvents.length} events`)

          for (const event of bufferedEvents) {
            if (event.timestamp > lastProcessedTimestamp) {
              const eventId = `${event.type}-${event.timestamp}`
              if (!sentEventIds.has(eventId)) {
                sentEventIds.add(eventId)
                sendEvent(event)
              }
              lastProcessedTimestamp = event.timestamp
            }
          }

          // Check if workflow is complete
          const status = getWorkflowStatus(workflowId)
          if (status && (status.status === 'completed' || status.status === 'failed')) {
            const completeEventId = `workflow_complete-${Date.now()}`
            if (!sentEventIds.has(completeEventId)) {
              sendEvent({
                type: status.status === 'completed' ? 'workflow_complete' : 'workflow_failed',
                workflowId,
                timestamp: Date.now(),
                data: { status: status.status }
              })
            }
            isClosed = true
            clearInterval(pollInterval)
            controller.close()
          }
        } catch (e) {
          console.error('[SSE] Poll error:', e)
        }
      }, 500)

      // Heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeatInterval)
          return
        }
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (e) {
          clearInterval(heartbeatInterval)
        }
      }, 15000)

      // Handle client disconnect via signal
      request.signal.addEventListener('abort', () => {
        isClosed = true
        clearInterval(pollInterval)
        clearInterval(heartbeatInterval)
        try {
          controller.close()
        } catch (e) {
          // Already closed
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}