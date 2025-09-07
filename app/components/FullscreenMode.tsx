'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from '../page'
import { useEffect, useState } from 'react'
import ThreeBackground from './ThreeBackground'
import AnimatedTimerCard from './AnimatedTimerCard'

interface FullscreenModeProps {
  isFullscreen: boolean
  timers: Timer[]
  onExitFullscreen: () => void
  onStart: (id: string) => void
  onPause: (id: string) => void
  onDelete: (id: string) => void
}

export default function FullscreenMode({
  isFullscreen,
  timers,
  onExitFullscreen,
  onStart,
  onPause,
  onDelete
}: FullscreenModeProps) {
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null)

  const activeTimers = timers.filter(t => t.remainingTime > 0)
  const currentTimer = activeTimers[currentTimerIndex]

  // Auto-hide controls after mouse inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (mouseTimeout) clearTimeout(mouseTimeout)
      
      const timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      setMouseTimeout(timeout)
    }

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        if (mouseTimeout) clearTimeout(mouseTimeout)
      }
    }
  }, [isFullscreen, mouseTimeout])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return

      switch (e.key) {
        case 'Escape':
        case 'F11':
          onExitFullscreen()
          break
        case 'ArrowLeft':
          setCurrentTimerIndex(prev => 
            prev > 0 ? prev - 1 : activeTimers.length - 1
          )
          break
        case 'ArrowRight':
          setCurrentTimerIndex(prev => 
            prev < activeTimers.length - 1 ? prev + 1 : 0
          )
          break
        case ' ':
          e.preventDefault()
          if (currentTimer) {
            if (currentTimer.isRunning) {
              onPause(currentTimer.id)
            } else {
              onStart(currentTimer.id)
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, currentTimer, activeTimers.length, onStart, onPause, onExitFullscreen])

  if (!isFullscreen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black overflow-hidden"
      >
        {/* Three.js Background */}
        <ThreeBackground 
          isFullscreen={true} 
          timerProgress={currentTimer ? (currentTimer.duration - currentTimer.remainingTime) / currentTimer.duration : 0}
        />

        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />

        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-0 left-0 right-0 z-20 p-6"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onExitFullscreen}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                    
                    <div className="text-white/80 text-sm">
                      按 ESC 或 F11 退出全屏 • 空格键暂停/继续 • 方向键切换定时器
                    </div>
                  </div>

                  {activeTimers.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentTimerIndex(prev => 
                          prev > 0 ? prev - 1 : activeTimers.length - 1
                        )}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>
                      
                      <span className="text-white/60 text-sm">
                        {currentTimerIndex + 1} / {activeTimers.length}
                      </span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentTimerIndex(prev => 
                          prev < activeTimers.length - 1 ? prev + 1 : 0
                        )}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main timer display */}
          <div className="flex-1 flex items-center justify-center p-8">
            {currentTimer ? (
              <AnimatedTimerCard
                timer={currentTimer}
                onStart={() => onStart(currentTimer.id)}
                onPause={() => onPause(currentTimer.id)}
                onDelete={() => onDelete(currentTimer.id)}
                isFullscreen={true}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-8xl mb-8">🌙</div>
                <h2 className="text-4xl font-bold text-white mb-4">没有活跃的定时器</h2>
                <p className="text-xl text-white/60 mb-8">享受这个宁静的时刻</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExitFullscreen}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg"
                >
                  返回主界面
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Bottom timer list */}
          <AnimatePresence>
            {showControls && activeTimers.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-0 left-0 right-0 p-6"
              >
                <div className="flex justify-center space-x-4 overflow-x-auto">
                  {activeTimers.map((timer, index) => (
                    <motion.button
                      key={timer.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentTimerIndex(index)}
                      className={`flex-shrink-0 p-4 rounded-xl backdrop-blur-md border transition-all duration-200 ${
                        index === currentTimerIndex
                          ? 'bg-white/20 border-white/40 text-white'
                          : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      <div className="text-sm font-medium truncate max-w-32">
                        {timer.title}
                      </div>
                      <div className="text-xs opacity-70">
                        {Math.floor(timer.remainingTime / 60)}:{(timer.remainingTime % 60).toString().padStart(2, '0')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating ambient elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                animate={{
                  x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                  y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}