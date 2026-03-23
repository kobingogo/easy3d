'use client'

import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2, AlertCircle } from 'lucide-react'

interface ModelViewerProps {
  modelUrl: string
  autoRotate?: boolean
  showControls?: boolean
  showProgress?: boolean
  className?: string
}

/**
 * 获取代理后的模型 URL
 * 解决 Tripo CDN 的 CORS 问题
 */
function getProxiedUrl(url: string): string {
  if (!url) return url

  // 检查是否是 Tripo CDN URL
  if (url.includes('tripo3d.com') || url.includes('tripo-data')) {
    // 使用代理端点
    return `/api/proxy/model?url=${encodeURIComponent(url)}`
  }

  return url
}

function Model({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const proxiedUrl = useMemo(() => getProxiedUrl(url), [url])
  const modelRef = useRef<THREE.Group>(null)

  // 使用 useGLTF 加载模型
  const { scene } = useGLTF(proxiedUrl)

  // 模型加载完成
  useEffect(() => {
    if (scene) {
      // 自动调整模型大小以适应视图
      const box = new THREE.Box3().setFromObject(scene)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      if (maxDim > 2) {
        const scale = 2 / maxDim
        scene.scale.setScalar(scale)
      }

      // 居中模型
      const center = box.getCenter(new THREE.Vector3())
      scene.position.sub(center)

      onLoad?.()
    }
  }, [scene, onLoad])

  // 自动旋转
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Center>
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </Center>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">加载模型中...</span>
      </div>
    </Html>
  )
}

export function ModelViewer({
  modelUrl,
  autoRotate = true,
  showControls = true,
  showProgress = true,
  className = ''
}: ModelViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // 重置状态
  useEffect(() => {
    if (modelUrl) {
      setLoadError(null)
      setIsLoading(true)
    }
  }, [modelUrl])

  return (
    <div className={`w-full h-full min-h-[400px] relative ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
        onError={(error) => {
          console.error('Canvas error:', error)
          setLoadError('渲染错误')
          setIsLoading(false)
        }}
      >
        {/* 场景设置 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />
        {/* <pointLight position={[-10, -10, -5]} intensity={0.3} color="#00D4FF" />
        <pointLight position={[10, -10, 5]} intensity={0.3} color="#7C3AED" /> */}

        <Suspense fallback={<LoadingFallback />}>
         <Environment preset="studio" />
          {modelUrl && (
            <Model
              url={modelUrl}
              onLoad={() => {
                setIsLoading(false)
              }}
            />
          )}
        </Suspense>

        {showControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
            enableDamping
            dampingFactor={0.05}
          />
        )}
      </Canvas>

      {/* 加载状态覆盖层 */}
      {isLoading && showProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-sm text-white">加载模型中...</span>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-red-400">
            <AlertCircle className="w-10 h-10" />
            <span className="text-sm">模型加载失败</span>
            <span className="text-xs text-red-300 max-w-[200px] text-center">{loadError}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// 预加载模型（优化后续加载）
export function preloadModel(url: string) {
  const proxiedUrl = getProxiedUrl(url)
  useGLTF.preload(proxiedUrl)
}