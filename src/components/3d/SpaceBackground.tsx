'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

type ShapeKind = 'ico' | 'octa' | 'torus'

interface ShapeConfig {
  kind: ShapeKind
  position: [number, number, number]
  scale: number
  color: string
}

const COLORS = ['#F97316', '#2D2F7E', '#14B8A6', '#FDDCAA', '#3B3FA8']

/** Deterministic layout so the scene looks the same on every load. */
function buildShapes(count: number): ShapeConfig[] {
  const kinds: ShapeKind[] = ['ico', 'octa', 'torus']
  const out: ShapeConfig[] = []
  for (let i = 0; i < count; i++) {
    const seed = (i + 1) * 9301 + 49297
    const r = (n: number) => (((seed * (n + 1)) % 1000) / 1000)
    out.push({
      kind: kinds[i % kinds.length],
      position: [(r(1) - 0.5) * 14, (r(2) - 0.5) * 9, -r(3) * 40 + 4],
      scale: 0.4 + r(4) * 0.9,
      color: COLORS[i % COLORS.length],
    })
  }
  return out
}

function SpaceScene() {
  const shapes = useMemo(() => buildShapes(16), [])
  const meshRefs = useRef<THREE.Mesh[]>([])
  const pointsRef = useRef<THREE.Points>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const progress = useRef(0)

  const particlePositions = useMemo(() => {
    const count = 320
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 36
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24
      arr[i * 3 + 2] = -Math.random() * 50 + 6
    }
    return arr
  }, [])

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.current = max > 0 ? window.scrollY / max : 0
    }
    onScroll()
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useFrame((state, delta) => {
    const p = progress.current
    const cam = state.camera

    // Scrolling flies the camera forward through the scene (the "zoom" effect).
    const targetZ = 9 - p * 22
    cam.position.z += (targetZ - cam.position.z) * 0.08
    cam.position.x += (pointer.current.x * 0.7 - cam.position.x) * 0.04
    cam.position.y += (-pointer.current.y * 0.45 - cam.position.y) * 0.04
    cam.lookAt(0, 0, -12)

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const dir = i % 2 === 0 ? 1 : -1
      mesh.rotation.x += delta * 0.18 * dir
      mesh.rotation.y += delta * 0.22
    })

    if (pointsRef.current) {
      pointsRef.current.rotation.z = p * 0.7
    }
  })

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <pointLight position={[-6, -4, 4]} color="#14B8A6" intensity={0.9} />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#F97316" transparent opacity={0.55} sizeAttenuation />
      </points>

      {shapes.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el
          }}
          position={s.position}
          scale={s.scale}
        >
          {s.kind === 'ico' && <icosahedronGeometry args={[1, 0]} />}
          {s.kind === 'octa' && <octahedronGeometry args={[1, 0]} />}
          {s.kind === 'torus' && <torusGeometry args={[1, 0.32, 16, 48]} />}
          <meshStandardMaterial color={s.color} roughness={0.35} metalness={0.15} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

/**
 * Full-page 3D backdrop. Scroll moves the camera through the scene and the
 * pointer adds parallax. Only rendered on desktop and when motion is allowed.
 */
export default function SpaceBackground() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(desktop && !reduce)
  }, [])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 9], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <SpaceScene />
      </Canvas>
    </div>
  )
}
