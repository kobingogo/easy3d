import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          easy3d 🌀
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/generate" className="text-sm hover:text-primary">
            3D 生成
          </Link>
          <Link href="/agent" className="text-sm hover:text-primary">
            Agent
          </Link>
          <Link href="/knowledge" className="text-sm hover:text-primary">
            知识库
          </Link>
          <Link href="/fine-tune" className="text-sm hover:text-primary">
            Prompt 优化
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            登录
          </Button>
          <Button size="sm">
            开始使用
          </Button>
        </div>
      </div>
    </header>
  )
}