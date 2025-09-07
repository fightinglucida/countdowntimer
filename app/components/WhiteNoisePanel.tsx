'use client'

import { useRef, useEffect } from 'react'
import { WhiteNoise } from '../page'

interface WhiteNoisePanelProps {
  whiteNoises: WhiteNoise[]
  setWhiteNoises: React.Dispatch<React.SetStateAction<WhiteNoise[]>>
}

export default function WhiteNoisePanel({ whiteNoises, setWhiteNoises }: WhiteNoisePanelProps) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Initialize audio objects
    whiteNoises.forEach(noise => {
      if (!audioRefs.current[noise.id]) {
        const audio = new Audio(noise.file)
        audio.loop = true
        audio.volume = 0.5
        audioRefs.current[noise.id] = audio
      }
    })

    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [whiteNoises])

  const toggleWhiteNoise = async (noiseId: string) => {
    const targetNoise = whiteNoises.find(n => n.id === noiseId)
    if (!targetNoise) return

    const audio = audioRefs.current[noiseId]
    if (!audio) return

    try {
      if (targetNoise.isActive) {
        // Stop current noise
        audio.pause()
        audio.currentTime = 0
        setWhiteNoises(prev => prev.map(n => 
          n.id === noiseId ? { ...n, isActive: false } : n
        ))
      } else {
        // Stop all other noises first
        Object.entries(audioRefs.current).forEach(([id, audioElement]) => {
          if (id !== noiseId) {
            audioElement.pause()
            audioElement.currentTime = 0
          }
        })

        // Start target noise
        await audio.play()
        setWhiteNoises(prev => prev.map(n => ({
          ...n,
          isActive: n.id === noiseId
        })))
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      // Handle autoplay restrictions
      alert('音频播放失败，请确保浏览器允许自动播放音频')
    }
  }

  const stopAllNoises = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    setWhiteNoises(prev => prev.map(n => ({ ...n, isActive: false })))
  }

  const getNoiseIcon = (noiseId: string) => {
    switch (noiseId) {
      case 'rain': return '🌧️'
      case 'cafe': return '☕'
      case 'forest': return '🌲'
      default: return '🎵'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">白噪音</h2>
        <button
          onClick={stopAllNoises}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          全部停止
        </button>
      </div>

      <div className="space-y-3">
        {whiteNoises.map((noise) => (
          <button
            key={noise.id}
            onClick={() => toggleWhiteNoise(noise.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
              noise.isActive
                ? 'border-green-500 bg-green-50 text-green-800 shadow-md'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">{getNoiseIcon(noise.id)}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{noise.name}</div>
              {noise.isActive && (
                <div className="text-sm text-green-600">正在播放...</div>
              )}
            </div>
            {noise.isActive && (
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-green-500 rounded animate-pulse"></div>
                <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        点击切换白噪音，有助于专注和放松
      </div>
    </div>
  )
}