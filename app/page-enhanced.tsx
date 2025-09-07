'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeBackground from './components/ThreeBackground'
import AnimatedTimerCard from './components/AnimatedTimerCard'
import EnhancedAddTimerForm from './components/EnhancedAddTimerForm'
import EnhancedWhiteNoisePanel from './components/EnhancedWhiteNoisePanel'
import DataManager from './components/DataManager'
import EnhancedReminderModal from './components/EnhancedReminderModal'
import FullscreenMode from './components/FullscreenMode'

export interface Timer {
  id: string
  title: string
  duration: number // in seconds
  remainingTime: number
  isRunning: boolean
  whiteNoise?: string
  createdAt: number
  mode: 'countdown' | 'scheduled' // 倒计时模式 or 定时模式
  scheduledTime?: number // 定时模式的目标时间戳
}

export interface WhiteNoise {
  id: string
  name: string
  file: string
  isActive: boolean
}

const DEFAULT_WHITE_NOISES: WhiteNoise[] = [
  { id: 'rain', name: '雨声', file: '/audio/rain.mp3', isActive: false },
  { id: 'cafe', name: '咖啡馆', file: '/audio/cafe.mp3', isActive: false },
  { id: 'forest', name: '森林鸟鸣', file: '/audio/forest.mp3', isActive: false },
]

export default function EnhancedHome() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [whiteNoises, setWhiteNoises] = useState<WhiteNoise[]>(DEFAULT_WHITE_NOISES)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderTimer, setReminderTimer] = useState<Timer | null>(null)
  const [originalTitle, setOriginalTitle] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const titleFlashRef = useRef<NodeJS.Timeout | null>(null)
  const reminderAudioRef = useRef<HTMLAudioElement | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTimers = localStorage.getItem('elegant-timers')
    const savedWhiteNoises = localStorage.getItem('elegant-white-noises')
    
    if (savedTimers) {
      try {
        const parsedTimers = JSON.parse(savedTimers)
        setTimers(parsedTimers)
      } catch (error) {
        console.error('Error parsing saved timers:', error)
      }
    }
    
    if (savedWhiteNoises) {
      try {
        const parsedWhiteNoises = JSON.parse(savedWhiteNoises)
        setWhiteNoises(parsedWhiteNoises)
      } catch (error) {
        console.error('Error parsing saved white noises:', error)
        setWhiteNoises(DEFAULT_WHITE_NOISES)
      }
    }

    // Store original title
    setOriginalTitle(document.title)

    // Initialize reminder audio
    reminderAudioRef.current = new Audio('/audio/reminder.mp3')
    
    return () => {
      // Cleanup intervals on unmount
      Object.values(intervalRefs.current).forEach(clearInterval)
      if (titleFlashRef.current) {
        clearInterval(titleFlashRef.current)
      }
    }
  }, [])

  // Save timers to localStorage whenever timers change
  useEffect(() => {
    localStorage.setItem('elegant-timers', JSON.stringify(timers))
  }, [timers])

  // Save white noises to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('elegant-white-noises', JSON.stringify(whiteNoises))
  }, [whiteNoises])

  // Fullscreen keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault()
        setIsFullscreen(true)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Handle timer completion
  const handleTimerComplete = (timer: Timer) => {
    // Play reminder sound
    if (reminderAudioRef.current) {
      reminderAudioRef.current.play().catch(console.error)
    }

    // Show reminder modal
    setReminderTimer(timer)
    setShowReminderModal(true)

    // Flash title
    flashTitle(timer.title)

    // Stop the timer
    setTimers(prev => prev.map(t => 
      t.id === timer.id ? { ...t, isRunning: false, remainingTime: 0 } : t
    ))
  }

  const flashTitle = (timerTitle: string) => {
    let isOriginal = true
    const flashMessage = `⏰ ${timerTitle}`
    
    titleFlashRef.current = setInterval(() => {
      document.title = isOriginal ? flashMessage : originalTitle
      isOriginal = !isOriginal
    }, 1000)

    // Stop flashing after 5 seconds
    setTimeout(() => {
      if (titleFlashRef.current) {
        clearInterval(titleFlashRef.current)
        titleFlashRef.current = null
      }
      document.title = originalTitle
    }, 5000)
  }

  const addTimer = (title: string, duration: number, whiteNoise?: string, mode: 'countdown' | 'scheduled' = 'countdown', scheduledTime?: number) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      title,
      duration,
      remainingTime: duration,
      isRunning: false,
      whiteNoise,
      createdAt: Date.now(),
      mode,
      scheduledTime
    }
    setTimers(prev => [...prev, newTimer])
    
    // 立即启动定时器
    setTimeout(() => {
      startTimer(newTimer.id)
    }, 300)
  }

  const updateTimer = (id: string, updates: Partial<Timer>) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, ...updates } : timer
    ))
  }

  const deleteTimer = (id: string) => {
    // Clear interval if running
    if (intervalRefs.current[id]) {
      clearInterval(intervalRefs.current[id])
      delete intervalRefs.current[id]
    }
    setTimers(prev => prev.filter(timer => timer.id !== id))
  }

  const startTimer = (id: string) => {
    setTimers(prev => {
      const timer = prev.find(t => t.id === id)
      if (!timer || timer.remainingTime <= 0) return prev

      if (intervalRefs.current[id]) {
        clearInterval(intervalRefs.current[id])
        delete intervalRefs.current[id]
      }

      intervalRefs.current[id] = setInterval(() => {
        setTimers(currentTimers => {
          const currentTimer = currentTimers.find(t => t.id === id)
          if (!currentTimer || !currentTimer.isRunning) {
            clearInterval(intervalRefs.current[id])
            delete intervalRefs.current[id]
            return currentTimers
          }

          let newRemainingTime: number

          if (currentTimer.mode === 'scheduled' && currentTimer.scheduledTime) {
            newRemainingTime = Math.max(0, Math.floor((currentTimer.scheduledTime - Date.now()) / 1000))
          } else {
            newRemainingTime = currentTimer.remainingTime - 1
          }

          if (newRemainingTime <= 0) {
            clearInterval(intervalRefs.current[id])
            delete intervalRefs.current[id]
            handleTimerComplete(currentTimer)
            return currentTimers.map(t => 
              t.id === id ? { ...t, remainingTime: 0, isRunning: false } : t
            )
          }

          return currentTimers.map(t => 
            t.id === id ? { ...t, remainingTime: newRemainingTime } : t
          )
        })
      }, 1000)

      return prev.map(t => 
        t.id === id ? { ...t, isRunning: true } : t
      )
    })
  }

  const pauseTimer = (id: string) => {
    if (intervalRefs.current[id]) {
      clearInterval(intervalRefs.current[id])
      delete intervalRefs.current[id]
    }
    updateTimer(id, { isRunning: false })
  }

  const getAverageProgress = () => {
    if (timers.length === 0) return 0
    const totalProgress = timers.reduce((sum, timer) => {
      return sum + ((timer.duration - timer.remainingTime) / timer.duration)
    }, 0)
    return totalProgress / timers.length
  }

  return (
    <>
      {/* Three.js Background */}
      <ThreeBackground 
        isFullscreen={false} 
        timerProgress={getAverageProgress()}
      />

      {/* Fullscreen Mode */}
      <FullscreenMode
        isFullscreen={isFullscreen}
        timers={timers}
        onExitFullscreen={() => setIsFullscreen(false)}
        onStart={startTimer}
        onPause={pauseTimer}
        onDelete={deleteTimer}
      />

      {/* Main Interface */}
      <main className="relative min-h-screen p-4 overflow-hidden">
        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              精致定时提醒工具
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80 mb-6"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              专注工作，优雅提醒
            </motion.p>
            
            {/* Fullscreen hint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm"
            >
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs">F1</kbd>
              <span>进入全屏专注模式</span>
            </motion.div>
          </motion.header>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Timer Management Section */}
            <div className="xl:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <EnhancedAddTimerForm onAddTimer={addTimer} whiteNoises={whiteNoises} />
              </motion.div>
              
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white">活跃定时器</h2>
                  {timers.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFullscreen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      全屏模式
                    </motion.button>
                  )}
                </div>
                
                <AnimatePresence mode="popLayout">
                  {timers.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center py-20"
                    >
                      <motion.div 
                        className="text-8xl mb-6"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        ⏰
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white/80 mb-4">还没有定时器</h3>
                      <p className="text-white/60 text-lg">创建一个开始专注吧！</p>
                    </motion.div>
                  ) : (
                    <div className="grid gap-6">
                      {timers.map((timer, index) => (
                        <motion.div
                          key={timer.id}
                          layout
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <AnimatedTimerCard
                            timer={timer}
                            onStart={() => startTimer(timer.id)}
                            onPause={() => pauseTimer(timer.id)}
                            onDelete={() => deleteTimer(timer.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Side Panel */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <EnhancedWhiteNoisePanel 
                whiteNoises={whiteNoises}
                setWhiteNoises={setWhiteNoises}
              />
              <DataManager 
                timers={timers}
                setTimers={setTimers}
                whiteNoises={whiteNoises}
                setWhiteNoises={setWhiteNoises}
              />
            </motion.div>
          </div>
        </div>

        {/* Floating action button for fullscreen */}
        <AnimatePresence>
          {timers.some(t => t.isRunning) && !isFullscreen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl z-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && reminderTimer && (
          <EnhancedReminderModal
            timer={reminderTimer}
            onClose={() => {
              setShowReminderModal(false)
              setReminderTimer(null)
              // 停止标题闪烁
              if (titleFlashRef.current) {
                clearInterval(titleFlashRef.current)
                titleFlashRef.current = null
              }
              document.title = originalTitle
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}