import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 bg-void">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-zinc-500">
            © 2026 easy3d - 卖家商品素材包工作台
          </div>

          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
              开始生成
            </Link>
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-neon-purple transition-colors">
              素材任务
            </Link>
            <Link href="/#workflow" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
              工作流
            </Link>
          </div>

          <div className="text-sm text-zinc-600">
            Phase 1 聚焦包袋 / 小皮具，先预览，再解锁下载
          </div>
        </div>
      </div>
    </footer>
  )
}
