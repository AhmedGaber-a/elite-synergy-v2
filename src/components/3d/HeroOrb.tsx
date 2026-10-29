'use client'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import type * as THREE from 'three'

const HERO_IMAGE = encodeURI('/Diverse Student Study Group.png')

function PhotoCard() {
  const texture = useTexture(HERO_IMAGE)
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = Math.sin(t * 0.45) * 0.28
    ref.current.rotation.x = Math.cos(t * 0.3) * 0.08
  })

  return (
    <mesh ref={ref}>
      <planeGeometry args={[3.2, 2]} />
      <meshStandardMaterial map={texture} roughness={0.6} metalness={0} />
    </mesh>
  )
}

function OrbitingOrbs() {
  const refs = useRef<THREE.Mesh[]>([])
  const colors = ['#F97316', '#14B8A6', '#2D2F7E', '#FDDCAA', '#F97316', '#14B8A6']

  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const angle = t * 0.5 + (i * Math.PI * 2) / refs.current.length
      mesh.position.x = Math.cos(angle) * 2.5
      mesh.position.z = Math.sin(angle) * 1.2
      mesh.position.y = Math.sin(t * 1.2 + i) * 0.4
    })
  })

  return (
    <>
      {colors.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={c} roughness={0.25} metalness={0.2} />
        </mesh>
      ))}
    </>
  )
}

/**
 * Hero visual: the group photo as a floating 3D card with orbiting accents.
 * Drag to rotate, scroll the mouse wheel over it to zoom in and out.
 */
export function HeroOrb() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 40 }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, -2, 3]} color="#F97316" intensity={0.7} />
      <Suspense fallback={null}>
        <PhotoCard />
      </Suspense>
      <OrbitingOrbs />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.5}
        maxDistance={9}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  )
}

export default HeroOrb
