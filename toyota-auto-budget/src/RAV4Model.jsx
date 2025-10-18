import { useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Suspense } from 'react'
import { Text, Box } from '@react-three/drei'
import * as THREE from 'three'

function RAV4Model({ modelPath }) {
  const meshRef = useRef()
  
  // Load the GLB model
  const gltf = useLoader(GLTFLoader, modelPath)
  
  // Log successful loading and model info
  console.log('3D Model loaded successfully:', gltf)
  
  // Get bounding box info to debug size
  const box = new THREE.Box3().setFromObject(gltf.scene)
  const size = box.getSize(new THREE.Vector3())
  console.log('Model original size:', size)
  console.log('Model bounding box:', box)
  
  // Calculate auto-scale based on model size
  const maxDimension = Math.max(size.x, size.y, size.z)
  const targetSize = 4 // We want the model to be about 4 units large
  const autoScale = maxDimension > 0 ? targetSize / maxDimension : 50
  console.log('Auto-calculated scale:', autoScale)
  
  // Rotate the model continuously
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5 // Adjust speed as needed
    }
  })
  
  // Clone the scene to avoid issues with multiple renders
  const scene = gltf.scene.clone()
  
  // Use the larger of auto-scale or a minimum of 1000x
  const finalScale = Math.max(autoScale, 1000)
  
  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={[finalScale, finalScale, finalScale]} // Smart scaling - 10x larger!
      position={[0, 0, 0]} // Center position
    />
  )
}

// Placeholder model when RAV4 model isn't available
function PlaceholderModel() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <group ref={meshRef}>
      {/* SUV-like shape */}
      <Box args={[3, 1.5, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#c41e3a" />
      </Box>
      {/* Wheels */}
      <mesh position={[-1.2, -0.8, 0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.2, -0.8, 0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.2, -0.8, -0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.2, -0.8, -0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Toyota RAV4
      </Text>
      <Text
        position={[0, -2, 0]}
        fontSize={0.15}
        color="rgba(255,255,255,0.7)"
        anchorX="center"
        anchorY="middle"
      >
        Add rav4.glb to /public/models/
      </Text>
    </group>
  )
}

// Error boundary for model loading
function ModelErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return fallback || <PlaceholderModel />
  }
  
  return children
}

// Loading fallback component
function ModelLoader({ modelPath }) {
  console.log('Loading 3D model from:', modelPath)
  
  return (
    <ModelErrorBoundary fallback={<PlaceholderModel />}>
      <Suspense 
        fallback={
          <group>
            <PlaceholderModel />
            <Text
              position={[0, 2.5, 0]}
              fontSize={0.2}
              color="yellow"
              anchorX="center"
              anchorY="middle"
            >
              Loading 3D Model...
            </Text>
          </group>
        }
      >
        <RAV4Model modelPath={modelPath} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

export default ModelLoader