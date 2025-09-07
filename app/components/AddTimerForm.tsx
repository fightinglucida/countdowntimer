'use client'

import { useState } from 'react'
import { WhiteNoise } from '../page'

interface AddTimerFormProps {
  onAddTimer: (title: string, duration: number, whiteNoise?: string, mode?: 'countdown' | 'scheduled', scheduledTime?: number) => void
  whiteNoises: WhiteNoise[]
}

export default function AddTimerForm({ onAddTimer, whiteNoises }: AddTimerFormProps) {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">创建新定时器</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提醒标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：该吃饭了、起身活动、喝水时间"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              maxLength={50}
            />
          </div>

          {/* Timer Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              定时器模式
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTimerMode('countdown')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  timerMode === 'countdown'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="font-medium">倒计时模式</div>
                  <div className="text-xs text-gray-500">设置多长时间后提醒</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerMode('scheduled')
                  if (!scheduledDate || !scheduledTime) {
                    initScheduledDateTime()
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  timerMode === 'scheduled'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="font-medium">定时模式</div>
                  <div className="text-xs text-gray-500">设置具体时间提醒</div>
                </div>
              </button>
            </div>
          </div>

          {/* Countdown Mode Settings */}
          {timerMode === 'countdown' && (
            <>
              {/* Preset Time Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  快速选择时间
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetTimes.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setHours(preset.hours)
                        setMinutes(preset.minutes)
                        setSeconds(preset.seconds)
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg transition-colors duration-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Time Input */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    小时
                  </label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="23"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分钟
                  </label>
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    秒钟
                  </label>
                  <input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Scheduled Mode Settings */}
          {timerMode === 'scheduled' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日期
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    时间
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              {scheduledDate && scheduledTime && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700">
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
                </div>
              )}
            </div>
          )}

          {/* White Noise Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关联白噪音（可选）
            </label>
            <select
              value={selectedWhiteNoise}
              onChange={(e) => setSelectedWhiteNoise(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">无白噪音</option>
              {whiteNoises.map((noise) => (
                <option key={noise.id} value={noise.name}>
                  {noise.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              timerMode === 'countdown'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            }`}
          >
            {timerMode === 'countdown' ? '创建并开始倒计时' : '创建并开始定时提醒'}
          </button>
        </form>
      )}

      {!isExpanded && (
        <div className="text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            + 添加新定时器
          </button>
        </div>
      )}
    </div>
  )
}