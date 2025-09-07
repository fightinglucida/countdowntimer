'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhiteNoise } from '../page'

interface EnhancedWhiteNoisePanelProps {
  whiteNoises: WhiteNoise[]
  setWhiteNoises: React.Dispatch<React.SetStateAction<WhiteNoise[]>>
}

export default function EnhancedWhiteNoisePanel({ whiteNoises, setWhiteNoises }: EnhancedWhiteNoisePanelProps) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({})
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Initialize audio objects and volumes
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

    // Cleanup function
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

  const stopAllNoises = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    setWhiteNoises(prev => prev.map(n => ({ ...n, isActive: false })))
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

  const getNoiseGradient = (noiseId: string) => {
    switch (noiseId) {
      case 'rain': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'cafe': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30'
      case 'forest': return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      default: return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    }
  }

  const activeNoise = whiteNoises.find(n => n.isActive)

  return (
    <motion.div 
      layout
      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: activeNoise 
            ? [
                'linear-gradient(45deg, #10b981, #06b6d4)',
                'linear-gradient(45deg, #06b6d4, #8b5cf6)',
                'linear-gradient(45deg, #8b5cf6, #10b981)'
              ]
            : ['linear-gradient(45deg, #6b7280, #9ca3af, #6b7280)']
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            className="text-xl font-bold text-white flex items-center gap-2"
            animate={{ color: activeNoise ? '#10b981' : '#ffffff' }}
          >
            <motion.span
              animate={{ rotate: activeNoise ? [0, 360] : 0 }}
              transition={{ duration: 2, repeat: activeNoise ? Infinity : 0, ease: "linear" }}
            >
              🎵
            </motion.span>
            白噪音
          </motion.h2>
          
          <div className="flex items-center gap-2">
            {activeNoise && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stopAllNoises}
                className="text-sm text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-full transition-all duration-200 border border-red-500/30"
              >
                全部停止
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Active noise display */}
        <AnimatePresence>
          {activeNoise && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${getNoiseGradient(activeNoise.id)} border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.span 
                    className="text-2xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getNoiseIcon(activeNoise.id)}
                  </motion.span>
                  <div>
                    <div className="font-medium text-white">正在播放</div>
                    <div className="text-sm text-white/70">{activeNoise.name}</div>
                  </div>
                </div>
                
                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0v-3a3 3 0 00-6 0v3z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes[activeNoise.id] || 0.5}
                    onChange={(e) => handleVolumeChange(activeNoise.id, parseFloat(e.target.value))}
                    className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Visualizer bars */}
              <div className="flex items-end justify-center gap-1 mt-4 h-8">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-white/60 rounded-full"
                    animate={{
                      height: [4, Math.random() * 24 + 8, 4]
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Noise selection */}
        <div className="space-y-3">
          {whiteNoises.map((noise, index) => (
            <motion.button
              key={noise.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleWhiteNoise(noise.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                noise.isActive
                  ? `${getNoiseGradient(noise.id)} border shadow-lg`
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <motion.span 
                className="text-2xl"
                animate={{ 
                  scale: noise.isActive ? [1, 1.2, 1] : 1,
                  rotate: noise.isActive ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 2, repeat: noise.isActive ? Infinity : 0 }}
              >
                {getNoiseIcon(noise.id)}
              </motion.span>
              
              <div className="flex-1 text-left">
                <div className={`font-medium ${noise.isActive ? 'text-white' : 'text-white/80'}`}>
                  {noise.name}
                </div>
                {noise.isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-white/70 flex items-center gap-1"
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    正在播放...
                  </motion.div>
                )}
              </div>

              {noise.isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex space-x-1"
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 bg-green-400 rounded-full"
                      animate={{ 
                        scaleY: [0.5, 1, 0.5],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.div 
          className="mt-6 text-xs text-white/50 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          点击切换白噪音，有助于专注和放松
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  )
}