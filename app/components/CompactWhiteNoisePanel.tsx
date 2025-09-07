'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhiteNoise } from '../page'

interface CompactWhiteNoisePanelProps {
  whiteNoises: WhiteNoise[]
  setWhiteNoises: React.Dispatch<React.SetStateAction<WhiteNoise[]>>
}

export default function CompactWhiteNoisePanel({ whiteNoises, setWhiteNoises }: CompactWhiteNoisePanelProps) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    whiteNoises.forEach(noise => {
      if (!audioRefs.current[noise.id]) {
        const audio = new Audio(noise.file)
        audio.loop = true
        audio.volume = volumes[noise.id] || 0.5
        audioRefs.current[noise.id] = audio
      }
      if (!volumes[noise.id]) {
        setVolumes(prev => ({ ...prev, [noise.id]: 0.5 }))
      }
    })

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [whiteNoises, volumes])

  const toggleWhiteNoise = async (noiseId: string) => {
    const targetNoise = whiteNoises.find(n => n.id === noiseId)
    if (!targetNoise) return

    const audio = audioRefs.current[noiseId]
    if (!audio) return

    try {
      if (targetNoise.isActive) {
        audio.pause()
        audio.currentTime = 0
        setWhiteNoises(prev => prev.map(n => 
          n.id === noiseId ? { ...n, isActive: false } : n
        ))
      } else {
        Object.entries(audioRefs.current).forEach(([id, audioElement]) => {
          if (id !== noiseId) {
            audioElement.pause()
            audioElement.currentTime = 0
          }
        })

        audio.volume = volumes[noiseId] || 0.5
        await audio.play()
        setWhiteNoises(prev => prev.map(n => ({
          ...n,
          isActive: n.id === noiseId
        })))
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('音频播放失败，请确保浏览器允许自动播放音频')
    }
  }

  const handleVolumeChange = (noiseId: string, volume: number) => {
    setVolumes(prev => ({ ...prev, [noiseId]: volume }))
    const audio = audioRefs.current[noiseId]
    if (audio) {
      audio.volume = volume
    }
  }

  const getNoiseIcon = (noiseId: string) => {
    switch (noiseId) {
      case 'rain': return '🌧️'
      case 'cafe': return '☕'
      case 'forest': return '🌲'
      default: return '🎵'
    }
  }

  const activeNoise = whiteNoises.find(n => n.isActive)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">背景音效</h3>
      
      {/* 当前播放 */}
      <AnimatePresence>
        {activeNoise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-3 bg-green-500/20 rounded-lg border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.span 
                  className="text-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getNoiseIcon(activeNoise.id)}
                </motion.span>
                <span className="text-sm text-green-300 font-medium">
                  {activeNoise.name}
                </span>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
            
            {/* 音量控制 */}
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0v-3a3 3 0 00-6 0v3z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volumes[activeNoise.id] || 0.5}
                onChange={(e) => handleVolumeChange(activeNoise.id, parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-green-300 w-8">
                {Math.round((volumes[activeNoise.id] || 0.5) * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 音效选择 */}
      <div className="space-y-2">
        {whiteNoises.map((noise) => (
          <motion.button
            key={noise.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleWhiteNoise(noise.id)}
            className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 text-sm ${
              noise.isActive
                ? 'border-green-500/50 bg-green-500/10 text-green-300'
                : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{getNoiseIcon(noise.id)}</span>
            <span className="flex-1 text-left font-medium">{noise.name}</span>
            {noise.isActive && (
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 bg-green-400 rounded-full"
                    animate={{ 
                      scaleY: [0.3, 1, 0.3],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="text-xs text-white/50 text-center">
        选择音效有助于专注和放松
      </div>
    </div>
  )
}