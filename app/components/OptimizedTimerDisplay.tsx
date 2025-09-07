'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from '../page'
import { useState, useEffect } from 'react'

interface OptimizedTimerDisplayProps {
  timer: Timer | null
  onStart: () => void
  onPause: () => void
  onStop: () => void
  isFullMode?: boolean
}

export default function OptimizedTimerDisplay({ 
  timer, 
  onStart, 
  onPause, 
  onStop,
  isFullMode = false 
}: OptimizedTimerDisplayProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!timer) return 0
    return ((timer.duration - timer.remainingTime) / timer.duration) * 100
  }

  const getProgressColor = () => {
    const progress = getProgressPercentage()
    if (progress < 25) return '#10b981' // emerald-500
    if (progress < 50) return '#3b82f6' // blue-500
    if (progress < 75) return '#8b5cf6' // violet-500
    return '#ef4444' // red-500
  }

  if (!timer) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-8xl mb-8 opacity-50"
        >
          ⏰
        </motion.div>
        <h3 className="text-3xl font-bold text-white/80 mb-4">准备开始专注</h3>
        <p className="text-xl text-white/60">创建一个定时器开始您的专注时光</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex flex-col items-center justify-center h-full relative"
    >
      {/* 主要计时显示 */}
      <div className="relative mb-8">
        {/* 圆形进度环 */}
        <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getProgressColor()} stopOpacity="0.8" />
              <stop offset="100%" stopColor={getProgressColor()} stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* 背景圆环 */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          
          {/* 进度圆环 */}
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: getProgressPercentage() / 100 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            strokeDasharray="534.07"
            strokeDashoffset={534.07 * (1 - getProgressPercentage() / 100)}
          />
        </svg>

        {/* 中心时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ 
              scale: timer.remainingTime <= 10 ? [1, 1.05, 1] : 1,
              color: timer.remainingTime <= 10 ? '#ef4444' : '#ffffff'
            }}
            transition={{ duration: 0.5, repeat: timer.remainingTime <= 10 ? Infinity : 0 }}
            className="text-6xl font-mono font-bold mb-2"
            style={{
              textShadow: '0 0 20px rgba(255,255,255,0.3)',
              filter: timer.remainingTime <= 10 ? 'drop-shadow(0 0 10px #ef4444)' : 'none'
            }}
          >
            {formatTime(timer.remainingTime)}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-white/70 text-center max-w-48 truncate"
          >
            {timer.title}
          </motion.div>
        </div>
      </div>

      {/* 定时器信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            timer.mode === 'scheduled' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {timer.mode === 'scheduled' ? '📅 定时模式' : '⏱️ 倒计时模式'}
          </span>
          
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            timer.isRunning 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          }`}>
            {timer.isRunning ? '⏳ 运行中' : '⏸️ 已暂停'}
          </span>
        </div>

        {timer.whiteNoise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30"
          >
            🎵 {timer.whiteNoise}
          </motion.div>
        )}
      </motion.div>

      {/* 控制按钮 */}
      <AnimatePresence>
        {(isHovered || !timer.isRunning || isFullMode) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-4"
          >
            {timer.remainingTime > 0 ? (
              <>
                {timer.isRunning ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPause}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                    暂停
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    继续
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStop}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                  </svg>
                  停止
                </motion.button>
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">🎉 完成！</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStop}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl"
                >
                  创建新定时器
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动粒子效果 */}
      {timer.isRunning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              animate={{
                x: [Math.random() * 400, Math.random() * 400],
                y: [Math.random() * 400, Math.random() * 400],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%'
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}