import assert from 'node:assert/strict'
import {
  buildOpsLogSummary,
  type OpsSummaryModelRecord,
} from '../lib/seller-workflow/ops-log-summary'

const fixtureModels: OpsSummaryModelRecord[] = [
  {
    id: 'model_1003',
    status: 'failed',
    created_at: '2026-03-24T12:10:00.000Z',
    metadata: {
      autoProcessLog: [
        {
          scheduledAt: '2026-03-24T12:09:00.000Z',
          status: 'failed',
          breakerState: 'open',
          error: 'timeout',
        },
      ],
      publishingFeedback: {
        recommendationAuditTrail: [
          {
            platform: 'taobao',
            variantId: 'v2',
            appliedAt: '2026-03-24T12:08:00.000Z',
            appliedBy: 'ops:test',
          },
        ],
      },
    },
  },
  {
    id: 'model_1002',
    status: 'completed',
    created_at: '2026-03-24T11:00:00.000Z',
    metadata: {
      autoProcessLog: [
        {
          scheduledAt: '2026-03-24T11:00:00.000Z',
          status: 'success',
        },
      ],
    },
  },
  {
    id: 'model_1001',
    status: 'pending',
    created_at: '2026-03-24T10:00:00.000Z',
    metadata: {
      publishingFeedback: {
        recommendationAuditTrail: [
          {
            platform: 'xiaohongshu',
            variantId: 'v3',
            appliedAt: '2026-03-24T10:30:00.000Z',
            appliedBy: 'ops:test',
          },
        ],
      },
    },
  },
]

function main() {
  const summary = buildOpsLogSummary(fixtureModels, {
    recentDispatchLimit: 5,
    trendWindowDays: 3,
  })

  assert.equal(summary.recentDispatches.length, 3)
  assert.equal(summary.recentDispatches[0].modelId, 'model_1003')
  assert.equal(summary.recentDispatches[0].status, 'failed')
  assert.equal(summary.recentDispatches[0].isBreakerOpen, true)

  assert.equal(summary.breakerState, 'open')
  assert.equal(summary.failureRate, 1 / 2)
  assert.equal(summary.trend.length, 3)
  assert.equal(summary.trend[2].total, 3)
  assert.equal(summary.trend[2].failed, 1)
  assert.equal(summary.trend[2].breakerOpen, 1)

  assert.equal(summary.recommendationAudits.length, 2)
  assert.equal(summary.recommendationAudits[0].platform, 'taobao')
  assert.equal(summary.recommendationAudits[1].platform, 'xiaohongshu')

  console.log('[test-phase3a-ops-log-summary] PASS')
}

main()
