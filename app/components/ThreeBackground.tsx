'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeBackgroundProps {
  isFullscreen?: boolean
  timerProgress?: number
}

export default function ThreeBackground({ isFullscreen = false, timerProgress = 0 }: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const particlesRef = useRef<THREE.Points>()
  const waveRef = useRef<THREE.Mesh>()
  const animationIdRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    })
    rendererRef.current = renderer
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Particle system
    const particleCount = isFullscreen ? 8000 : 4000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100

      const color = new THREE.Color()
      color.setHSL(
        (Math.random() * 0.3 + 0.5) % 1, // Blue to purple range
        0.7 + Math.random() * 0.3,
        0.5 + Math.random() * 0.3
      )
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = Math.random() * 3 + 1
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: timerProgress }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float progress;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Wave motion
          pos.y += sin(pos.x * 0.01 + time * 0.5) * 5.0;
          pos.z += cos(pos.y * 0.01 + time * 0.3) * 3.0;
          
          // Progress-based movement
          pos += normalize(pos) * progress * 20.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    particlesRef.current = particles
    scene.add(particles)

    // Animated wave geometry
    const waveGeometry = new THREE.PlaneGeometry(200, 200, 128, 128)
    const waveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: timerProgress },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        uniform float time;
        uniform float progress;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          float elevation = sin(pos.x * 0.02 + time * 0.5) * 
                           cos(pos.y * 0.02 + time * 0.3) * 
                           (10.0 + progress * 20.0);
          
          pos.z = elevation;
          vElevation = elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float progress;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vec3 color1 = vec3(0.1, 0.2, 0.8);
          vec3 color2 = vec3(0.8, 0.2, 0.8);
          vec3 color3 = vec3(0.2, 0.8, 0.8);
          
          float mixValue = (vElevation + 10.0) / 20.0;
          vec3 finalColor = mix(color1, color2, mixValue);
          finalColor = mix(finalColor, color3, progress);
          
          float alpha = 0.1 + sin(time * 0.5 + vUv.x * 10.0) * 0.05;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })

    const wave = new THREE.Mesh(waveGeometry, waveMaterial)
    wave.rotation.x = -Math.PI / 2
    wave.position.y = -50
    waveRef.current = wave
    scene.add(wave)

    camera.position.z = 50
    camera.position.y = 20

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001

      if (particlesRef.current) {
        const material = particlesRef.current.material as THREE.ShaderMaterial
        material.uniforms.time.value = time
        material.uniforms.progress.value = timerProgress
        
        particlesRef.current.rotation.y = time * 0.1
        particlesRef.current.rotation.x = Math.sin(time * 0.05) * 0.1
      }

      if (waveRef.current) {
        const material = waveRef.current.material as THREE.ShaderMaterial
        material.uniforms.time.value = time
        material.uniforms.progress.value = timerProgress
      }

      // Camera movement
      camera.position.x = Math.sin(time * 0.1) * 10
      camera.position.z = 50 + Math.cos(time * 0.05) * 20
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      
      if (waveRef.current) {
        const material = waveRef.current.material as THREE.ShaderMaterial
        material.uniforms.resolution.value.set(width, height)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isFullscreen, timerProgress])

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 ${isFullscreen ? 'z-50' : 'z-0'}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}