import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, TrendingUp } from 'lucide-react'

export default function FineTunePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Prompt 优化</h1>
        <p className="text-muted-foreground mb-8">
          电商提示词优化引擎，质量提升 40%+
        </p>

        <Tabs defaultValue="optimize" className="space-y-6">
          <TabsList>
            <TabsTrigger value="optimize">提示词优化</TabsTrigger>
            <TabsTrigger value="compare">效果对比</TabsTrigger>
            <TabsTrigger value="templates">模板管理</TabsTrigger>
          </TabsList>

          <TabsContent value="optimize">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  输入商品描述
                </CardTitle>
                <CardDescription>
                  输入简单的商品描述，生成专业的英文提示词
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">商品描述</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="例如：女包，棕色，皮质"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">风格选择</label>
                      <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="default">默认</option>
                        <option value="luxury">奢华</option>
                        <option value="tech">科技</option>
                        <option value="natural">自然</option>
                        <option value="trendy">潮流</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full">生成优化提示词</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  优化前后对比
                </CardTitle>
                <CardDescription>
                  直观展示优化效果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2 text-muted-foreground">优化前</h3>
                    <Card className="bg-muted/50">
                      <CardContent className="py-4">
                        <p className="text-sm font-mono">
                          A red lipstick product
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>专业性</span>
                            <span>4/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>详细度</span>
                            <span>3/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>可执行性</span>
                            <span>5/10</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-green-600">优化后</h3>
                    <Card className="border-green-500">
                      <CardContent className="py-4">
                        <p className="text-sm font-mono">
                          Professional product photography of a luxury matte red lipstick,
                          elegant gradient background with soft pink tones, studio lighting,
                          8K resolution, photorealistic...
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>专业性</span>
                            <span className="text-green-600">9/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>详细度</span>
                            <span className="text-green-600">8/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>可执行性</span>
                            <span className="text-green-600">9/10</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold text-green-600">+45%</p>
                  <p className="text-sm text-muted-foreground">整体质量提升</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'default', desc: '标准产品摄影', style: '通用' },
                { name: 'luxury', desc: '奢华高端展示', style: '珠宝、美妆' },
                { name: 'tech', desc: '科技感渲染', style: '3C 数码' },
                { name: 'natural', desc: '自然风格', style: '食品、家居' },
                { name: 'trendy', desc: '潮流年轻化', style: '服装、鞋帽' },
              ].map((template) => (
                <Card key={template.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">适用：{template.style}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}