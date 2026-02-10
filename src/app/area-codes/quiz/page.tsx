'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import AreaCodeQuiz from '@/components/AreaCodeQuiz'
import areaCodeData from '@/data/area-codes.json'
import { getQuizClears } from '@/lib/storage'
import type { AreaCode } from '@/lib/types'

const regions = ['全て', '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州']

function AreaCodeQuizPageInner() {
  const [started, setStarted] = useState(false)
  const [questionCount, setQuestionCount] = useState(10)
  const [filterRegion, setFilterRegion] = useState('全て')
  const [clears, setClears] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setClears(getQuizClears())
  }, [])

  useEffect(() => {
    if (!started) setClears(getQuizClears())
  }, [started])

  const areaCodes = areaCodeData.areaCodes as AreaCode[]

  const filteredCount = useMemo(() => {
    if (filterRegion === '全て') return areaCodes.length
    return areaCodes.filter((a) => a.region === filterRegion).length
  }, [areaCodes, filterRegion])

  const countOptions = [10, 20].filter((n) => n <= filteredCount)

  const clearPrefix = `areacode:${filterRegion}`
  const clearKey = `${clearPrefix}:${questionCount}`

  if (started) {
    return (
      <div className="-mx-4 -mt-6">
        <AreaCodeQuiz
          areaCodes={areaCodes}
          questionCount={questionCount}
          filterRegion={filterRegion === '全て' ? undefined : filterRegion}
          clearKey={clearKey}
          onBack={() => setStarted(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in overflow-x-hidden">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-sm text-slate-500 active:text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        戻る
      </button>

      {/* Region filter */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">範囲</h2>
        <div className="flex gap-1.5 flex-wrap">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => {
                setFilterRegion(r)
                const newCount = r === '全て' ? areaCodes.length : areaCodes.filter((a) => a.region === r).length
                if (questionCount > newCount) setQuestionCount(Math.min(10, newCount))
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                filterRegion === r ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">
          出題数
          <span className="font-normal text-slate-400 ml-1 text-xs">（{filteredCount}問）</span>
        </h2>
        <div className="flex gap-2">
          {countOptions.map((n) => {
            const isSelected = questionCount === n && questionCount !== filteredCount
            const isCleared = !!clears[`${clearPrefix}:${n}`]
            return (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-primary text-white'
                    : isCleared
                    ? 'bg-green-50 text-slate-700 ring-2 ring-green-400'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {isCleared && (
                    <svg className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {n}問
                </span>
              </button>
            )
          })}
          {(() => {
            const isSelected = questionCount === filteredCount
            const isCleared = !!clears[`${clearPrefix}:${filteredCount}`]
            return (
              <button
                onClick={() => setQuestionCount(filteredCount)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-primary text-white'
                    : isCleared
                    ? 'bg-green-50 text-slate-700 ring-2 ring-green-400'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {isCleared && (
                    <svg className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  全て({filteredCount})
                </span>
              </button>
            )
          })()}
        </div>
      </div>

      {/* Start */}
      <button
        onClick={() => setStarted(true)}
        className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        開始
      </button>
    </div>
  )
}

export default function AreaCodeQuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">読み込み中...</div>}>
      <AreaCodeQuizPageInner />
    </Suspense>
  )
}
