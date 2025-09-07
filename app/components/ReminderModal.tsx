'use client'

import { Timer } from '../page'

interface ReminderModalProps {
  timer: Timer
  onClose: () => void
}

export default function ReminderModal({ timer, onClose }: ReminderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="text-6xl mb-4">⏰</div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">时间到了！</h2>
          
          {/* Timer Title */}
          <div className="text-xl text-blue-600 font-semibold mb-4">
            {timer.title}
          </div>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            您的定时器已完成，该休息一下了！
          </p>
          
          {/* Action Button */}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            知道了
          </button>
        </div>
        
        {/* Manual close hint */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400">
            请手动关闭提醒
          </div>
        </div>
      </div>
    </div>
  )
}