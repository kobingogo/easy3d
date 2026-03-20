import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 bg-void">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-zinc-500">
            © 2026 easy3d. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
              3D 生成
            </Link>
            <Link href="/agent" className="text-sm text-zinc-500 hover:text-neon-purple transition-colors">
              Agent
            </Link>
            <Link href="/knowledge" className="text-sm text-zinc-500 hover:text-neon-blue transition-colors">
              知识库
            </Link>
          </div>

          <div className="text-sm text-zinc-600">
            Built with <span className="text-neon-blue">Next.js</span> + <span className="text-neon-purple">Three.js</span> + <span className="text-neon-pink">AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}