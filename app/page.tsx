'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedVantaBackground from './components/EnhancedVantaBackground'
import NewCountdownTimer from './components/NewCountdownTimer'
import CountdownCompletionModal from './components/CountdownCompletionModal'

export default function WhiteNoise() {
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

        {/* 主要内容区域 */}
        <div className="relative z-10">
          <NewCountdownTimer
            onTimerComplete={handleTimerComplete}
            onBackgroundChange={handleBackgroundChange}
          />
        </div>

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

        /* 文字阴影效果 */
        .text-shadow-lg {
          text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6);
        }

        /* 毛玻璃效果增强 */
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .glass-effect:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
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

export default WhiteNoise