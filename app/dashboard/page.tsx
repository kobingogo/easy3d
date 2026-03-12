import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的模型</h1>
          <p className="text-muted-foreground">管理你生成的 3D 模型</p>
        </div>
        <Link href="/generate">
          <Button>创建新模型</Button>
        </Link>
      </div>

      {/* 空状态 */}
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            还没有生成任何模型
          </p>
          <Link href="/generate">
            <Button>开始创建</Button>
          </Link>
        </CardContent>
      </Card>

      {/* TODO: 模型列表 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => (
          <Card key={model.id}>
            <CardHeader>
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>{model.createdAt}</CardDescription>
            </CardHeader>
            <CardContent>
              <ModelViewer modelUrl={model.url} className="aspect-square" />
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  )
}