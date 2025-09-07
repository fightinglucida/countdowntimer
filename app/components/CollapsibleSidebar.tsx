'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface CollapsibleSidebarProps {
  isVisible: boolean
  side: 'left' | 'right'
  children: ReactNode
  title: string
}

export default function CollapsibleSidebar({ 
  isVisible, 
  side, 
  children, 
  title 
}: CollapsibleSidebarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            x: side === 'left' ? -400 : 400,
            opacity: 0
          }}
          animate={{ 
            x: 0,
            opacity: 1
          }}
          exit={{ 
            x: side === 'left' ? -400 : 400,
            opacity: 0
          }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 200
          }}
          className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-96 z-30 bg-black/20 backdrop-blur-xl border-${side === 'left' ? 'r' : 'l'} border-white/10`}
        >
          {/* 侧边栏头部 */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>

          {/* 侧边栏内容 */}
          <div className="p-6 h-full overflow-y-auto">
            {children}
          </div>

          {/* 渐变遮罩 */}
          <div className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} w-1 h-full bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50`} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}