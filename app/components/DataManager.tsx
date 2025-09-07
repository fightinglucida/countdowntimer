'use client'

import { useRef } from 'react'
import { Timer, WhiteNoise } from '../page'

interface DataManagerProps {
  timers: Timer[]
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>
  whiteNoises: WhiteNoise[]
  setWhiteNoises: React.Dispatch<React.SetStateAction<WhiteNoise[]>>
}

export default function DataManager({ timers, setTimers, whiteNoises, setWhiteNoises }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const data = {
      timers,
      whiteNoises,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `timer_config_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/json') {
      alert('请选择有效的JSON文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate data structure
        if (!data.timers || !Array.isArray(data.timers)) {
          throw new Error('Invalid timers data')
        }

        if (!data.whiteNoises || !Array.isArray(data.whiteNoises)) {
          throw new Error('Invalid white noises data')
        }

        // Confirm before overwriting
        const confirmOverwrite = confirm(
          `确定要导入配置吗？这将覆盖当前的 ${timers.length} 个定时器。\n\n导入文件包含：\n- ${data.timers.length} 个定时器\n- 导出时间：${data.exportDate ? new Date(data.exportDate).toLocaleString() : '未知'}`
        )

        if (confirmOverwrite) {
          // Reset running states for imported timers
          const importedTimers = data.timers.map((timer: Timer) => ({
            ...timer,
            isRunning: false
          }))

          setTimers(importedTimers)
          
          // Only update white noises if they exist in the import
          if (data.whiteNoises) {
            const importedWhiteNoises = data.whiteNoises.map((noise: WhiteNoise) => ({
              ...noise,
              isActive: false
            }))
            setWhiteNoises(importedWhiteNoises)
          }

          alert('配置导入成功！')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('导入失败：文件格式不正确或数据损坏')
      }
    }

    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearAllData = () => {
    const confirmClear = confirm(
      `确定要清除所有数据吗？这将删除：\n- ${timers.length} 个定时器\n- 所有白噪音设置\n\n此操作不可撤销！`
    )

    if (confirmClear) {
      setTimers([])
      setWhiteNoises(whiteNoises.map(noise => ({ ...noise, isActive: false })))
      localStorage.removeItem('elegant-timers')
      localStorage.removeItem('elegant-white-noises')
      alert('所有数据已清除')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">数据管理</h2>
      
      <div className="space-y-3">
        {/* Export Button */}
        <button
          onClick={exportData}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出配置
        </button>

        {/* Import Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            导入配置
          </button>
        </div>

        {/* Clear Data Button */}
        <button
          onClick={clearAllData}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清除所有数据
        </button>
      </div>

      {/* Data Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>当前定时器：</span>
            <span className="font-medium">{timers.length} 个</span>
          </div>
          <div className="flex justify-between">
            <span>运行中：</span>
            <span className="font-medium text-green-600">
              {timers.filter(t => t.isRunning).length} 个
            </span>
          </div>
          <div className="flex justify-between">
            <span>已完成：</span>
            <span className="font-medium text-gray-500">
              {timers.filter(t => t.remainingTime === 0).length} 个
            </span>
          </div>
          <div className="flex justify-between">
            <span>活跃白噪音：</span>
            <span className="font-medium text-blue-600">
              {whiteNoises.filter(n => n.isActive).length} 个
            </span>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 text-center">
          <div className="mb-1">💾 数据存储在浏览器本地</div>
          <div>清除浏览器数据会丢失所有配置</div>
        </div>
      </div>
    </div>
  )
}