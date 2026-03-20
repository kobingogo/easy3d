'use client'

import Link from 'next/link'
import { NeonButton } from '@/components/ui/neon-button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-void/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-neon-blue transition-colors">
          <span className="text-neon-blue">easy</span>3d
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/generate" className="text-sm text-zinc-400 hover:text-neon-blue transition-colors">
            3D 生成
          </Link>
          <Link href="/agent" className="text-sm text-zinc-400 hover:text-neon-purple transition-colors">
            Agent
          </Link>
          <Link href="/knowledge" className="text-sm text-zinc-400 hover:text-neon-blue transition-colors">
            知识库
          </Link>
          <Link href="/fine-tune" className="text-sm text-zinc-400 hover:text-neon-pink transition-colors">
            Prompt 优化
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            登录
          </button>
          <NeonButton
            variant="outline"
            color="blue"
            size="sm"
            onClick={() => window.location.href = '/generate'}
          >
            开始使用
          </NeonButton>
        </div>
      </div>
    </header>
  )
}