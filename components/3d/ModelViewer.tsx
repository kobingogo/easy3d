'use client'

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'

interface ModelViewerProps {
  modelUrl: string
  autoRotate?: boolean
  showControls?: boolean
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

function Model({ url }: { url: string }) {
  const proxiedUrl = useMemo(() => getProxiedUrl(url), [url])
  const { scene } = useGLTF(proxiedUrl)
  const modelRef = useRef<THREE.Group>(null)

  // 自动旋转
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Center>
      <group ref={modelRef}>
        <primitive object={scene} scale={1} />
      </group>
    </Center>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}

export function ModelViewer({
  modelUrl,
  autoRotate = true,
  showControls = true,
  className = ''
}: ModelViewerProps) {
  return (
    <div className={`w-full h-full min-h-[400px] ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        {showControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
          />
        )}
      </Canvas>
    </div>
  )
}

// 预加载模型（仅在 URL 提供时）
// useGLTF.preload() 需要在模型 URL 确定后调用