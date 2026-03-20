'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

// Star colors for realistic cosmic effect
const STAR_COLORS = {
  white: '#FFFFFF',
  blue: '#A0C4FF',
  yellow: '#FFF4A3',
  orange: '#FFB563',
  red: '#FF8B8B',
  cyan: '#00D4FF',
  purple: '#B794F6',
}

// Nebula colors
const NEBULA_COLORS = {
  blue: '#1E3A8A',
  purple: '#581C87',
  pink: '#831843',
  cyan: '#0E7490',
}

// ============ SHOOTING STAR ============
interface ShootingStarProps {
  startPosition: [number, number, number]
  delay: number
}

function ShootingStar({ startPosition, delay }: ShootingStarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const cycle = (time + delay) % 8

    if (cycle < 0.6) {
      setVisible(true)
      const t = cycle / 0.6
      setProgress(t)
      if (meshRef.current) {
        // Move diagonally across the sky
        meshRef.current.position.x = startPosition[0] + t * 15
        meshRef.current.position.y = startPosition[1] - t * 10
        meshRef.current.position.z = startPosition[2]

        // Fade out at the end
        const material = meshRef.current.material as THREE.MeshBasicMaterial
        material.opacity = Math.sin(t * Math.PI) * 0.9
      }
    } else {
      setVisible(false)
    }
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} position={startPosition}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
    </mesh>
  )
}

// ============ COSMIC DUST PARTICLES ============
interface CosmicDustProps {
  count: number
  spread: number
}

function CosmicDust({ count, spread }: CosmicDustProps) {
  const points = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const colorOptions = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#A0C4FF'),
      new THREE.Color('#FFF4A3'),
      new THREE.Color('#00D4FF'),
    ]

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = Math.pow(Math.random(), 0.5) * spread

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi) - spread * 0.5 // Push back

      // Random star color
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Varied sizes
      sizes[i] = Math.random() * 0.5 + 0.1
    }

    return { positions, colors, sizes }
  }, [count, spread])

  useFrame((state) => {
    if (points.current) {
      // Slow rotation for parallax effect
      points.current.rotation.y = state.clock.elapsedTime * 0.008
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.1
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// ============ NEBULA CLOUD ============
interface NebulaCloudProps {
  position: [number, number, number]
  color: string
  scale: number
  opacity: number
}

function NebulaCloud({ position, color, scale, opacity }: NebulaCloudProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing
      const pulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + 1
      meshRef.current.scale.setScalar(scale * pulse)

      // Slow rotation
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  )
}

// ============ BRIGHT STAR ============
interface BrightStarProps {
  position: [number, number, number]
  color: string
  size: number
  twinkleSpeed: number
}

function BrightStar({ position, color, size, twinkleSpeed }: BrightStarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime * twinkleSpeed
    const twinkle = (Math.sin(time) + Math.sin(time * 2.3) + Math.sin(time * 4.7)) / 3

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.8 + twinkle * 0.2
    }

    if (glowRef.current) {
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = 0.3 + twinkle * 0.15
      glowRef.current.scale.setScalar(1 + twinkle * 0.3)
    }
  })

  return (
    <group position={position}>
      {/* Star core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* Star glow */}
      <mesh ref={glowRef} scale={3}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// ============ GALAXY SPIRAL ============
function GalaxySpiral() {
  const points = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const armCount = 2
    const particlesPerArm = 800
    const totalParticles = armCount * particlesPerArm

    const positions = new Float32Array(totalParticles * 3)
    const colors = new Float32Array(totalParticles * 3)

    const coreColor = new THREE.Color('#FFFFFF')
    const armColor1 = new THREE.Color('#00D4FF')
    const armColor2 = new THREE.Color('#7C3AED')

    for (let arm = 0; arm < armCount; arm++) {
      const armOffset = (arm / armCount) * Math.PI * 2

      for (let i = 0; i < particlesPerArm; i++) {
        const idx = arm * particlesPerArm + i

        // Spiral formula
        const t = i / particlesPerArm
        const radius = t * 8 + Math.random() * 0.5
        const angle = armOffset + t * 4 + (Math.random() - 0.5) * 0.5

        positions[idx * 3] = Math.cos(angle) * radius
        positions[idx * 3 + 1] = (Math.random() - 0.5) * 0.3 // Flat galaxy
        positions[idx * 3 + 2] = Math.sin(angle) * radius - 20 // Push far back

        // Color gradient: white center to colored arms
        const color = t < 0.2
          ? coreColor.clone().lerp(arm % 2 === 0 ? armColor1 : armColor2, t * 5)
          : arm % 2 === 0 ? armColor1 : armColor2

        colors[idx * 3] = color.r
        colors[idx * 3 + 1] = color.g
        colors[idx * 3 + 2] = color.b
      }
    }

    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={points} position={[5, 2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// ============ MOUSE PARALLAX ============
function CameraParallax() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 0.5, 0.02)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.current.y * 0.3, 0.02)
    camera.lookAt(0, 0, -10)
  })

  return null
}

// ============ MAIN SCENE ============
function CosmicScene() {
  // Bright foreground stars
  const brightStars = useMemo(() => [
    { position: [-3, 2, -5] as [number, number, number], color: STAR_COLORS.cyan, size: 0.08, twinkleSpeed: 2.1 },
    { position: [4, 1, -6] as [number, number, number], color: STAR_COLORS.yellow, size: 0.06, twinkleSpeed: 1.8 },
    { position: [-1, -2, -4] as [number, number, number], color: STAR_COLORS.white, size: 0.1, twinkleSpeed: 2.5 },
    { position: [2, 3, -7] as [number, number, number], color: STAR_COLORS.orange, size: 0.05, twinkleSpeed: 1.5 },
    { position: [-4, -1, -8] as [number, number, number], color: STAR_COLORS.blue, size: 0.07, twinkleSpeed: 2.3 },
    { position: [5, -2, -5] as [number, number, number], color: STAR_COLORS.purple, size: 0.06, twinkleSpeed: 1.9 },
    { position: [0, 4, -9] as [number, number, number], color: STAR_COLORS.white, size: 0.05, twinkleSpeed: 2.0 },
    { position: [-5, 0, -6] as [number, number, number], color: STAR_COLORS.cyan, size: 0.04, twinkleSpeed: 1.7 },
  ], [])

  // Shooting stars
  const shootingStars = useMemo(() => [
    { startPosition: [-10, 5, -5] as [number, number, number], delay: 0 },
    { startPosition: [8, 6, -8] as [number, number, number], delay: 3 },
    { startPosition: [-6, 8, -6] as [number, number, number], delay: 6 },
  ], [])

  // Nebula clouds
  const nebulae = useMemo(() => [
    { position: [-8, 3, -15] as [number, number, number], color: '#1E3A8A', scale: 3, opacity: 0.15 },
    { position: [7, -2, -18] as [number, number, number], color: '#581C87', scale: 4, opacity: 0.12 },
    { position: [0, 5, -20] as [number, number, number], color: '#0E7490', scale: 2.5, opacity: 0.1 },
    { position: [-4, -4, -16] as [number, number, number], color: '#831843', scale: 3.5, opacity: 0.08 },
  ], [])

  return (
    <>
      {/* Deep space ambient */}
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000005', 10, 50]} />

      {/* Multiple star layers at different depths */}
      <Stars radius={50} depth={30} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <Stars radius={80} depth={40} count={1500} factor={2} saturation={0.2} fade speed={0.3} />
      <Stars radius={120} depth={60} count={1000} factor={1.5} saturation={0.3} fade speed={0.2} />

      {/* Distant galaxy */}
      <GalaxySpiral />

      {/* Nebula clouds */}
      {nebulae.map((nebula, i) => (
        <NebulaCloud key={i} {...nebula} />
      ))}

      {/* Cosmic dust particles */}
      <CosmicDust count={500} spread={25} />

      {/* Bright twinkling stars */}
      {brightStars.map((star, i) => (
        <BrightStar key={i} {...star} />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star, i) => (
        <ShootingStar key={i} {...star} />
      ))}

      {/* Camera parallax */}
      <CameraParallax />
    </>
  )
}

// ============ MAIN COMPONENT ============
interface AnimatedBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function AnimatedBackground({ className = '', intensity = 'medium' }: AnimatedBackgroundProps) {
  const settings = {
    low: { dpr: 1 as const, stars: 500 },
    medium: { dpr: 1.5 as const, stars: 1500 },
    high: { dpr: 2 as const, stars: 2500 }
  }

  const config = settings[intensity]

  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      {/* Deep void base */}
      <div className="absolute inset-0 bg-[#000005]" />

      {/* Subtle radial gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(30, 58, 138, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(88, 28, 135, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 80%, rgba(14, 116, 144, 0.08) 0%, transparent 40%)'
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={config.dpr}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CosmicScene />
      </Canvas>

      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 5, 0.6) 100%)'
        }}
      />
    </div>
  )
}

// ============ CSS FALLBACK ============
export function CSSAnimatedBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#000005]" />

      {/* Animated nebula gradients */}
      <div
        className="absolute -top-1/2 -left-1/4 w-full h-full opacity-30 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(30, 58, 138, 0.4) 0%, transparent 50%)',
          animationDuration: '8s'
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-3/4 h-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(88, 28, 135, 0.35) 0%, transparent 50%)',
          animation: 'pulse 10s ease-in-out infinite',
          animationDelay: '2s'
        }}
      />

      {/* Star-like dots using CSS */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 5, 0.7) 100%)'
        }}
      />
    </div>
  )
}