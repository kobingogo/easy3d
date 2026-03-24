import type { Platform } from '../export/platform-adapter'

export type OpsDispatchStatus = 'success' | 'failed' | 'running' | 'pending'
export type OpsBreakerState = 'closed' | 'guarded' | 'open'

export interface OpsSummaryModelRecord {
  id: string
  status?: string | null
  created_at: string
  metadata?: unknown
}

export interface OpsDispatchRecord {
  modelId: string
  runId: string
  createdAt: string
  status: OpsDispatchStatus
  isBreakerOpen: boolean
  error?: string
}

export interface OpsTrendPoint {
  date: string
  total: number
  failed: number
  breakerOpen: number
}

export interface OpsRecommendationAudit {
  modelId: string
  platform: Platform
  variantId: string
  appliedAt: string
  appliedBy: string
}

export interface OpsLogSummary {
  recentDispatches: OpsDispatchRecord[]
  trend: OpsTrendPoint[]
  failureRate: number
  breakerState: OpsBreakerState
  recommendationAudits: OpsRecommendationAudit[]
}

interface BuildOpsLogSummaryOptions {
  recentDispatchLimit?: number
  recommendationAuditLimit?: number
  trendWindowDays?: number
  nowIso?: string
}

const DISPATCH_TIME_KEYS = [
  'scheduledAt',
  'executedAt',
  'createdAt',
  'triggeredAt',
  'timestamp',
  'at',
] as const

const DISPATCH_STATUS_KEYS = ['status', 'result', 'state'] as const
const BREAKER_STATE_KEYS = ['breakerState', 'circuitState'] as const

export function buildOpsLogSummary(
  models: OpsSummaryModelRecord[],
  options: BuildOpsLogSummaryOptions = {}
): OpsLogSummary {
  const recentDispatchLimit = Math.max(1, options.recentDispatchLimit ?? 10)
  const recommendationAuditLimit = Math.max(1, options.recommendationAuditLimit ?? 10)
  const trendWindowDays = Math.max(1, options.trendWindowDays ?? 7)
  const now = parseDate(options.nowIso) ?? new Date()
  const allDispatches = models.flatMap(extractDispatchLogsForModel)

  allDispatches.sort((a, b) => parseDateMs(b.createdAt) - parseDateMs(a.createdAt))
  const recentDispatches = allDispatches.slice(0, recentDispatchLimit)

  const actionableDispatches = recentDispatches.filter((item) =>
    item.status === 'success' || item.status === 'failed'
  )
  const failedCount = actionableDispatches.filter((item) => item.status === 'failed').length
  const failureRate =
    actionableDispatches.length > 0 ? failedCount / actionableDispatches.length : 0

  const breakerState = resolveBreakerState(recentDispatches, failureRate)
  const trend = buildTrend(allDispatches, trendWindowDays, now)
  const recommendationAudits = collectRecommendationAudits(models, recommendationAuditLimit)

  return {
    recentDispatches,
    trend,
    failureRate,
    breakerState,
    recommendationAudits,
  }
}

function extractDispatchLogsForModel(model: OpsSummaryModelRecord): OpsDispatchRecord[] {
  const metadata = asRecord(model.metadata)
  const candidateEntries = collectArrayEntries(metadata, [
    'autoProcessLog',
    'autoProcessLogs',
    'dispatchLog',
    'dispatchLogs',
    'schedulerLog',
    'schedulerLogs',
    'processLog',
    'processLogs',
  ])
  const parsedFromEntries = candidateEntries
    .map((entry, index) => parseDispatchEntry(model, entry, index))
    .filter((item): item is OpsDispatchRecord => Boolean(item))

  if (parsedFromEntries.length > 0) {
    return parsedFromEntries
  }

  return [
    {
      modelId: model.id,
      runId: `fallback:${model.id}`,
      createdAt: normalizeIsoTime(model.created_at),
      status: normalizeDispatchStatus(model.status),
      isBreakerOpen: false,
    },
  ]
}

function collectArrayEntries(
  metadata: Record<string, unknown> | null,
  keys: string[]
): Record<string, unknown>[] {
  if (!metadata) {
    return []
  }

  const output: Record<string, unknown>[] = []
  for (const key of keys) {
    const value = metadata[key]
    if (!Array.isArray(value)) {
      continue
    }

    for (const item of value) {
      const record = asRecord(item)
      if (record) {
        output.push(record)
      }
    }
  }

  return output
}

function parseDispatchEntry(
  model: OpsSummaryModelRecord,
  entry: Record<string, unknown>,
  index: number
): OpsDispatchRecord | null {
  const createdAt =
    resolveTime(entry) || normalizeIsoTime(model.created_at)
  const status = resolveStatus(entry, model.status)
  const runId = resolveRunId(entry, model.id, index)
  const isBreakerOpen = resolveBreakerOpen(entry)
  const error = typeof entry.error === 'string' ? entry.error : undefined

  return {
    modelId: model.id,
    runId,
    createdAt,
    status,
    isBreakerOpen,
    error,
  }
}

function resolveRunId(
  entry: Record<string, unknown>,
  modelId: string,
  index: number
): string {
  const fromEntry =
    readString(entry, 'runId') ||
    readString(entry, 'taskId') ||
    readString(entry, 'id')
  if (fromEntry) {
    return fromEntry
  }
  return `${modelId}:${index + 1}`
}

function resolveTime(entry: Record<string, unknown>): string | null {
  for (const key of DISPATCH_TIME_KEYS) {
    const value = readString(entry, key)
    if (!value) {
      continue
    }

    const parsed = parseDate(value)
    if (parsed) {
      return parsed.toISOString()
    }
  }

  return null
}

function resolveStatus(
  entry: Record<string, unknown>,
  fallback: string | null | undefined
): OpsDispatchStatus {
  for (const key of DISPATCH_STATUS_KEYS) {
    const value = readString(entry, key)
    if (value) {
      return normalizeDispatchStatus(value)
    }
  }

  return normalizeDispatchStatus(fallback)
}

function resolveBreakerOpen(entry: Record<string, unknown>): boolean {
  for (const key of BREAKER_STATE_KEYS) {
    const value = readString(entry, key)
    if (!value) {
      continue
    }
    if (value.toLowerCase() === 'open') {
      return true
    }
  }

  if (entry.breakerOpen === true || entry.circuitOpen === true) {
    return true
  }

  return false
}

function normalizeDispatchStatus(value: string | null | undefined): OpsDispatchStatus {
  const normalized = (value || '').toLowerCase()
  if (
    normalized.includes('success') ||
    normalized.includes('completed') ||
    normalized.includes('done')
  ) {
    return 'success'
  }
  if (
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('cancel') ||
    normalized.includes('reject')
  ) {
    return 'failed'
  }
  if (
    normalized.includes('running') ||
    normalized.includes('processing') ||
    normalized.includes('generating')
  ) {
    return 'running'
  }
  return 'pending'
}

function resolveBreakerState(
  recentDispatches: OpsDispatchRecord[],
  failureRate: number
): OpsBreakerState {
  if (recentDispatches.some((item) => item.isBreakerOpen)) {
    return 'open'
  }

  let consecutiveFailed = 0
  for (const item of recentDispatches) {
    if (item.status === 'failed') {
      consecutiveFailed += 1
    } else if (item.status === 'success') {
      break
    }
  }

  if (consecutiveFailed >= 3) {
    return 'open'
  }

  if (recentDispatches.length >= 4 && failureRate >= 0.5) {
    return 'guarded'
  }

  return 'closed'
}

function buildTrend(
  dispatches: OpsDispatchRecord[],
  trendWindowDays: number,
  now: Date
): OpsTrendPoint[] {
  const dayPoints = Array.from({ length: trendWindowDays }).map((_, index) => {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    day.setUTCDate(day.getUTCDate() - (trendWindowDays - 1 - index))
    return {
      date: day.toISOString().slice(0, 10),
      total: 0,
      failed: 0,
      breakerOpen: 0,
    }
  })

  const dayMap = new Map(dayPoints.map((item) => [item.date, item]))
  for (const dispatch of dispatches) {
    const key = normalizeIsoTime(dispatch.createdAt).slice(0, 10)
    const point = dayMap.get(key)
    if (!point) {
      continue
    }
    point.total += 1
    if (dispatch.status === 'failed') {
      point.failed += 1
    }
    if (dispatch.isBreakerOpen) {
      point.breakerOpen += 1
    }
  }

  return dayPoints
}

function collectRecommendationAudits(
  models: OpsSummaryModelRecord[],
  limit: number
): OpsRecommendationAudit[] {
  const audits: OpsRecommendationAudit[] = []

  for (const model of models) {
    const metadata = asRecord(model.metadata)
    const publishingFeedback = asRecord(metadata?.publishingFeedback)
    const trail = publishingFeedback?.recommendationAuditTrail
    if (!Array.isArray(trail)) {
      continue
    }

    for (const item of trail) {
      const record = asRecord(item)
      if (!record) {
        continue
      }

      const platform = readString(record, 'platform')
      const variantId = readString(record, 'variantId')
      if (!isPublishingPlatform(platform) || !variantId) {
        continue
      }

      const appliedAt =
        normalizeIsoTime(readString(record, 'appliedAt') || model.created_at)
      audits.push({
        modelId: model.id,
        platform,
        variantId: variantId.toLowerCase(),
        appliedAt,
        appliedBy: readString(record, 'appliedBy') || 'user:unknown',
      })
    }
  }

  audits.sort((a, b) => parseDateMs(b.appliedAt) - parseDateMs(a.appliedAt))
  return audits.slice(0, limit)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  return value as Record<string, unknown>
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function normalizeIsoTime(value: string): string {
  const parsed = parseDate(value)
  if (!parsed) {
    return new Date(0).toISOString()
  }
  return parsed.toISOString()
}

function parseDateMs(value: string): number {
  const parsed = parseDate(value)
  if (!parsed) {
    return 0
  }
  return parsed.getTime()
}

function isPublishingPlatform(value: string | null): value is Platform {
  return value === 'taobao' || value === 'xiaohongshu' || value === 'douyin'
}
