'use client'

import { Timer } from '../page'
import { useState, useEffect } from 'react'

interface TimerCardProps {
  timer: Timer
  onStart: () => void
  onPause: () => void
  onDelete: () => void
}

export default function TimerCard({ timer, onStart, onPause, onDelete }: TimerCardProps) {

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((timer.duration - timer.remainingTime) / timer.duration) * 100
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
      timer.mode === 'scheduled' ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800 truncate">
              {timer.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              timer.mode === 'scheduled' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {timer.mode === 'scheduled' ? '📅 定时' : '⏱️ 倒计时'}
            </span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
          title="删除定时器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-mono font-bold ${
          timer.remainingTime <= 60 ? 'text-red-500' : 'text-gray-800'
        }`}>
          {formatTime(timer.remainingTime)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
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
      {timer.whiteNoise && (
        <div className="mb-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🎵 {timer.whiteNoise}
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        {timer.remainingTime > 0 ? (
          <>
            {timer.isRunning ? (
              <button
                onClick={onPause}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                暂停
              </button>
            ) : (
              <button
                onClick={onStart}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                开始
              </button>
            )}
          </>
        ) : (
          <div className="flex-1 bg-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-lg text-center">
            已完成
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          timer.isRunning 
            ? 'bg-green-100 text-green-800' 
            : timer.remainingTime > 0 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {timer.isRunning ? '⏳ 运行中' : timer.remainingTime > 0 ? '⏸️ 已暂停' : '✅ 已完成'}
        </span>
      </div>
    </div>
  )
}