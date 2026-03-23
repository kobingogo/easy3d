import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

function assertFile(path: string) {
  assert.equal(existsSync(resolve(process.cwd(), path)), true, `缺少文件: ${path}`)
}

async function main() {
  const requiredFiles = [
    'lib/seller-workflow/batch-types.ts',
    'lib/seller-workflow/batch-queue.ts',
    'lib/seller-workflow/batch-export.ts',
    'app/api/batches/route.ts',
    'app/api/batches/[id]/route.ts',
    'app/api/batches/[id]/process/route.ts',
    'app/api/batches/[id]/items/[itemId]/retry/route.ts',
    'app/api/batches/[id]/download/route.ts',
    'app/dashboard/page.tsx',
    'app/dashboard/batches/[id]/page.tsx',
    'components/batch/batch-create-form.tsx',
    'components/batch/batch-progress-panel.tsx',
    'components/batch/batch-item-table.tsx',
  ]

  requiredFiles.forEach(assertFile)

  const batchesRoute = await import('../app/api/batches/route')
  const batchDetailRoute = await import('../app/api/batches/[id]/route')
  const batchProcessRoute = await import('../app/api/batches/[id]/process/route')
  const batchRetryRoute = await import('../app/api/batches/[id]/items/[itemId]/retry/route')
  const batchDownloadRoute = await import('../app/api/batches/[id]/download/route')

  assert.equal(typeof batchesRoute.POST, 'function')
  assert.equal(typeof batchesRoute.GET, 'function')
  assert.equal(typeof batchDetailRoute.GET, 'function')
  assert.equal(typeof batchProcessRoute.POST, 'function')
  assert.equal(typeof batchRetryRoute.POST, 'function')
  assert.equal(typeof batchDownloadRoute.GET, 'function')

  console.log('[test-phase2a-batch-e2e-checklist] PASS')
}

main().catch((error) => {
  console.error('[test-phase2a-batch-e2e-checklist] FAIL', error)
  process.exit(1)
})
