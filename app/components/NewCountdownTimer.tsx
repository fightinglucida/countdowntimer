'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Play, Pause, Square, Sparkles } from 'lucide-react'

interface NewCountdownTimerProps {
  onTimerComplete: (title: string) => void
  onBackgroundChange: (effect: string) => void
}

interface TimeDisplay {
  hours: number
  minutes: number
  seconds: number
}

const PRESET_TIMES = [
  { label: '5min', description: '番茄休息', hours: 0, minutes: 5, seconds: 0 },
  { label: '10min', description: '计时提醒', hours: 0, minutes: 10, seconds: 0 },
  { label: '25min', description: '番茄工作', hours: 0, minutes: 25, seconds: 0 },
  { label: '30min', description: '午睡', hours: 0, minutes: 30, seconds: 0 },
  { label: '1h', description: '沉浸工作', hours: 1, minutes: 0, seconds: 0 },
]

const BACKGROUND_THEMES = [
  { 
    name: '森林', 
    effect: 'cells', 
    url: 'https://www.vantajs.com/?effect=cells', 
    preview: 'linear-gradient(135deg, #1a4d3a 0%, #2d8659 100%)',
    colors: {
      primary: '#2d8659',
      secondary: '#1a4d3a',
      accent: '#4ade80',
      text: '#ffffff',
      textSecondary: '#e0f2e0'
    }
  },
  { 
    name: '极光', 
    effect: 'halo', 
    url: 'https://www.vantajs.com/?effect=halo', 
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #6366f1 50%, #8b5cf6 100%)',
    colors: {
      primary: '#1a1a2e',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      text: '#ffffff',
      textSecondary: '#e0e7ff'
    }
  },
  { 
    name: '天空', 
    effect: 'clouds', 
    url: 'https://www.vantajs.com/?effect=clouds', 
    preview: 'linear-gradient(135deg, #68b8d7 0%, #adc1de 100%)',
    colors: {
      primary: '#68b8d7',
      secondary: '#adc1de',
      accent: '#0ea5e9',
      text: '#ffffff',
      textSecondary: '#f0f9ff'
    }
  },
  { 
    name: '沙滩', 
    effect: 'fog', 
    url: 'https://www.vantajs.com/?effect=fog', 
    preview: 'linear-gradient(135deg, #ff7700 0%, #ffaa00 100%)',
    colors: {
      primary: '#ff7700',
      secondary: '#ffaa00',
      accent: '#f59e0b',
      text: '#ffffff',
      textSecondary: '#fef3c7'
    }
  },
  { 
    name: '海浪', 
    effect: 'waves', 
    url: 'https://www.vantajs.com/?effect=waves', 
    preview: 'linear-gradient(135deg, #3f7cac 0%, #95c8d8 100%)',
    colors: {
      primary: '#3f7cac',
      secondary: '#95c8d8',
      accent: '#0891b2',
      text: '#ffffff',
      textSecondary: '#cffafe'
    }
  },
]

// 时间输入组件
const TimeInput = ({ 
  value, 
  max, 
  type, 
  onChange,
  isRunning,
  isEditing,
  setIsEditing,
  themeColors
}: { 
  value: number
  max: number
  type: 'hours' | 'minutes' | 'seconds'
  onChange: (value: number) => void
  isRunning: boolean
  isEditing: { hours: boolean; minutes: boolean; seconds: boolean }
  setIsEditing: React.Dispatch<React.SetStateAction<{ hours: boolean; minutes: boolean; seconds: boolean }>>
  themeColors: any
}) => {
  const [inputValue, setInputValue] = useState(value.toString().padStart(2, '0'))
  
  const handleClick = () => {
    if (!isRunning) {
      setIsEditing(prev => ({ ...prev, [type]: true }))
    }
  }

  const handleBlur = () => {
    setIsEditing(prev => ({ ...prev, [type]: false }))
    const numValue = Math.min(Math.max(0, parseInt(inputValue) || 0), max)
    setInputValue(numValue.toString().padStart(2, '0'))
    onChange(numValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    }
  }

  useEffect(() => {
    if (!isEditing[type]) {
      setInputValue(value.toString().padStart(2, '0'))
    }
  }, [value, isEditing, type])

  return (
    <motion.div
      whileHover={!isRunning ? { scale: 1.05 } : {}}
      whileTap={!isRunning ? { scale: 0.95 } : {}}
      className={`relative ${!isRunning ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleClick}
    >
      {isEditing[type] && !isRunning ? (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          min="0"
          max={max}
          className="w-48 h-48 text-9xl font-mono font-bold text-center backdrop-blur-xl rounded-3xl focus:outline-none focus:scale-105 shadow-[0_12px_40px_rgba(0,0,0,0.4)] focus:shadow-[0_16px_50px_rgba(0,0,0,0.6)] transition-all duration-300"
          style={{ 
            backgroundColor: `${themeColors.primary}40`,
            color: themeColors.text,
            borderColor: `${themeColors.accent}60`
          }}
          autoFocus
        />
      ) : (
        <div 
          className="w-48 h-48 flex items-center justify-center text-9xl font-mono font-bold backdrop-blur-xl rounded-3xl hover:scale-105 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.5)]"
          style={{ 
            backgroundColor: `${themeColors.primary}40`,
            color: themeColors.text,
            borderColor: `${themeColors.accent}60`
          }}
        >
          <span className="drop-shadow-2xl text-shadow-lg filter brightness-110">{value.toString().padStart(2, '0')}</span>
        </div>
      )}
    </motion.div>
  )
}

export default function NewCountdownTimer({ onTimerComplete, onBackgroundChange }: NewCountdownTimerProps) {
  // 状态管理
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState<TimeDisplay>({ hours: 0, minutes: 5, seconds: 0 })
  const [totalSeconds, setTotalSeconds] = useState(300) // 默认5分钟
  const [remainingSeconds, setRemainingSeconds] = useState(300)
  
  // UI控制状态
  const [showPresets, setShowPresets] = useState(true)
  const [showThemes, setShowThemes] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('cells')
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState({ hours: false, minutes: false, seconds: false })
  
  // 完成状态
  const [isCompleted, setIsCompleted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCompletedRef = useRef<boolean>(false)

  // 格式化时间显示
  const formatTimeDisplay = (seconds: number): TimeDisplay => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return { hours, minutes, seconds: secs }
  }

  // 计算总秒数
  const calculateTotalSeconds = (time: TimeDisplay): number => {
    return time.hours * 3600 + time.minutes * 60 + time.seconds
  }

  // 更新时间显示
  const updateTimeDisplay = (newTime: Partial<TimeDisplay>) => {
    const updatedTime = { ...timeDisplay, ...newTime }
    setTimeDisplay(updatedTime)
    const newTotal = calculateTotalSeconds(updatedTime)
    setTotalSeconds(newTotal)
    setRemainingSeconds(newTotal)
    setIsCompleted(false) // 重置完成状态
  }

  // 设置预设时间
  const setPresetTime = (preset: typeof PRESET_TIMES[0]) => {
    const newTime = { hours: preset.hours, minutes: preset.minutes, seconds: preset.seconds }
    setTimeDisplay(newTime)
    const newTotal = calculateTotalSeconds(newTime)
    setTotalSeconds(newTotal)
    setRemainingSeconds(newTotal)
    setIsCompleted(false) // 重置完成状态
  }

  // 启动定时器
  const startTimer = () => {
    if (remainingSeconds <= 0) return
    
    setIsRunning(true)
    setIsPaused(false)
    setIsCompleted(false) // 重置完成状态
    
    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // 清理计时器，防止重复触发
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setIsRunning(false)
          setIsPaused(false)
          // 只触发一次完成事件
          if (!isCompleted) {
            setIsCompleted(true) // 设置完成状态
            onTimerComplete('倒计时')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 暂停定时器
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPaused(true)
    setIsRunning(false)
  }

  // 停止定时器
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setIsPaused(false)
    setIsCompleted(false) // 重置完成状态
    setRemainingSeconds(totalSeconds)
  }

  // 继续定时器
  const resumeTimer = () => {
    if (remainingSeconds > 0) {
      startTimer()
    }
  }

  // 切换背景主题
  const changeTheme = (theme: string) => {
    setSelectedTheme(theme)
    onBackgroundChange(theme)
  }

  // 获取当前主题颜色
  const getCurrentThemeColors = () => {
    const currentTheme = BACKGROUND_THEMES.find(theme => theme.effect === selectedTheme)
    return currentTheme?.colors || BACKGROUND_THEMES[0].colors
  }

  const themeColors = getCurrentThemeColors()

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 更新显示的时间
  const currentDisplay = formatTimeDisplay(remainingSeconds)

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-8 pt-16">
      {/* 倒计时显示区域 - 仅保留时分秒 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-12 flex-1"
      >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 30px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TimeInput
              value={(isRunning || isPaused) ? currentDisplay.hours : timeDisplay.hours}
              max={99}
              type="hours"
              onChange={(value) => updateTimeDisplay({ hours: value })}
              isRunning={isRunning}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              themeColors={themeColors}
            />
          </motion.div>
          <motion.div 
            className="text-9xl font-bold text-white drop-shadow-2xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            :
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 30px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            <TimeInput
              value={(isRunning || isPaused) ? currentDisplay.minutes : timeDisplay.minutes}
              max={59}
              type="minutes"
              onChange={(value) => updateTimeDisplay({ minutes: value })}
              isRunning={isRunning}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              themeColors={themeColors}
            />
          </motion.div>
          <motion.div 
            className="text-9xl font-bold text-white drop-shadow-2xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            :
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 30px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            <TimeInput
              value={(isRunning || isPaused) ? currentDisplay.seconds : timeDisplay.seconds}
              max={59}
              type="seconds"
              onChange={(value) => updateTimeDisplay({ seconds: value })}
              isRunning={isRunning}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              themeColors={themeColors}
            />
          </motion.div>
      </motion.div>
      
      {/* 底部控制区域 */}
      <div className="w-full flex flex-col items-center" style={{ marginBottom: '3vh' }}>
      {/* 常用时长选择区 */}
      <AnimatePresence>
        {showPresets && !isRunning && !isPaused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex gap-3 justify-center" style={{ width: 'calc(192px * 3 + 48px * 2)' }}>
              {PRESET_TIMES.map((preset) => (
                <motion.button
                  key={preset.label}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPresetTime(preset)}
                  className="flex flex-col items-center justify-center px-4 py-3 backdrop-blur-md rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl h-16 flex-1"
                  style={{ 
                    backgroundColor: `${themeColors.primary}30`,
                    borderColor: `${themeColors.accent}50`,
                    color: themeColors.text
                  }}
                >
                  <div className="text-sm font-bold mb-1" style={{ color: themeColors.text }}>{preset.label}</div>
                  <div className="text-xs text-center leading-tight" style={{ color: themeColors.textSecondary }}>{preset.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 控制按钮区 */}
      <AnimatePresence>
        {!isRunning && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8"
          >
            <div className="flex gap-8 items-center">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPresets(!showPresets)}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: `${themeColors.primary}80`,
                  borderColor: `${themeColors.accent}80`,
                  color: themeColors.text
                }}
                title="常用时长"
              >
                <Menu size={32} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isPaused ? resumeTimer : startTimer}
                disabled={totalSeconds <= 0}
                className="w-24 h-24 backdrop-blur-md border-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: `${themeColors.accent}80`,
                  borderColor: `${themeColors.accent}`,
                  color: themeColors.text
                }}
                title={isPaused ? '继续定时器' : '启动定时器'}
              >
                {isPaused ? <Play size={36} /> : <Play size={36} />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowThemes(!showThemes)}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: `${themeColors.secondary}80`,
                  borderColor: `${themeColors.accent}80`,
                  color: themeColors.text
                }}
                title="背景主题"
              >
                <Sparkles size={32} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 运行中的控制按钮 */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <div className="flex gap-8 items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={pauseTimer}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: `${themeColors.secondary}80`,
                  borderColor: `${themeColors.accent}80`,
                  color: themeColors.text
                }}
                title="暂停"
              >
                <Pause size={32} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stopTimer}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: '#ef444480',
                  borderColor: '#ef4444',
                  color: themeColors.text
                }}
                title="停止"
              >
                <Square size={32} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 暂停状态的控制按钮 */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <div className="flex gap-8 items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resumeTimer}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: `${themeColors.accent}80`,
                  borderColor: `${themeColors.accent}`,
                  color: themeColors.text
                }}
                title="继续"
              >
                <Play size={32} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stopTimer}
                className="w-20 h-20 backdrop-blur-md border-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl"
                style={{
                  backgroundColor: '#ef444480',
                  borderColor: '#ef4444',
                  color: themeColors.text
                }}
                title="停止"
              >
                <Square size={32} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主题选择区 */}
      <AnimatePresence>
        {showThemes && !isRunning && !isPaused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex gap-3 justify-center" style={{ width: 'calc(192px * 3 + 48px * 2)' }}>
              {BACKGROUND_THEMES.map((theme) => (
                <motion.button
                  key={theme.effect}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeTheme(theme.effect)}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl h-20 flex-1 flex items-center justify-center ${
                    selectedTheme === theme.effect
                      ? 'ring-2 ring-white/80'
                      : 'hover:ring-1 hover:ring-white/40'
                  }`}
                  style={{ 
                    background: theme.preview,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* 背景渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* 主题名称 */}
                  <div className="relative z-10 text-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg">
                      {theme.name}
                    </div>
                  </div>
                  
                  {/* 选中状态指示器 */}
                  {selectedTheme === theme.effect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}

