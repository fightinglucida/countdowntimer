'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface CountdownCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  timerTitle: string
}

export default function CountdownCompletionModal({ isOpen, onClose, timerTitle }: CountdownCompletionModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const titleFlashRef = useRef<NodeJS.Timeout | null>(null)
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const originalTitleRef = useRef<string>('')

  useEffect(() => {
    if (isOpen) {
      // 保存原始标题
      originalTitleRef.current = document.title
      
      // 使用 Web Audio API 生成提示音
      const playBeepSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
          
          // 每2秒重复播放，但要保存timeout引用以便清理
          audioTimeoutRef.current = setTimeout(playBeepSound, 2000)
        } catch (error) {
          console.error('无法播放提示音:', error)
        }
      }
      
      playBeepSound()

      // 标题闪烁效果
      let isFlashing = true
      titleFlashRef.current = setInterval(() => {
        document.title = isFlashing ? '⏰ 时间到了！' : originalTitleRef.current
        isFlashing = !isFlashing
      }, 1000)
    }

    return () => {
      // 清理音频timeout
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current)
        audioTimeoutRef.current = null
      }
      
      // 清理标题闪烁
      if (titleFlashRef.current) {
        clearInterval(titleFlashRef.current)
        titleFlashRef.current = null
      }
      
      // 恢复原始标题
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }
  }, [isOpen])

  const handleClose = () => {
    // 停止音频播放
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current)
      audioTimeoutRef.current = null
    }
    
    // 停止标题闪烁
    if (titleFlashRef.current) {
      clearInterval(titleFlashRef.current)
      titleFlashRef.current = null
    }
    
    // 恢复原始标题
    if (originalTitleRef.current) {
      document.title = originalTitleRef.current
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* 模态框背景 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        {/* 模态框内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center"
        >
          {/* 动画图标 */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6"
          >
            ⏰
          </motion.div>
          
          {/* 标题 */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            时间到了！
          </motion.h2>
          
          {/* 定时器标题 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-blue-600 font-semibold mb-6"
          >
            {timerTitle}
          </motion.div>
          
          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8 text-lg"
          >
            您的倒计时已完成，该休息一下了！
          </motion.p>
          
          {/* 关闭按钮 */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 text-lg shadow-lg"
          >
            知道了
          </motion.button>
          
          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-gray-400"
          >
            点击按钮关闭提醒
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}