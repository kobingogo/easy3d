'use client'

import { useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'

export default function GeneratePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [modelUrl, setModelUrl] = useState<string | null>(null)

  const handleUpload = async (files: File[]) => {
    const file = files[0]
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setModelUrl(null)
    setProgress(0)
  }

  const handleGenerate = async () => {
    if (!uploadedFile) return

    setIsGenerating(true)
    setProgress(0)

    // 模拟生成过程
    // TODO: 实际调用 /api/generate
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(i)
    }

    // 模拟生成完成
    setIsGenerating(false)
    // 使用一个演示模型 URL
    setModelUrl('https://modelviewer.dev/shared-assets/models/Astronaut.glb')
  }

  const handleExport = (format: 'glb' | 'gif' | 'mp4') => {
    // TODO: 实现导出功能
    console.log('Export as:', format)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">3D 模型生成</h1>
        <p className="text-muted-foreground mb-8">
          上传商品图片，AI 自动生成 3D 模型
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传区域 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. 上传图片</CardTitle>
                <CardDescription>
                  支持 JPG、PNG、WebP 格式，最大 10MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone onUpload={handleUpload} maxFiles={1} />
              </CardContent>
            </Card>

            {previewUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {uploadedFile && !modelUrl && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '开始生成 3D 模型'
                )}
              </Button>
            )}
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>2. 生成结果</CardTitle>
                <CardDescription>
                  生成时间约 30-60 秒
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="space-y-4">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">
                      正在生成 3D 模型... {progress}%
                    </p>
                  </div>
                )}

                {modelUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <ModelViewer modelUrl={modelUrl} className="w-full h-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleExport('glb')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载 GLB
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleExport('gif')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载 GIF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      上传图片后开始生成
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}