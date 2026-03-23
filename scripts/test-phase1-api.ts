import assert from 'node:assert/strict'

import { POST as generateSmartPost } from '../app/api/generate-smart/route'
import { GET as modelsGet } from '../app/api/models/route'
import { POST as unlockPost } from '../app/api/unlock-requests/route'

const generateSmartTestables = (generateSmartPost as typeof generateSmartPost & {
  __testables: {
    buildInitialPhase1Metadata: (input: any) => any
    buildGenerateSmartSuccessResponse: (input: any) => any
  }
}).__testables

const modelsRouteTestables = (modelsGet as typeof modelsGet & {
  __testables: {
    composeModelDetail: (input: any) => any
  }
}).__testables

const unlockRequestsTestables = (unlockPost as typeof unlockPost & {
  __testables: {
    buildUnlockRequestInsertPayload: (input: any) => any
    mapUnlockInsertErrorStatus: (input: any) => number
  }
}).__testables

async function main() {
  const metadata = generateSmartTestables.buildInitialPhase1Metadata({
    uploadMode: 'single',
    analysis: {
      category: 'bags',
      subcategory: '托特包',
      materials: ['皮革'],
      keyFeatures: ['金属扣'],
    },
  })

  const generateResponse = generateSmartTestables.buildGenerateSmartSuccessResponse({
    modelId: 'model_001',
    taskId: 'task_001',
    taskType: 'image_to_model',
    analysis: {
      category: 'bags',
      subcategory: '托特包',
      keyFeatures: ['金属扣'],
      generationFocus: ['保持包身结构感'],
    },
    optimizedPrompt: 'studio product render',
    structuralHints: ['structured shape'],
    durationMs: 1200,
  })

  assert.equal(generateResponse.modelId, 'model_001')
  assert.equal(metadata.workflowType, 'seller_asset_pack_phase1')

  const detail = modelsRouteTestables.composeModelDetail({
    model: {
      id: 'model_001',
      status: 'processing',
      model_3d_url: null,
      thumbnail_url: null,
      metadata: {
        ...metadata,
        assetPackPreviewReady: true,
        assetPackSnapshotStatus: 'idle',
        assetPackSnapshot: {
          version: 1,
          copy: {
            taobao: { title: '淘宝标题', bullets: ['卖点一'] },
            xiaohongshu: { title: '小红书标题', content: '内容', tags: ['#包包'] },
            douyin: { hook: '抖音钩子', script: '脚本', tags: ['#通勤'] },
          },
          strategy: {
            recommendedPlatform: 'taobao',
            heroAngle: '45度主图',
            styleDirection: '高级通勤',
            featureFocus: ['容量'],
            materialFocus: ['皮革'],
            marketingHook: '通勤质感',
            reasoningSummary: '摘要',
          },
          manifest: {
            filename: 'asset-pack-manifest.json',
            model: {
              downloadUrl: 'https://cdn.example.com/model.glb',
              filename: 'model.glb',
            },
            assets: [],
            copyFiles: [],
            strategyFile: {
              filename: 'strategy-summary.json',
              content: '{"ok":true}',
              mimeType: 'application/json',
            },
          },
        },
      },
      created_at: '2026-03-23T10:00:00.000Z',
    },
    unlockRequests: [
      {
        id: 'req_001',
        model_id: 'model_001',
        status: 'submitted',
        contact_name: 'Alice',
        contact_channel: 'wechat',
        contact_value: 'alice',
        note: null,
        approved_at: null,
        rejected_at: null,
        fulfilled_at: null,
        created_at: '2026-03-23T10:01:00.000Z',
        updated_at: '2026-03-23T10:01:00.000Z',
      },
    ],
  })

  assert.equal(
    (detail.model.metadata as { workflowType: string }).workflowType,
    'seller_asset_pack_phase1'
  )
  assert.equal(detail.model.unlockStatus, 'requested')
  assert.equal(detail.model.currentState, 'requested')
  assert.equal(detail.model.copySummary?.taobaoTitle, '淘宝标题')
  assert.equal(detail.model.strategySummary?.recommendedPlatform, 'taobao')

  const insert = unlockRequestsTestables.buildUnlockRequestInsertPayload({
    modelId: ' model_001 ',
    contactName: ' Alice ',
    contactChannel: 'wechat',
    contactValue: ' alice_wechat ',
    note: ' 想解锁 ',
  })

  assert.equal(insert.model_id, 'model_001')
  assert.equal(insert.status, 'submitted')

  assert.equal(
    unlockRequestsTestables.mapUnlockInsertErrorStatus({
      code: '23505',
      constraint: 'idx_unlock_requests_active_model_id',
    }),
    409
  )

  console.log('[test-phase1-api] PASS')
}

main().catch((error) => {
  console.error('[test-phase1-api] FAIL', error)
  process.exit(1)
})
