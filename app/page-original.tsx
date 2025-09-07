'use client'

import { useState, useEffect, useRef } from 'react'
import TimerCard from './components/TimerCard'
import WhiteNoisePanel from './components/WhiteNoisePanel'
import DataManager from './components/DataManager'
import ReminderModal from './components/ReminderModal'
import AddTimerForm from './components/AddTimerForm'

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

export default function Home() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [whiteNoises, setWhiteNoises] = useState<WhiteNoise[]>(DEFAULT_WHITE_NOISES)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderTimer, setReminderTimer] = useState<Timer | null>(null)
  const [originalTitle, setOriginalTitle] = useState('')
  
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

    // No auto close - user must manually close

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
      isRunning: false, // 先设置为false，然后通过startTimer启动
      whiteNoise,
      createdAt: Date.now(),
      mode,
      scheduledTime
    }
    setTimers(prev => [...prev, newTimer])
    
    // 立即启动定时器
    setTimeout(() => {
      startTimer(newTimer.id)
    }, 300) // 增加延迟确保定时器添加到状态后再启动
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
    // 使用最新的timers状态
    setTimers(prev => {
      const timer = prev.find(t => t.id === id)
      if (!timer || timer.remainingTime <= 0) return prev

      // 清除可能存在的旧定时器
      if (intervalRefs.current[id]) {
        clearInterval(intervalRefs.current[id])
        delete intervalRefs.current[id]
      }

      // 启动新的定时器
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
            // 定时模式：计算到目标时间的剩余秒数
            newRemainingTime = Math.max(0, Math.floor((currentTimer.scheduledTime - Date.now()) / 1000))
          } else {
            // 倒计时模式：递减
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

      // 返回更新后的状态，设置为运行中
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">精致定时提醒工具</h1>
          <p className="text-gray-600">专注工作，优雅提醒</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Management Section */}
          <div className="lg:col-span-2 space-y-6">
            <AddTimerForm onAddTimer={addTimer} whiteNoises={whiteNoises} />
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">活跃定时器</h2>
              {timers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">⏰</div>
                  <p>还没有定时器，创建一个开始专注吧！</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {timers.map(timer => (
                    <TimerCard
                      key={timer.id}
                      timer={timer}
                      onStart={() => startTimer(timer.id)}
                      onPause={() => pauseTimer(timer.id)}
                      onDelete={() => deleteTimer(timer.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <WhiteNoisePanel 
              whiteNoises={whiteNoises}
              setWhiteNoises={setWhiteNoises}
            />
            <DataManager 
              timers={timers}
              setTimers={setTimers}
              whiteNoises={whiteNoises}
              setWhiteNoises={setWhiteNoises}
            />
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && reminderTimer && (
        <ReminderModal
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
    </main>
  )
}