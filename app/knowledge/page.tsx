'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Search, Plus, Loader2, Sparkles } from 'lucide-react'

interface KnowledgeEntry {
  id: string
  text: string
  category: string
  tags: string[]
  keywords: string[]
  priority: number
  source: string
  examples?: string[]
}

interface SearchResult {
  entry: {
    id: string
    text: string
    category: string
    tags: string[]
    priority: number
  }
  score: number
  rerankScore?: number
}

interface Stats {
  total: number
  byCategory: Record<string, number>
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [answerLoading, setAnswerLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  // 搜索知识
  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setAnswer(null)

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query,
          options: { limit: 5, enableRerank: true }
        })
      })

      const data = await res.json()

      if (data.success) {
        setResults(data.results)
        setLatency(data.latency)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 智能问答
  const handleAsk = async () => {
    if (!query.trim()) return

    setAnswerLoading(true)
    setResults([])

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask',
          query
        })
      })

      const data = await res.json()

      if (data.success) {
        setAnswer(data.answer)
        setResults(data.references)
        setLatency(data.latency)
      }
    } catch (error) {
      console.error('Ask error:', error)
    } finally {
      setAnswerLoading(false)
    }
  }

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/knowledge?action=stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Stats error:', error)
    }
  }

  // 获取知识条目列表
  const fetchEntries = async (category: string) => {
    setEntriesLoading(true)
    setSelectedCategory(category)

    try {
      const res = await fetch(`/api/knowledge?action=list&category=${category}&limit=50`)
      const data = await res.json()
      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error) {
      console.error('Fetch entries error:', error)
    } finally {
      setEntriesLoading(false)
    }
  }

  // 切换到统计 Tab 时获取数据
  const handleTabChange = (value: string) => {
    if (value === 'stats' && !stats) {
      fetchStats()
    }
  }

  const categoryLabels: Record<string, string> = {
    product_category: '商品品类',
    scene_design: '场景设计',
    lighting: '光照摄影',
    style_template: '风格模板',
    platform_spec: '平台规范'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">RAG 知识库</h1>
        <p className="text-muted-foreground mb-8">
          电商 3D 展示知识库，支持语义检索和智能推荐
        </p>

        <Tabs defaultValue="search" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="search">知识检索</TabsTrigger>
            <TabsTrigger value="manage">知识管理</TabsTrigger>
            <TabsTrigger value="stats">统计信息</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  语义搜索
                </CardTitle>
                <CardDescription>
                  输入查询，检索相关的 3D 展示知识
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="例如：口红怎么展示效果最好"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
                    </Button>
                    <Button variant="outline" onClick={handleAsk} disabled={answerLoading}>
                      {answerLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>支持自然语言查询，基于向量语义检索</span>
                    <Button variant="ghost" size="sm" onClick={handleAsk} disabled={answerLoading}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      智能问答
                    </Button>
                  </div>

                  {/* 延迟显示 */}
                  {latency && (
                    <div className="text-xs text-muted-foreground">
                      响应时间: {latency}ms
                    </div>
                  )}

                  {/* 智能问答答案 */}
                  {answer && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">智能回答</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{answer}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 搜索结果 */}
                  {results.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm font-medium">检索结果 ({results.length} 条)</p>
                      {results.map((result, index) => (
                        <Card key={result.entry.id} className="bg-muted/50">
                          <CardContent className="py-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted-foreground">
                                #{index + 1} · {categoryLabels[result.entry.category] || result.entry.category}
                              </span>
                              <div className="flex gap-2 text-xs">
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  相似度: {(result.score * 100).toFixed(1)}%
                                </span>
                                {result.rerankScore && (
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    重排: {(result.rerankScore * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm">{result.entry.text}</p>
                            <div className="flex gap-2 mt-2">
                              {result.entry.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-primary/10 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  知识条目
                </CardTitle>
                <CardDescription>
                  共 {stats?.total || 130} 条知识，覆盖 5 大分类
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === 'product_category' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchEntries('product_category')}
                    >
                      商品品类 ({stats?.byCategory?.product_category || 50})
                    </Button>
                    <Button
                      variant={selectedCategory === 'scene_design' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchEntries('scene_design')}
                    >
                      场景设计 ({stats?.byCategory?.scene_design || 30})
                    </Button>
                    <Button
                      variant={selectedCategory === 'lighting' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchEntries('lighting')}
                    >
                      光照摄影 ({stats?.byCategory?.lighting || 20})
                    </Button>
                    <Button
                      variant={selectedCategory === 'style_template' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchEntries('style_template')}
                    >
                      风格模板 ({stats?.byCategory?.style_template || 20})
                    </Button>
                    <Button
                      variant={selectedCategory === 'platform_spec' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchEntries('platform_spec')}
                    >
                      平台规范 ({stats?.byCategory?.platform_spec || 10})
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      添加知识
                    </Button>
                  </div>

                  {/* 条目列表 */}
                  {entriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : entries.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {entries.map((entry) => (
                        <Card key={entry.id} className="bg-muted/30">
                          <CardContent className="py-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted-foreground">
                                {categoryLabels[entry.category] || entry.category}
                              </span>
                              <div className="flex gap-2 text-xs">
                                <span className="bg-primary/10 px-2 py-0.5 rounded">
                                  优先级: {entry.priority}
                                </span>
                                <span className="bg-muted px-2 py-0.5 rounded">
                                  {entry.source === 'llm-generated' ? 'AI生成' : '手动添加'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm mb-2">{entry.text}</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {entry.examples && entry.examples.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                示例: {entry.examples.join('、')}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : selectedCategory ? (
                    <div className="text-center py-8 text-muted-foreground">
                      该分类暂无知识条目
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      选择分类查看知识条目
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>总条目数</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.total || '---'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>向量维度</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1024</p>
                  <p className="text-xs text-muted-foreground">text-embedding-v3</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>检索策略</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold">向量 + Reranker</p>
                  <p className="text-xs text-muted-foreground">准确率提升 5-10%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>分类统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.byCategory && Object.entries(stats.byCategory).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span>{categoryLabels[key] || key}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(value / (stats?.total || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{value} 条</span>
                      </div>
                    </div>
                  ))}
                  {!stats && (
                    <div className="text-center text-muted-foreground py-4">
                      点击刷新获取实时数据
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={fetchStats}
                >
                  刷新统计
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}