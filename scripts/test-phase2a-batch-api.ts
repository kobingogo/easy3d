import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import { GET as batchesGet, POST as batchesPost } from '../app/api/batches/route'
import { GET as batchDetailGet } from '../app/api/batches/[id]/route'
import { GET as batchDownloadGet } from '../app/api/batches/[id]/download/route'
import { POST as batchProcessPost } from '../app/api/batches/[id]/process/route'
import { POST as batchRetryPost } from '../app/api/batches/[id]/items/[itemId]/retry/route'

type Dict = Record<string, any>

type FakeDbState = {
  batch_jobs: Dict[]
  batch_items: Dict[]
  models: Dict[]
  unlock_requests: Dict[]
}

class FakeSupabaseClient {
  public readonly state: FakeDbState
  private idCounter = 0
  private clockCounter = 0

  constructor(state?: Partial<FakeDbState>) {
    this.state = {
      batch_jobs: state?.batch_jobs ? state.batch_jobs.map((row) => ({ ...row })) : [],
      batch_items: state?.batch_items ? state.batch_items.map((row) => ({ ...row })) : [],
      models: state?.models ? state.models.map((row) => ({ ...row })) : [],
      unlock_requests: state?.unlock_requests
        ? state.unlock_requests.map((row) => ({ ...row }))
        : [],
    }
  }

  from(table: keyof FakeDbState) {
    return new FakeQueryBuilder(this, table)
  }

  nextIsoTime() {
    this.clockCounter += 1
    return new Date(Date.UTC(2026, 2, 23, 10, 0, this.clockCounter)).toISOString()
  }

  nextId(prefix: string) {
    this.idCounter += 1
    return `${prefix}_${this.idCounter.toString().padStart(4, '0')}`
  }

  createModel(imageUrl: string, status: 'processing' | 'completed' | 'failed' = 'processing') {
    const now = this.nextIsoTime()
    const id = this.nextId('model')
    const row = {
      id,
      status,
      trip_task_id: this.nextId('task'),
      original_image_url: imageUrl,
      model_3d_url: status === 'completed' ? `https://cdn.example.com/${id}.glb` : null,
      thumbnail_url: imageUrl,
      metadata:
        status === 'completed'
          ? {
              workflowType: 'seller_asset_pack_phase1',
              category: 'bags',
              presetKey: 'bag-studio-phase1',
              uploadMode: 'single',
              unlockStatus: 'unlocked',
              assetPackPreviewReady: true,
              assetPackSnapshotStatus: 'idle',
              assetPackSnapshot: {
                version: 1,
                copy: {
                  taobao: { title: 'taobao', bullets: ['a'] },
                  xiaohongshu: { title: 'xhs', content: 'xhs', tags: ['#xhs'] },
                  douyin: { hook: 'dy', script: 'dy', tags: ['#dy'] },
                },
                strategy: {
                  recommendedPlatform: 'taobao',
                  heroAngle: 'front',
                  styleDirection: 'clean',
                  featureFocus: ['zipper'],
                  materialFocus: ['leather'],
                  marketingHook: 'hook',
                  reasoningSummary: 'summary',
                },
                manifest: {
                  filename: 'manifest/asset-pack-manifest.json',
                  model: {
                    downloadUrl: `https://cdn.example.com/${id}.glb`,
                    filename: 'model/model.glb',
                  },
                  assets: [],
                  copyFiles: [],
                  strategyFile: {
                    filename: 'strategy/strategy-summary.json',
                    content: '{}',
                    mimeType: 'application/json',
                  },
                },
              },
            }
          : null,
      created_at: now,
      updated_at: now,
    }
    this.state.models.push(row)
    return row
  }
}

class FakeQueryBuilder {
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null
  private selectColumns: string | null = null
  private eqFilters: Array<{ column: string; value: any }> = []
  private inFilters: Array<{ column: string; values: any[] }> = []
  private orderBy: { column: string; ascending: boolean } | null = null
  private limitCount: number | null = null
  private rangeWindow: { from: number; to: number } | null = null

  constructor(
    private readonly client: FakeSupabaseClient,
    private readonly table: keyof FakeDbState
  ) {}

  select(columns = '*') {
    this.selectColumns = columns
    return this
  }

  insert(payload: any) {
    this.operation = 'insert'
    this.payload = payload
    return this
  }

  update(payload: any) {
    this.operation = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.operation = 'delete'
    return this
  }

  eq(column: string, value: any) {
    this.eqFilters.push({ column, value })
    return this
  }

  in(column: string, values: any[]) {
    this.inFilters.push({ column, values })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true }
    return this
  }

  limit(value: number) {
    this.limitCount = value
    return this
  }

  range(from: number, to: number) {
    this.rangeWindow = { from, to }
    return this
  }

  async single() {
    const result = await this.execute()
    if (result.error) {
      return result
    }
    if (!result.data || result.data.length === 0) {
      return { data: null, error: { message: 'No rows found' } }
    }
    if (result.data.length > 1) {
      return { data: null, error: { message: 'Multiple rows found' } }
    }
    return { data: result.data[0], error: null }
  }

  async maybeSingle() {
    const result = await this.execute()
    if (result.error) {
      return result
    }
    if (!result.data || result.data.length === 0) {
      return { data: null, error: null }
    }
    return { data: result.data[0], error: null }
  }

  then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    return this.execute().then(resolve, reject)
  }

  private async execute(): Promise<{ data: any; error: any }> {
    switch (this.operation) {
      case 'insert':
        return this.executeInsert()
      case 'update':
        return this.executeUpdate()
      case 'delete':
        return this.executeDelete()
      case 'select':
      default:
        return this.executeSelect()
    }
  }

  private executeInsert() {
    const target = this.client.state[this.table]
    const payloads = Array.isArray(this.payload) ? this.payload : [this.payload]

    const inserted = payloads.map((raw) => {
      const now = this.client.nextIsoTime()
      const payload = { ...raw }

      const row = {
        ...payload,
        id: payload.id || this.client.nextId(this.table),
        created_at: payload.created_at || now,
        updated_at: payload.updated_at || now,
      }

      if (this.table === 'batch_jobs') {
        row.category = row.category || 'bags'
        row.workflow_template_id = row.workflow_template_id ?? null
        row.status = row.status || 'queued'
        row.total_count = row.total_count ?? 0
        row.queued_count = row.queued_count ?? 0
        row.processing_count = row.processing_count ?? 0
        row.completed_count = row.completed_count ?? 0
        row.failed_count = row.failed_count ?? 0
        row.started_at = row.started_at ?? null
        row.completed_at = row.completed_at ?? null
        row.canceled_at = row.canceled_at ?? null
      }

      if (this.table === 'batch_items') {
        row.status = row.status || 'queued'
        row.attempt_count = row.attempt_count ?? 0
        row.last_error = row.last_error ?? null
        row.model_id = row.model_id ?? null
        row.trip_task_id = row.trip_task_id ?? null
        row.locked_at = row.locked_at ?? null
      }

      target.push(row)
      return row
    })

    return { data: this.applySelect(inserted), error: null }
  }

  private executeUpdate() {
    const target = this.client.state[this.table]
    const matched = target.filter((row) => this.matchRow(row))

    for (const row of matched) {
      Object.assign(row, this.payload)
      row.updated_at = this.client.nextIsoTime()
    }

    return { data: this.applySelect(matched), error: null }
  }

  private executeDelete() {
    const target = this.client.state[this.table]
    const retained: Dict[] = []
    const removed: Dict[] = []

    for (const row of target) {
      if (this.matchRow(row)) {
        removed.push(row)
      } else {
        retained.push(row)
      }
    }

    this.client.state[this.table] = retained
    return { data: this.applySelect(removed), error: null }
  }

  private executeSelect() {
    const target = this.client.state[this.table]
    let rows = target.filter((row) => this.matchRow(row)).map((row) => ({ ...row }))

    if (this.orderBy) {
      const { column, ascending } = this.orderBy
      rows.sort((a, b) => {
        const av = a[column]
        const bv = b[column]
        if (av === bv) return 0
        return ascending ? (av > bv ? 1 : -1) : av > bv ? -1 : 1
      })
    }

    if (this.rangeWindow) {
      rows = rows.slice(this.rangeWindow.from, this.rangeWindow.to + 1)
    }

    if (typeof this.limitCount === 'number') {
      rows = rows.slice(0, this.limitCount)
    }

    return { data: this.applySelect(rows), error: null }
  }

  private applySelect(rows: Dict[]) {
    if (!this.selectColumns || this.selectColumns === '*') {
      return rows.map((row) => ({ ...row }))
    }

    const keys = this.selectColumns
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return rows.map((row) => {
      const output: Dict = {}
      for (const key of keys) {
        output[key] = row[key]
      }
      return output
    })
  }

  private matchRow(row: Dict) {
    const eqOk = this.eqFilters.every((filter) => row[filter.column] === filter.value)
    if (!eqOk) {
      return false
    }
    return this.inFilters.every((filter) => filter.values.includes(row[filter.column]))
  }
}

function makeJsonRequest(url: string, method: string, body?: Dict) {
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

async function parseJson(response: Response) {
  return response.json()
}

async function main() {
  const fake = new FakeSupabaseClient()
  const createClient = async () => fake as any

  ;(batchesPost as any).__testables?.setTestOverrides({ createClient })
  ;(batchesGet as any).__testables?.setTestOverrides({ createClient })
  ;(batchDetailGet as any).__testables?.setTestOverrides({ createClient })
  ;(batchProcessPost as any).__testables?.setTestOverrides({
    createClient,
    invokeGenerateSmart: async (imageUrl: string) => {
      const model = fake.createModel(imageUrl, 'processing')
      return { success: true, modelId: model.id, taskId: model.trip_task_id }
    },
    syncTripoTaskStatus: async () => undefined,
  })
  ;(batchRetryPost as any).__testables?.setTestOverrides({ createClient })
  ;(batchDownloadGet as any).__testables?.setTestOverrides({ createClient })

  const createResponse = await batchesPost(
    makeJsonRequest('http://localhost/api/batches', 'POST', {
      name: 'batch-a',
      items: [
        { sourceImageUrl: 'https://img.example.com/1.jpg' },
        { sourceImageUrl: 'https://img.example.com/2.jpg' },
        { sourceImageUrl: 'https://img.example.com/3.jpg' },
        { sourceImageUrl: 'https://img.example.com/4.jpg' },
      ],
    })
  )
  assert.equal(createResponse.status, 201)
  const createdPayload = await parseJson(createResponse)
  const batchId = createdPayload.batchId as string
  assert.ok(batchId)

  const listResponse = await batchesGet(
    makeJsonRequest('http://localhost/api/batches', 'GET')
  )
  assert.equal(listResponse.status, 200)
  const listPayload = await parseJson(listResponse)
  assert.equal(Array.isArray(listPayload.batches), true)
  assert.equal(listPayload.batches.length, 1)
  assert.equal(listPayload.batches[0].totalCount, 4)

  const detailResponse = await batchDetailGet(
    makeJsonRequest(`http://localhost/api/batches/${batchId}`, 'GET'),
    { params: Promise.resolve({ id: batchId }) }
  )
  assert.equal(detailResponse.status, 200)
  const detailPayload = await parseJson(detailResponse)
  assert.equal(detailPayload.items.length, 4)

  const processOnce = await batchProcessPost(
    makeJsonRequest(`http://localhost/api/batches/${batchId}/process`, 'POST'),
    { params: Promise.resolve({ id: batchId }) }
  )
  assert.equal(processOnce.status, 200)
  const processOncePayload = await parseJson(processOnce)
  assert.equal(processOncePayload.claimedCount, 3)

  const processTwice = await batchProcessPost(
    makeJsonRequest(`http://localhost/api/batches/${batchId}/process`, 'POST'),
    { params: Promise.resolve({ id: batchId }) }
  )
  assert.equal(processTwice.status, 200)
  const processTwicePayload = await parseJson(processTwice)
  assert.equal(processTwicePayload.claimedCount, 0)

  const processingItems = fake.state.batch_items.filter((item) => item.status === 'processing')
  assert.equal(processingItems.length, 3)
  const uniqueIds = new Set(processingItems.map((item) => item.id))
  assert.equal(uniqueIds.size, processingItems.length)

  const firstModelId = processingItems[0].model_id
  const firstModel = fake.state.models.find((item) => item.id === firstModelId)
  assert.ok(firstModel)
  firstModel.status = 'completed'
  firstModel.model_3d_url = `https://cdn.example.com/${firstModel.id}.glb`
  firstModel.metadata = {
    workflowType: 'seller_asset_pack_phase1',
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'single',
    unlockStatus: 'unlocked',
    assetPackPreviewReady: true,
    assetPackSnapshotStatus: 'idle',
    assetPackSnapshot: {
      version: 1,
      copy: {
        taobao: { title: 'taobao', bullets: ['a'] },
        xiaohongshu: { title: 'xhs', content: 'xhs', tags: ['#xhs'] },
        douyin: { hook: 'dy', script: 'dy', tags: ['#dy'] },
      },
      strategy: {
        recommendedPlatform: 'taobao',
        heroAngle: 'front',
        styleDirection: 'clean',
        featureFocus: ['zipper'],
        materialFocus: ['leather'],
        marketingHook: 'hook',
        reasoningSummary: 'summary',
      },
      manifest: {
        filename: 'manifest/asset-pack-manifest.json',
        model: {
          downloadUrl: `https://cdn.example.com/${firstModel.id}.glb`,
          filename: 'model/model.glb',
        },
        assets: [],
        copyFiles: [],
        strategyFile: {
          filename: 'strategy/strategy-summary.json',
          content: '{}',
          mimeType: 'application/json',
        },
      },
    },
  }

  const processThird = await batchProcessPost(
    makeJsonRequest(`http://localhost/api/batches/${batchId}/process`, 'POST'),
    { params: Promise.resolve({ id: batchId }) }
  )
  assert.equal(processThird.status, 200)
  const processThirdPayload = await parseJson(processThird)
  assert.equal(processThirdPayload.claimedCount, 1)

  const lastClaimedItem = fake.state.batch_items.find((item) => item.status === 'processing')
  assert.ok(lastClaimedItem)
  lastClaimedItem.status = 'failed'
  lastClaimedItem.last_error = 'mock failed'

  const retryResponse = await batchRetryPost(
    makeJsonRequest(
      `http://localhost/api/batches/${batchId}/items/${lastClaimedItem.id}/retry`,
      'POST'
    ),
    { params: Promise.resolve({ id: batchId, itemId: lastClaimedItem.id }) }
  )
  assert.equal(retryResponse.status, 200)
  const retryPayload = await parseJson(retryResponse)
  assert.equal(retryPayload.item.status, 'queued')

  const downloadResponse = await batchDownloadGet(
    makeJsonRequest(`http://localhost/api/batches/${batchId}/download`, 'GET'),
    { params: Promise.resolve({ id: batchId }) }
  )
  assert.equal(downloadResponse.status, 200)
  assert.equal(downloadResponse.headers.get('content-type'), 'application/zip')
  const bytes = new Uint8Array(await downloadResponse.arrayBuffer())
  assert.equal(bytes.byteLength > 0, true)

  ;(batchesPost as any).__testables?.resetTestOverrides()
  ;(batchesGet as any).__testables?.resetTestOverrides()
  ;(batchDetailGet as any).__testables?.resetTestOverrides()
  ;(batchProcessPost as any).__testables?.resetTestOverrides()
  ;(batchRetryPost as any).__testables?.resetTestOverrides()
  ;(batchDownloadGet as any).__testables?.resetTestOverrides()

  console.log('[test-phase2a-batch-api] PASS')
}

main().catch((error) => {
  console.error('[test-phase2a-batch-api] FAIL', error)
  process.exit(1)
})
