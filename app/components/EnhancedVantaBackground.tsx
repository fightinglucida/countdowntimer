'use client'

import { useEffect, useRef } from 'react'

interface EnhancedVantaBackgroundProps {
  effect: string
  isTimerRunning?: boolean
}

export default function EnhancedVantaBackground({ effect, isTimerRunning = false }: EnhancedVantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    const loadVanta = async () => {
      if (typeof window === 'undefined' || !vantaRef.current) return

      try {
        console.log(`开始加载 Vanta.js ${effect} 效果...`)
        
        // 动态加载 Three.js
        if (!(window as any).THREE) {
          console.log('加载 Three.js...')
          const threeScript = document.createElement('script')
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
          document.head.appendChild(threeScript)
          
          await new Promise((resolve, reject) => {
            threeScript.onload = () => {
              console.log('Three.js 加载成功')
              resolve(true)
            }
            threeScript.onerror = () => {
              console.error('Three.js 加载失败')
              reject(new Error('Three.js failed to load'))
            }
          })
        }

        // 销毁之前的效果
        if (vantaEffect.current) {
          vantaEffect.current.destroy()
          vantaEffect.current = null
        }

        // 根据效果类型加载对应的 Vanta 脚本
        const effectConfigs = {
          cells: {
            script: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js',
            config: {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              color1: 0x1a4d3a,
              color2: 0x2d8659,
              size: 1.50,
              speed: 1.20
            }
          },
          halo: {
            script: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js',
            config: {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              baseColor: 0x1a1a2e,
              backgroundColor: 0x0f0f23,
              amplitudeFactor: 1.00,
              xOffset: 0.10,
              yOffset: 0.10,
              size: 1.00
            }
          },
          clouds: {
            script: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js',
            config: {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              skyColor: 0x68b8d7,
              cloudColor: 0xadc1de,
              cloudShadowColor: 0x183550,
              sunColor: 0xff9919,
              sunGlareColor: 0xff6633,
              sunlightColor: 0xff9933,
              speed: 1.00
            }
          },
          fog: {
            script: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js',
            config: {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              highlightColor: 0xffa500,
              midtoneColor: 0xff7700,
              lowlightColor: 0xff4500,
              baseColor: 0xffaa00,
              blurFactor: 0.2,
              speed: 1.20,
              zoom: 1.50
            }
          },
          waves: {
            script: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js',
            config: {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              color: 0x3f7cac,        // 柔和海水青色
              shininess: 10.00,       // 降低高光，柔和一些
              waveHeight: 12.00,      // 降低波高
              waveSpeed: 0.80,        // 降低速度
              zoom: 0.6              // 放大一点，显得更平缓
            }
          }
        }

        const currentEffect = effectConfigs[effect as keyof typeof effectConfigs]
        if (!currentEffect) {
          console.error(`未知的效果类型: ${effect}`)
          return
        }

        // 检查是否已经加载了对应的 Vanta 效果
        const effectNameMap = {
          'halo': 'HALO',
          'cells': 'CELLS',
          'clouds': 'CLOUDS',
          'fog': 'FOG',
          'waves': 'WAVES'
        }
        const effectName = effectNameMap[effect as keyof typeof effectNameMap] || effect.toUpperCase()
        if (!(window as any).VANTA || !(window as any).VANTA[effectName]) {
          console.log(`加载 Vanta ${effectName}...`)
          const vantaScript = document.createElement('script')
          vantaScript.src = currentEffect.script
          document.head.appendChild(vantaScript)
          
          await new Promise((resolve, reject) => {
            vantaScript.onload = () => {
              console.log(`Vanta ${effectName} 加载成功`)
              resolve(true)
            }
            vantaScript.onerror = () => {
              console.error(`Vanta ${effectName} 加载失败`)
              reject(new Error(`Vanta ${effectName} failed to load`))
            }
          })
        }

        // 创建 Vanta 效果
        if ((window as any).VANTA && (window as any).VANTA[effectName]) {
          console.log(`创建 Vanta ${effectName} 效果...`)
          vantaEffect.current = (window as any).VANTA[effectName]({
            el: vantaRef.current,
            ...currentEffect.config
          })
          console.log(`Vanta ${effectName} 效果创建成功!`)
        } else {
          console.error(`Vanta ${effectName} 未能正确加载`)
        }
      } catch (error) {
        console.error(`Failed to load Vanta ${effect}:`, error)
        // 如果 Vanta 加载失败，使用渐变背景
        if (vantaRef.current) {
          const fallbackColors = {
            cells: 'linear-gradient(135deg, #1a4d3a 0%, #2d8659 100%)',
            halo: 'linear-gradient(135deg, #1a1a2e 0%, #6366f1 50%, #8b5cf6 100%)',
            clouds: 'linear-gradient(135deg, #68b8d7 0%, #adc1de 100%)',
            fog: 'linear-gradient(135deg, #dadd20ff 0%, #229adfff 100%)',
            waves: 'linear-gradient(135deg, #3f7cac 0%, #95c8d8 100%)'
          }
          vantaRef.current.style.background = fallbackColors[effect as keyof typeof fallbackColors] || '#68b8d7'
        }
      }
    }

    loadVanta()

    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy()
        } catch (error) {
          console.error('Error destroying Vanta effect:', error)
        }
        vantaEffect.current = null
      }
    }
  }, [effect])

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 z-0"
      style={{ 
        background: 'transparent',
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    />
  )
}