'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhiteNoise } from '../page'

interface CompactTimerFormProps {
  onAddTimer: (title: string, duration: number, whiteNoise?: string, mode?: 'countdown' | 'scheduled', scheduledTime?: number) => void
  whiteNoises: WhiteNoise[]
}

export default function CompactTimerForm({ onAddTimer, whiteNoises }: CompactTimerFormProps) {
  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [hours, setHours] = useState(0)
  const [selectedWhiteNoise, setSelectedWhiteNoise] = useState('')
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
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      if (totalSeconds <= 0) {
        alert('请设置有效的时间')
        return
      }

      onAddTimer(
        title.trim(), 
        totalSeconds, 
        selectedWhiteNoise || undefined,
        'countdown'
      )
    } else {
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
  }

  const presetTimes = [
    { label: '5分', hours: 0, minutes: 5, seconds: 0 },
    { label: '15分', hours: 0, minutes: 15, seconds: 0 },
    { label: '25分', hours: 0, minutes: 25, seconds: 0 },
    { label: '45分', hours: 0, minutes: 45, seconds: 0 },
    { label: '1时', hours: 1, minutes: 0, seconds: 0 },
    { label: '2时', hours: 2, minutes: 0, seconds: 0 },
  ]

  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().slice(0, 5)
    return { date, time }
  }

  const initScheduledDateTime = () => {
    const { date, time } = getCurrentDateTime()
    setScheduledDate(date)
    setScheduledTime(time)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            任务标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="专注工作、学习时间..."
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            maxLength={30}
          />
        </div>

        {/* 模式选择 */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            模式
          </label>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTimerMode('countdown')}
              className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                timerMode === 'countdown'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">⏱️</div>
                <div className="font-medium">倒计时</div>
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
              className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                timerMode === 'scheduled'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">📅</div>
                <div className="font-medium">定时</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* 倒计时设置 */}
        <AnimatePresence>
          {timerMode === 'countdown' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* 快速选择 */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  快速选择
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetTimes.map((preset) => (
                    <motion.button
                      key={preset.label}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setHours(preset.hours)
                        setMinutes(preset.minutes)
                        setSeconds(preset.seconds)
                      }}
                      className="px-2 py-1 text-xs bg-white/10 hover:bg-blue-500/20 text-white/80 hover:text-blue-300 rounded border border-white/10 hover:border-blue-500/30 transition-all duration-200"
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 自定义时间 */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-white/70 mb-1">时</label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="23"
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">分</label>
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">秒</label>
                  <input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 定时设置 */}
        <AnimatePresence>
          {timerMode === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-white/70 mb-1">日期</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">时间</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 白噪音选择 */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            背景音效
          </label>
          <select
            value={selectedWhiteNoise}
            onChange={(e) => setSelectedWhiteNoise(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="" className="bg-gray-800">无音效</option>
            {whiteNoises.map((noise) => (
              <option key={noise.id} value={noise.name} className="bg-gray-800">
                {noise.name}
              </option>
            ))}
          </select>
        </div>

        {/* 提交按钮 */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg ${
            timerMode === 'countdown'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
          }`}
        >
          🚀 创建并开始
        </motion.button>
      </form>
    </div>
  )
}