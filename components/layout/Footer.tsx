import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 easy3d. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground">
              3D 生成
            </Link>
            <Link href="/agent" className="text-sm text-muted-foreground hover:text-foreground">
              Agent
            </Link>
            <Link href="/knowledge" className="text-sm text-muted-foreground hover:text-foreground">
              知识库
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            Built with Next.js + Three.js + AI
          </div>
        </div>
      </div>
    </footer>
  )
}