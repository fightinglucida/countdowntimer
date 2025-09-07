'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedVantaBackground from './components/EnhancedVantaBackground'
import NewCountdownTimer from './components/NewCountdownTimer'
import CountdownCompletionModal from './components/CountdownCompletionModal'

export default function NewCountdownPage() {
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completedTimerTitle, setCompletedTimerTitle] = useState('')
  const [currentBackground, setCurrentBackground] = useState('cells') // 默认森林主题

  // 处理定时器完成
  const handleTimerComplete = (timerTitle: string) => {
    setCompletedTimerTitle(timerTitle)
    setShowCompletionModal(true)
  }

  // 处理背景主题切换
  const handleBackgroundChange = (effect: string) => {
    setCurrentBackground(effect)
  }

  // 关闭完成弹窗
  const handleCloseModal = () => {
    setShowCompletionModal(false)
    setCompletedTimerTitle('')
  }

  return (
    <>
      {/* Vanta.js 背景 */}
      <EnhancedVantaBackground 
        effect={currentBackground}
        isTimerRunning={false}
      />

      {/* 主布局 */}
      <div className="relative min-h-screen" style={{ background: 'transparent' }}>
        {/* 顶部标题 */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pt-8 text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            精致倒计时
          </motion.h1>
          <motion.p 
            className="text-lg text-white/80"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            专注当下，优雅提醒
          </motion.p>
        </motion.header>

        {/* 主要内容区域 */}
        <div className="relative z-10">
          <NewCountdownTimer
            onTimerComplete={handleTimerComplete}
            onBackgroundChange={handleBackgroundChange}
          />
        </div>

        {/* 底部信息 */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>当前主题: {
                currentBackground === 'cells' ? '森林' :
                currentBackground === 'topology' ? '夏夜' :
                currentBackground === 'clouds' ? '天空' :
                currentBackground === 'fog' ? '沙滩' :
                currentBackground === 'waves' ? '海浪' : '未知'
              }</span>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* 完成提醒弹窗 */}
      <AnimatePresence>
        {showCompletionModal && (
          <CountdownCompletionModal
            isOpen={showCompletionModal}
            onClose={handleCloseModal}
            timerTitle={completedTimerTitle}
          />
        )}
      </AnimatePresence>

      {/* 全局样式 */}
      <style jsx global>{`
        body {
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }
        
        /* 自定义滚动条 */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* 输入框样式优化 */
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* 禁用文本选择 */
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </>
  )
}