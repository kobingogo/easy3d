export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          easy3d 🌀
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          一张图，30 秒，生成你的 3D 商品展示
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/generate"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始生成
          </a>
          <a
            href="/agent"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Agent 控制台
          </a>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🧠 RAG 能力</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            知识库问答，向量检索，智能推荐 3D 展示方案
          </p>
          <a href="/knowledge" className="text-blue-600 text-sm mt-2 inline-block">
            查看演示 →
          </a>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🤖 Agent 能力</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            自动化工作流，多工具编排，一句话完成 3D 生成
          </p>
          <a href="/agent" className="text-blue-600 text-sm mt-2 inline-block">
            查看演示 →
          </a>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🎯 Prompt 优化</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            电商提示词优化，质量提升 40%+
          </p>
          <a href="/fine-tune" className="text-blue-600 text-sm mt-2 inline-block">
            查看演示 →
          </a>
        </div>
      </div>
    </main>
  );
}