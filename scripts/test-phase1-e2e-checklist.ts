import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { NextRequest } from 'next/server'

import { POST as generateSmartPost } from '../app/api/generate-smart/route'
import { GET as modelsGet } from '../app/api/models/route'
import { POST as unlockRequestsPost } from '../app/api/unlock-requests/route'

type Dict = Record<string, any>

class FakeSupabaseClient {
  public readonly state: Record<string, Dict[]>
  private idCounter = 0

  constructor(state?: Partial<Record<'models' | 'unlock_requests', Dict[]>>) {
    this.state = {
      models: state?.models ? state.models.map((row) => ({ ...row })) : [],
      unlock_requests: state?.unlock_requests ? state.unlock_requests.map((row) => ({ ...row })) : [],
    }
  }

  from(table: 'models' | 'unlock_requests') {
    return new FakeQueryBuilder(this, table)
  }
}

class FakeQueryBuilder {
  private operation: 'select' | 'insert' | 'update' = 'select'
  private payload: Dict | null = null
  private eqFilters: Array<{ column: string; value: any }> = []
  private inFilters: Array<{ column: string; values: any[] }> = []

  constructor(
    private readonly client: FakeSupabaseClient,
    private readonly table: 'models' | 'unlock_requests'
  ) {}

  select() {
    return this
  }

  insert(payload: Dict) {
    this.operation = 'insert'
    this.payload = payload
    return this
  }

  update(payload: Dict) {
    this.operation = 'update'
    this.payload = payload
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

  order() {
    return this
  }

  limit() {
    return this
  }

  async single() {
    const result = await this.execute()
    if (result.error) {
      return result
    }
    return {
      data: result.data?.[0] || null,
      error: result.data?.[0] ? null : { message: 'No rows found' },
    }
  }

  then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    return this.execute().then(resolve, reject)
  }

  private async execute(): Promise<{ data: any[]; error: any }> {
    const rows = this.client.state[this.table]

    if (this.operation === 'insert') {
      const row = {
        ...this.payload,
        id: this.payload?.id || `model_${String(++this.client['idCounter']).padStart(4, '0')}`,
      }
      rows.push(row)
      return { data: [row], error: null }
    }

    if (this.operation === 'update') {
      const matched = rows.filter((row) => this.matches(row))
      matched.forEach((row) => Object.assign(row, this.payload))
      return { data: matched, error: null }
    }

    return { data: rows.filter((row) => this.matches(row)), error: null }
  }

  private matches(row: Dict) {
    return this.eqFilters.every((filter) => row[filter.column] === filter.value) &&
      this.inFilters.every((filter) => filter.values.includes(row[filter.column]))
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

async function main() {
  const [pageSource, heroSource] = await Promise.all([
    readFile('app/page.tsx', 'utf8'),
    readFile('components/landing/hero-section.tsx', 'utf8'),
  ])

  assert.match(pageSource, /素材任务怎么跑/)
  assert.match(heroSource, /商品素材包工作台/)
  assert.equal(typeof unlockRequestsPost, 'function', 'unlock-requests route should exist')

  const generateFake = new FakeSupabaseClient()
  const generateHooks = getGenerateTestables()
  generateHooks.setTestOverrides({
    createClient: async () => generateFake,
    analyzeProduct: async () => ({
      category: 'bags',
      subcategory: '托特包',
      style: ['简约'],
      colors: ['棕色'],
      materials: ['皮革'],
      keyFeatures: ['金属扣'],
      generationFocus: ['保持包身轮廓'],
      confidence: 0.96,
    }),
    optimizePrompt: async () => ({
      prompt: 'studio bag render',
      productType: 'bag',
      structuralHints: ['structured shape'],
      materialHints: ['leather texture'],
      confidence: 0.9,
    }),
    createTask: async () => ({
      code: 0,
      msg: 'ok',
      data: { task_id: 'task_e2e_001', quota_type: 'default' },
    }),
    pollTaskStatus: async () => ({
      code: 0,
      data: { task_id: 'task_e2e_001', status: 'pending', progress: 0 },
    }),
  })

  try {
    const response = await generateSmartPost(
      new NextRequest('http://localhost/api/generate-smart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageUrl: 'https://example.com/bag.jpg' }),
      })
    )
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(typeof body.modelId, 'string')
  } finally {
    generateHooks.resetTestOverrides()
  }

  const modelsFake = new FakeSupabaseClient({
    models: [
      {
        id: 'model_9001',
        status: 'completed',
        model_3d_url: 'https://cdn.example.com/model.glb',
        thumbnail_url: 'https://cdn.example.com/thumb.jpg',
        metadata: {
          workflowType: 'seller_asset_pack_phase1',
          category: 'bags',
          presetKey: 'bag-studio-phase1',
          unlockStatus: 'preview_only',
          assetPackPreviewReady: true,
        },
        created_at: '2026-03-23T10:00:00.000Z',
      },
    ],
    unlock_requests: [],
  })

  const modelsHooks = getModelsTestables()
  modelsHooks.setTestOverrides({
    createClient: async () => modelsFake,
  })

  try {
    const response = await modelsGet(new NextRequest('http://localhost/api/models'))
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.models[0]?.metadata?.workflowType, 'seller_asset_pack_phase1')
  } finally {
    modelsHooks.resetTestOverrides()
  }

  console.log('[test-phase1-e2e-checklist] PASS')
}

main().catch((error) => {
  console.error('[test-phase1-e2e-checklist] FAIL', error)
  process.exit(1)
})
