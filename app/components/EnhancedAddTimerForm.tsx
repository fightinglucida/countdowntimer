'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhiteNoise } from '../page'

interface EnhancedAddTimerFormProps {
  onAddTimer: (title: string, duration: number, whiteNoise?: string, mode?: 'countdown' | 'scheduled', scheduledTime?: number) => void
  whiteNoises: WhiteNoise[]
}

export default function EnhancedAddTimerForm({ onAddTimer, whiteNoises }: EnhancedAddTimerFormProps) {
  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [hours, setHours] = useState(0)
  const [selectedWhiteNoise, setSelectedWhiteNoise] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const [timerMode, setTimerMode] = useState<'countdown' | 'scheduled'>('countdown')
  
  // 定时模式的日期时间设置
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('请输入提醒标题')
      return
    }

    if (timerMode === 'countdown') {
      // 倒计时模式验证
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      if (totalSeconds <= 0) {
        alert('请设置有效的时间')
        return
      }

      // 直接创建并启动定时器
      onAddTimer(
        title.trim(), 
        totalSeconds, 
        selectedWhiteNoise || undefined,
        'countdown'
      )
    } else {
      // 定时模式验证
      if (!scheduledDate || !scheduledTime) {
        alert('请设置完整的日期和时间')
        return
      }

      const targetDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const now = new Date()
      
      if (targetDateTime <= now) {
        alert('设置的时间必须在当前时间之后')
        return
      }

      const duration = Math.floor((targetDateTime.getTime() - now.getTime()) / 1000)

      // 直接创建并启动定时器
      onAddTimer(
        title.trim(), 
        duration, 
        selectedWhiteNoise || undefined,
        'scheduled',
        targetDateTime.getTime()
      )
    }

    // Reset form
    setTitle('')
    setHours(0)
    setMinutes(25)
    setSeconds(0)
    setScheduledDate('')
    setScheduledTime('')
    setSelectedWhiteNoise('')
    setIsExpanded(false)
  }

  const presetTimes = [
    { label: '5分钟', hours: 0, minutes: 5, seconds: 0 },
    { label: '15分钟', hours: 0, minutes: 15, seconds: 0 },
    { label: '25分钟', hours: 0, minutes: 25, seconds: 0 },
    { label: '45分钟', hours: 0, minutes: 45, seconds: 0 },
    { label: '1小时', hours: 1, minutes: 0, seconds: 0 },
    { label: '2小时', hours: 2, minutes: 0, seconds: 0 },
  ]

  // 获取当前日期时间的默认值
  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().slice(0, 5)
    return { date, time }
  }

  // 初始化定时模式的默认值
  const initScheduledDateTime = () => {
    const { date, time } = getCurrentDateTime()
    setScheduledDate(date)
    setScheduledTime(time)
  }

  return (
    <motion.div 
      layout
      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            'linear-gradient(45deg, #8b5cf6, #ec4899)',
            'linear-gradient(45deg, #ec4899, #3b82f6)'
          ]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            className="text-2xl font-bold text-white"
            animate={{ color: ['#ffffff', '#60a5fa', '#ffffff'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            创建新定时器
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </motion.button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Title Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-2">
                  提醒标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：该吃饭了、起身活动、喝水时间"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  maxLength={50}
                />
              </motion.div>

              {/* Timer Mode Selection */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-3">
                  定时器模式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTimerMode('countdown')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      timerMode === 'countdown'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">⏱️</div>
                      <div className="font-medium">倒计时模式</div>
                      <div className="text-xs opacity-70">设置多长时间后提醒</div>
                    </div>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTimerMode('scheduled')
                      if (!scheduledDate || !scheduledTime) {
                        initScheduledDateTime()
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      timerMode === 'scheduled'
                        ? 'border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">📅</div>
                      <div className="font-medium">定时模式</div>
                      <div className="text-xs opacity-70">设置具体时间提醒</div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Countdown Mode Settings */}
              <AnimatePresence>
                {timerMode === 'countdown' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Preset Time Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">
                        快速选择时间
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {presetTimes.map((preset, index) => (
                          <motion.button
                            key={preset.label}
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setHours(preset.hours)
                              setMinutes(preset.minutes)
                              setSeconds(preset.seconds)
                            }}
                            className="px-3 py-2 text-sm bg-white/10 hover:bg-blue-500/20 text-white/80 hover:text-blue-300 rounded-lg transition-all duration-200 border border-white/10 hover:border-blue-500/30"
                          >
                            {preset.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Time Input */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          小时
                        </label>
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                          min="0"
                          max="23"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          分钟
                        </label>
                        <input
                          type="number"
                          value={minutes}
                          onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          min="0"
                          max="59"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          秒钟
                        </label>
                        <input
                          type="number"
                          value={seconds}
                          onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          min="0"
                          max="59"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scheduled Mode Settings */}
              <AnimatePresence>
                {timerMode === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          日期
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          时间
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {scheduledDate && scheduledTime && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="p-4 bg-green-500/20 rounded-xl border border-green-500/30"
                        >
                          <div className="text-sm text-green-300">
                            <strong>提醒时间：</strong>
                            {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              weekday: 'long'
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* White Noise Selection */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-white/90 mb-2">
                  关联白噪音（可选）
                </label>
                <select
                  value={selectedWhiteNoise}
                  onChange={(e) => setSelectedWhiteNoise(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="" className="bg-gray-800">无白噪音</option>
                  {whiteNoises.map((noise) => (
                    <option key={noise.id} value={noise.name} className="bg-gray-800">
                      {noise.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg ${
                  timerMode === 'countdown'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/30'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/30'
                }`}
              >
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {timerMode === 'countdown' ? '🚀 创建并开始倒计时' : '🎯 创建并开始定时提醒'}
                </motion.span>
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              ✨ 添加新定时器
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}