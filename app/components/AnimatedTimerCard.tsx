'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from '../page'
import { useState, useEffect } from 'react'

interface AnimatedTimerCardProps {
  timer: Timer
  onStart: () => void
  onPause: () => void
  onDelete: () => void
  isFullscreen?: boolean
}

export default function AnimatedTimerCard({ 
  timer, 
  onStart, 
  onPause, 
  onDelete, 
  isFullscreen = false 
}: AnimatedTimerCardProps) {
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
    return ((timer.duration - timer.remainingTime) / timer.duration) * 100
  }

  const getProgressColor = () => {
    const progress = getProgressPercentage()
    if (progress < 25) return 'from-emerald-400 to-cyan-400'
    if (progress < 50) return 'from-blue-400 to-indigo-400'
    if (progress < 75) return 'from-purple-400 to-pink-400'
    return 'from-red-400 to-orange-400'
  }

  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-40 flex items-center justify-center"
      >
        <div className="text-center">
          {/* Fullscreen Timer Display */}
          <motion.div
            animate={{ 
              scale: timer.isRunning ? [1, 1.02, 1] : 1,
              filter: timer.remainingTime <= 10 ? 'hue-rotate(0deg)' : 'hue-rotate(180deg)'
            }}
            transition={{ 
              scale: { duration: 1, repeat: Infinity },
              filter: { duration: 0.5 }
            }}
            className="relative"
          >
            {/* Circular Progress */}
            <svg className="w-96 h-96" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: getProgressPercentage() / 100 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-90deg)"
                }}
                strokeDasharray="565.48"
                strokeDashoffset={565.48 * (1 - getProgressPercentage() / 100)}
              />
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ 
                  scale: timer.remainingTime <= 10 ? [1, 1.1, 1] : 1,
                  color: timer.remainingTime <= 10 ? '#ef4444' : '#ffffff'
                }}
                transition={{ duration: 0.5, repeat: timer.remainingTime <= 10 ? Infinity : 0 }}
                className="text-8xl font-mono font-bold mb-4"
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.5)',
                  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
                }}
              >
                {formatTime(timer.remainingTime)}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl text-white/80 mb-8"
              >
                {timer.title}
              </motion.div>

              {/* Status indicator */}
              <motion.div
                animate={{ 
                  opacity: timer.isRunning ? [0.5, 1, 0.5] : 1 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`px-6 py-2 rounded-full text-lg font-medium ${
                  timer.isRunning 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}
              >
                {timer.isRunning ? '⏳ 运行中' : '⏸️ 已暂停'}
              </motion.div>
            </div>
          </motion.div>

          {/* Floating particles around timer */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  x: [0, Math.random() * 400 - 200],
                  y: [0, Math.random() * 400 - 200],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md border transition-all duration-500 ${
        timer.mode === 'scheduled' 
          ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' 
          : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30'
      } ${isHovered ? 'shadow-2xl shadow-blue-500/20' : 'shadow-xl'}`}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: timer.isRunning 
            ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)'
            : 'linear-gradient(45deg, #6b7280, #9ca3af, #6b7280)'
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          backgroundSize: '400% 400%',
          animation: 'gradient 3s ease infinite'
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3">
              <motion.h3 
                className="text-xl font-bold text-white truncate"
                animate={{ color: isHovered ? '#60a5fa' : '#ffffff' }}
              >
                {timer.title}
              </motion.h3>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  timer.mode === 'scheduled' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {timer.mode === 'scheduled' ? '📅 定时' : '⏱️ 倒计时'}
              </motion.span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} relative`}
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              scale: timer.remainingTime <= 60 ? [1, 1.05, 1] : 1,
              color: timer.remainingTime <= 60 ? '#ef4444' : '#ffffff'
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl font-mono font-bold mb-2"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.3)',
              filter: timer.remainingTime <= 60 ? 'drop-shadow(0 0 5px #ef4444)' : 'none'
            }}
          >
            {formatTime(timer.remainingTime)}
          </motion.div>
          
          <div className="text-sm text-white/60">
            {timer.mode === 'scheduled' && timer.scheduledTime ? (
              <>
                目标时间: {new Date(timer.scheduledTime).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            ) : (
              <>总时长: {formatTime(timer.duration)}</>
            )}
          </div>
        </div>

        {/* White Noise Indicator */}
        <AnimatePresence>
          {timer.whiteNoise && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-4 text-center"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                🎵 {timer.whiteNoise}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {timer.remainingTime > 0 ? (
            <>
              {timer.isRunning ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onPause}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
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
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  开始
                </motion.button>
              )}
            </>
          ) : (
            <div className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-xl text-center">
              已完成
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <motion.div 
          className="mt-3 text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            timer.isRunning 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : timer.remainingTime > 0 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            {timer.isRunning ? '⏳ 运行中' : timer.remainingTime > 0 ? '⏸️ 已暂停' : '✅ 已完成'}
          </span>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  )
}