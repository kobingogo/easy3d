import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import { POST as generateSmartPost } from '../app/api/generate-smart/route'
import { GET as modelsGet } from '../app/api/models/route'
import { GET as assetPackAssetGet } from '../app/api/models/[id]/asset-pack-assets/[platform]/route'
import { POST as unlockRequestsPost } from '../app/api/unlock-requests/route'
import { GET as tripoStatusGet } from '../app/api/tripo/status/[taskId]/route'

type Dict = Record<string, any>

type FakeDbState = {
  models: Dict[]
  unlock_requests: Dict[]
}

type FakeSupabaseOptions = {
  failTaskLinkUpdate?: boolean
}

class FakeSupabaseClient {
  public readonly state: FakeDbState
  private idCounter = 0
  private clockCounter = 0
  private readonly options: FakeSupabaseOptions

  constructor(state?: Partial<FakeDbState>, options?: FakeSupabaseOptions) {
    this.state = {
      models: state?.models ? state.models.map((row) => ({ ...row })) : [],
      unlock_requests: state?.unlock_requests
        ? state.unlock_requests.map((row) => ({ ...row }))
        : [],
    }
    this.options = options || {}
  }

  from(table: keyof FakeDbState) {
    return new FakeQueryBuilder(this, table)
  }

  get storage() {
    return {
      from: () => ({
        remove: async () => ({ data: [], error: null }),
      }),
    }
  }

  nextIsoTime() {
    this.clockCounter += 1
    return new Date(Date.UTC(2026, 2, 23, 10, 0, this.clockCounter)).toISOString()
  }

  nextId(prefix: string) {
    this.idCounter += 1
    return `${prefix}_${this.idCounter.toString().padStart(4, '0')}`
  }

  touchModel(modelId: string, updater: (row: Dict) => void) {
    const row = this.state.models.find((item) => item.id === modelId)
    if (!row) {
      return
    }
    updater(row)
    row.updated_at = this.nextIsoTime()
  }

  shouldFailTaskLinkUpdate() {
    return this.options.failTaskLinkUpdate === true
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

  constructor(
    private readonly client: FakeSupabaseClient,
    private readonly table: keyof FakeDbState
  ) {}

  select(columns = '*') {
    this.operation = this.operation === 'insert' || this.operation === 'update'
      ? this.operation
      : 'select'
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

    if (this.table === 'unlock_requests') {
      for (const payload of payloads) {
        const hasActive = target.some(
          (row) =>
            row.model_id === payload.model_id &&
            (row.status === 'submitted' || row.status === 'approved')
        )
        if (hasActive) {
          return {
            data: null,
            error: {
              code: '23505',
              constraint: 'idx_unlock_requests_active_model_id',
              message: 'duplicate key value violates unique constraint',
            },
          }
        }
      }
    }

    const inserted = payloads.map((payload) => {
      const now = this.client.nextIsoTime()
      const withDefaults = {
        ...payload,
        id:
          payload.id ||
          this.client.nextId(this.table === 'models' ? 'model' : 'unlock'),
        created_at: payload.created_at || now,
        updated_at: payload.updated_at || now,
      }
      target.push(withDefaults)
      return withDefaults
    })

    return {
      data: this.applySelect(inserted),
      error: null,
    }
  }

  private executeUpdate() {
    if (this.table === 'models' && this.payload?.trip_task_id && this.client.shouldFailTaskLinkUpdate()) {
      return { data: [], error: null }
    }

    const target = this.client.state[this.table]
    const matched = target.filter((row) => this.matchRow(row))

    for (const row of matched) {
      Object.assign(row, this.payload)
      row.updated_at = this.client.nextIsoTime()
    }

    return {
      data: this.applySelect(matched),
      error: null,
    }
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
    return {
      data: this.applySelect(removed),
      error: null,
    }
  }

  private executeSelect() {
    const target = this.client.state[this.table]
    let rows = target.filter((row) => this.matchRow(row)).map((row) => ({ ...row }))

    if (this.orderBy) {
      const { column, ascending } = this.orderBy
      rows.sort((a, b) => {
        const av = a[column]
        const bv = b[column]
        if (av === bv) {
          return 0
        }
        return ascending ? (av > bv ? 1 : -1) : av > bv ? -1 : 1
      })
    }

    if (typeof this.limitCount === 'number') {
      rows = rows.slice(0, this.limitCount)
    }

    return {
      data: this.applySelect(rows),
      error: null,
    }
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
    for (const filter of this.eqFilters) {
      const value = this.readField(row, filter.column)
      if (value !== filter.value) {
        return false
      }
    }

    for (const filter of this.inFilters) {
      const value = this.readField(row, filter.column)
      if (!filter.values.includes(value)) {
        return false
      }
    }

    return true
  }

  private readField(row: Dict, column: string) {
    if (column === 'metadata->>assetPackSnapshotStatus') {
      return row.metadata?.assetPackSnapshotStatus
    }
    return row[column]
  }
}

function phase1Metadata(overrides?: Dict) {
  return {
    workflowType: 'seller_asset_pack_phase1',
    category: 'bags',
    presetKey: 'bag-studio-phase1',
    uploadMode: 'single',
    unlockStatus: 'preview_only',
    analysisSummary: {
      subcategory: '托特包',
      materials: ['皮革'],
      keyFeatures: ['金属扣'],
    },
    assetPackPreviewReady: false,
    assetPackSnapshotStatus: 'idle',
    ...overrides,
  }
}

function sampleSnapshot() {
  return {
    version: 1 as const,
    copy: {
      taobao: { title: '淘宝标题', bullets: ['卖点一'] },
      xiaohongshu: { title: '小红书标题', content: '内容', tags: ['#包包'] },
      douyin: { hook: '抖音钩子', script: '脚本', tags: ['#通勤'] },
    },
    strategy: {
      recommendedPlatform: 'taobao' as const,
      heroAngle: '45度主图',
      styleDirection: '高级通勤',
      featureFocus: ['容量'],
      materialFocus: ['皮革'],
      marketingHook: '通勤质感',
      reasoningSummary: '摘要',
    },
    manifest: {
      filename: 'manifest/asset-pack-manifest.json' as const,
      model: {
        downloadUrl: 'https://cdn.example.com/model.glb',
        filename: 'model/model.glb' as const,
      },
      assets: [
        {
          platform: 'taobao' as const,
          filename: 'assets/taobao-main.jpg',
          previewUrl: 'https://cdn.example.com/taobao.jpg',
          downloadUrl: '/api/models/model_1001/asset-pack-assets/taobao',
          mimeType: 'image/jpeg' as const,
          width: 800,
          height: 800,
        },
      ],
      copyFiles: [],
      strategyFile: {
        filename: 'strategy/strategy-summary.json' as const,
        content: '{"ok":true}',
        mimeType: 'application/json' as const,
      },
    },
  }
}

function getGenerateTestables() {
  return (generateSmartPost as any).__testables as {
    setTestOverrides: (overrides: Dict) => void
    resetTestOverrides: () => void
  }
}

function getModelsTestables() {
  return (modelsGet as any).__testables as {
    setTestOverrides: (overrides: Dict) => void
    resetTestOverrides: () => void
  }
}

function getUnlockTestables() {
  return (unlockRequestsPost as any).__testables as {
    setTestOverrides: (overrides: Dict) => void
    resetTestOverrides: () => void
  }
}

function getTripoStatusTestables() {
  return (tripoStatusGet as any).__testables as {
    setTestOverrides: (overrides: Dict) => void
    resetTestOverrides: () => void
  }
}

function getAssetRouteTestables() {
  return (assetPackAssetGet as any).__testables as {
    setTestOverrides: (overrides: Dict) => void
    resetTestOverrides: () => void
  }
}

async function parseJson(response: Response) {
  return response.json()
}

async function runTest(name: string, fn: () => Promise<void>) {
  await fn()
  console.log(`[test-phase1-api] PASS ${name}`)
}

async function main() {
  await runTest('generate-smart returns modelId', async () => {
    const fakeSupabase = new FakeSupabaseClient()
    const hooks = getGenerateTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
      analyzeProduct: async () => ({
        category: 'bags',
        subcategory: '托特包',
        style: ['简约'],
        colors: ['黑色'],
        materials: ['皮革'],
        keyFeatures: ['金属扣'],
        generationFocus: ['保持包身结构感'],
        confidence: 0.95,
      }),
      optimizePrompt: async () => ({
        prompt: 'studio product render',
        productType: 'bag',
        structuralHints: ['structured shape'],
        materialHints: ['leather texture'],
        confidence: 0.9,
      }),
      createTask: async () => ({
        code: 0,
        msg: 'ok',
        data: {
          task_id: 'task_001',
          quota_type: 'default',
        },
      }),
      pollTaskStatus: async () => ({
        code: 0,
        data: {
          task_id: 'task_001',
          status: 'pending',
          progress: 0,
        },
      }),
    })

    try {
      const request = new NextRequest('http://localhost/api/generate-smart', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: 'https://example.com/image.jpg',
        }),
      })

      const response = await generateSmartPost(request)
      const body = await parseJson(response)

      assert.equal(response.status, 200)
      assert.equal(typeof body.modelId, 'string')
      assert.equal(body.taskId, 'task_001')
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('models GET returns metadata and unlock summary', async () => {
    const fakeSupabase = new FakeSupabaseClient({
      models: [
        {
          id: 'model_1001',
          status: 'processing',
          model_3d_url: null,
          thumbnail_url: null,
          original_image_url: 'https://example.com/source.jpg',
          trip_task_id: 'task_1001',
          metadata: phase1Metadata({
            assetPackPreviewReady: true,
            assetPackSnapshot: sampleSnapshot(),
          }),
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T10:00:00.000Z',
        },
      ],
      unlock_requests: [
        {
          id: 'unlock_001',
          model_id: 'model_1001',
          status: 'submitted',
          contact_name: 'Alice',
          contact_channel: 'wechat',
          contact_value: 'alice_wechat',
          note: null,
          approved_at: null,
          rejected_at: null,
          fulfilled_at: null,
          created_at: '2026-03-23T10:01:00.000Z',
          updated_at: '2026-03-23T10:01:00.000Z',
        },
      ],
    })

    const hooks = getModelsTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
    })

    try {
      const request = new NextRequest('http://localhost/api/models?id=model_1001')
      const response = await modelsGet(request)
      const body = await parseJson(response)

      assert.equal(response.status, 200)
      assert.equal(body.model.metadata.workflowType, 'seller_asset_pack_phase1')
      assert.equal(body.model.unlockStatus, 'requested')
      assert.equal(body.model.currentState, 'requested')
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('unlock-requests POST returns 201 and active conflict returns 409', async () => {
    const fakeSupabase = new FakeSupabaseClient({
      models: [
        {
          id: 'model_2001',
          status: 'completed',
          metadata: phase1Metadata(),
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T10:00:00.000Z',
        },
      ],
    })

    const hooks = getUnlockTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
    })

    try {
      const payload = {
        modelId: 'model_2001',
        contactName: 'Alice',
        contactChannel: 'wechat',
        contactValue: 'alice_wechat',
      }

      const successResponse = await unlockRequestsPost(
        new NextRequest('http://localhost/api/unlock-requests', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      )
      const successBody = await parseJson(successResponse)
      assert.equal(successResponse.status, 201)
      assert.equal(successBody.unlockView.currentState, 'requested')

      const conflictResponse = await unlockRequestsPost(
        new NextRequest('http://localhost/api/unlock-requests', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      )
      assert.equal(conflictResponse.status, 409)
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('asset-pack-assets GET proxies persisted platform asset', async () => {
    const fakeSupabase = new FakeSupabaseClient({
      models: [
        {
          id: 'model_1001',
          status: 'completed',
          model_3d_url: 'https://cdn.example.com/model.glb',
          thumbnail_url: 'https://cdn.example.com/thumb.jpg',
          original_image_url: 'https://example.com/source.jpg',
          trip_task_id: 'task_1001',
          metadata: phase1Metadata({
            assetPackPreviewReady: true,
            assetPackSnapshot: sampleSnapshot(),
          }),
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T10:00:00.000Z',
        },
      ],
    })

    const hooks = getAssetRouteTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
      fetchImpl: async () =>
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: {
            'content-type': 'image/jpeg',
          },
        }),
    })

    try {
      const response = await assetPackAssetGet(
        new NextRequest('http://localhost/api/models/model_1001/asset-pack-assets/taobao'),
        {
          params: Promise.resolve({ id: 'model_1001', platform: 'taobao' }),
        } as any
      )

      assert.equal(response.status, 200)
      assert.equal(response.headers.get('content-type'), 'image/jpeg')
      assert.match(response.headers.get('content-disposition') || '', /taobao-main\.jpg/)
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('generate-smart should fail when trip task link persistence fails', async () => {
    const fakeSupabase = new FakeSupabaseClient(undefined, {
      failTaskLinkUpdate: true,
    })
    const hooks = getGenerateTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
      analyzeProduct: async () => ({
        category: 'bags',
        subcategory: '托特包',
        style: ['简约'],
        colors: ['黑色'],
        materials: ['皮革'],
        keyFeatures: ['金属扣'],
        generationFocus: ['保持包身结构感'],
        confidence: 0.95,
      }),
      optimizePrompt: async () => ({
        prompt: 'studio product render',
        productType: 'bag',
        structuralHints: ['structured shape'],
        materialHints: ['leather texture'],
        confidence: 0.9,
      }),
      createTask: async () => ({
        code: 0,
        msg: 'ok',
        data: {
          task_id: 'task_critical',
          quota_type: 'default',
        },
      }),
      pollTaskStatus: async () => ({
        code: 0,
        data: {
          task_id: 'task_critical',
          status: 'pending',
          progress: 0,
        },
      }),
    })

    try {
      const response = await generateSmartPost(
        new NextRequest('http://localhost/api/generate-smart', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: 'https://example.com/image.jpg',
          }),
        })
      )
      assert.equal(response.status, 500)
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('tripo status should not retry materialization after failure', async () => {
    const fakeSupabase = new FakeSupabaseClient({
      models: [
        {
          id: 'model_3001',
          status: 'processing',
          model_3d_url: null,
          thumbnail_url: null,
          original_image_url: 'https://example.com/source.jpg',
          trip_task_id: 'task_3001',
          metadata: phase1Metadata(),
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T10:00:00.000Z',
        },
      ],
    })

    let materializeCalls = 0
    const hooks = getTripoStatusTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
      isTripoConfigured: () => true,
      getTaskStatus: async () => ({
        code: 0,
        data: {
          task_id: 'task_3001',
          status: 'success',
          progress: 100,
          output: {
            pbr_model: 'https://cdn.example.com/model.glb',
            rendered_image: 'https://cdn.example.com/thumbnail.jpg',
          },
        },
      }),
      materializePhase1AssetPackSnapshot: async () => {
        materializeCalls += 1
        throw new Error('materialization failed')
      },
    })

    try {
      const first = await tripoStatusGet(
        new NextRequest('http://localhost/api/tripo/status/task_3001'),
        { params: Promise.resolve({ taskId: 'task_3001' }) } as any
      )
      assert.equal(first.status, 200)

      const second = await tripoStatusGet(
        new NextRequest('http://localhost/api/tripo/status/task_3001'),
        { params: Promise.resolve({ taskId: 'task_3001' }) } as any
      )
      assert.equal(second.status, 200)

      assert.equal(materializeCalls, 1)
      const model = fakeSupabase.state.models.find((item) => item.id === 'model_3001')
      assert.equal(Boolean(model?.metadata?.materializationFailedAt), true)
    } finally {
      hooks.resetTestOverrides()
    }
  })

  await runTest('tripo status should preserve concurrent unlockStatus update', async () => {
    const fakeSupabase = new FakeSupabaseClient({
      models: [
        {
          id: 'model_4001',
          status: 'processing',
          model_3d_url: null,
          thumbnail_url: null,
          original_image_url: 'https://example.com/source.jpg',
          trip_task_id: 'task_4001',
          metadata: phase1Metadata({
            unlockStatus: 'preview_only',
          }),
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T10:00:00.000Z',
        },
      ],
    })

    const hooks = getTripoStatusTestables()
    hooks.setTestOverrides({
      createClient: async () => fakeSupabase,
      isTripoConfigured: () => true,
      getTaskStatus: async () => ({
        code: 0,
        data: {
          task_id: 'task_4001',
          status: 'success',
          progress: 100,
          output: {
            pbr_model: 'https://cdn.example.com/model.glb',
            rendered_image: 'https://cdn.example.com/thumbnail.jpg',
          },
        },
      }),
      materializePhase1AssetPackSnapshot: async () => {
        fakeSupabase.touchModel('model_4001', (row) => {
          row.metadata = {
            ...row.metadata,
            unlockStatus: 'approved',
          }
        })
        return sampleSnapshot()
      },
    })

    try {
      const response = await tripoStatusGet(
        new NextRequest('http://localhost/api/tripo/status/task_4001'),
        { params: Promise.resolve({ taskId: 'task_4001' }) } as any
      )
      assert.equal(response.status, 200)

      const model = fakeSupabase.state.models.find((item) => item.id === 'model_4001')
      assert.equal(model?.metadata?.unlockStatus, 'approved')
    } finally {
      hooks.resetTestOverrides()
    }
  })
}

main().catch((error) => {
  console.error('[test-phase1-api] FAIL', error)
  process.exit(1)
})
