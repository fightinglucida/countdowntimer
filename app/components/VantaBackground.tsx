'use client'

import { useEffect, useRef } from 'react'

interface VantaBackgroundProps {
  isTimerRunning?: boolean
}

export default function VantaBackground({ isTimerRunning = false }: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    const loadVanta = async () => {
      if (typeof window === 'undefined' || !vantaRef.current) return

      try {
        console.log('开始加载 Vanta.js 依赖...')
        
        // 动态加载 Three.js - 使用更新的版本
        if (!(window as any).THREE) {
          console.log('加载 Three.js...')
          const threeScript = document.createElement('script')
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
          document.head.appendChild(threeScript)
          
          await new Promise((resolve, reject) => {
            threeScript.onload = () => {
              console.log('Three.js 加载成功:', !!(window as any).THREE)
              resolve(true)
            }
            threeScript.onerror = () => {
              console.error('Three.js 加载失败')
              reject(new Error('Three.js failed to load'))
            }
          })
        } else {
          console.log('Three.js 已存在')
        }

        // 确保 Three.js 加载完成后再加载 Vanta
        if ((window as any).THREE) {
          console.log('加载 Vanta CELLS...')
          if (!(window as any).VANTA || !(window as any).VANTA.CELLS) {
            const vantaScript = document.createElement('script')
            vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js'
            document.head.appendChild(vantaScript)
            
            await new Promise((resolve, reject) => {
              vantaScript.onload = () => {
                console.log('Vanta CELLS 加载成功:', !!(window as any).VANTA?.CELLS)
                resolve(true)
              }
              vantaScript.onerror = () => {
                console.error('Vanta CELLS 加载失败')
                reject(new Error('Vanta CELLS failed to load'))
              }
            })
          } else {
            console.log('Vanta CELLS 已存在')
          }
        }

        // 等待 VANTA 加载完成
        if ((window as any).VANTA && (window as any).VANTA.CELLS) {
          console.log('开始创建 Vanta CELLS 效果...')
          // 销毁之前的效果
          if (vantaEffect.current) {
            vantaEffect.current.destroy()
          }

          // 创建 Vanta CELLS 效果 - 动态细胞网络
          vantaEffect.current = (window as any).VANTA.CELLS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            color1: 0x8c8c,
            color2: 0xf2e735,
            size: 1.50,
            speed: 1.60
          })
          console.log('Vanta CELLS 效果创建成功!')
        } else {
          console.error('Vanta CELLS 未能正确加载:', {
            VANTA: !!(window as any).VANTA,
            CELLS: !!(window as any).VANTA?.CELLS,
            THREE: !!(window as any).THREE
          })
        }
      } catch (error) {
        console.error('Failed to load Vanta CLOUDS2:', error)
        // 如果 Vanta 加载失败，使用官网默认的天空色
        if (vantaRef.current) {
          vantaRef.current.style.background = '#68b8d7'
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
  }, [isTimerRunning])

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 z-0"
      style={{ 
        // 移除背景渐变，让Vanta.js完全控制背景
        background: 'transparent',
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    />
  )
}