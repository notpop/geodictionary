'use client'

import { Suspense, useState, useEffect } from 'react'
import RiverQuiz from '@/components/RiverQuiz'
import riverData from '@/data/rivers.json'
import roadData from '@/data/roads.json'
import { getQuizClears } from '@/lib/storage'
import type { River } from '@/lib/types'

type QuizMode = 'multiple_choice' | 'map_click' | 'identify'

function RiverQuizPageInner() {
  const [started, setStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<QuizMode>('identify')
  const [questionCount, setQuestionCount] = useState(10)
  const [clears, setClears] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setClears(getQuizClears())
  }, [])

  useEffect(() => {
    if (!started) setClears(getQuizClears())
  }, [started])

  const rivers = riverData.rivers as River[]
  const prefectureNames = roadData.prefectureNames as Record<string, string>
  const totalRivers = rivers.length
  const countOptions = [10, 20].filter((n) => n <= totalRivers)

  const clearPrefix = 'river:all'
  const clearKey = `${clearPrefix}:${questionCount}`

  if (started) {
    return (
      <div className="-mx-4 -mt-6">
        <RiverQuiz
          rivers={rivers}
          prefectureNames={prefectureNames}
          mode={quizMode}
          questionCount={questionCount}
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

      {/* Mode */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">モード</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setQuizMode('identify')}
            className={`p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
              quizMode === 'identify' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">名前当て</div>
          </button>
          <button
            onClick={() => setQuizMode('multiple_choice')}
            className={`p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
              quizMode === 'multiple_choice' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">4択</div>
          </button>
          <button
            onClick={() => setQuizMode('map_click')}
            className={`p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
              quizMode === 'map_click' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">地図タップ</div>
          </button>
        </div>
      </div>

      {/* Count */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">
          出題数
          <span className="font-normal text-slate-400 ml-1 text-xs">（{totalRivers}本）</span>
        </h2>
        <div className="flex gap-2">
          {countOptions.map((n) => {
            const isSelected = questionCount === n && questionCount !== totalRivers
            const isCleared = !!clears[`${clearPrefix}:${n}`]
            return (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-primary text-white'
                    : isCleared
                    ? 'bg-green-50 text-green-700 ring-2 ring-inset ring-green-400'
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
            const isSelected = questionCount === totalRivers
            const isCleared = !!clears[`${clearPrefix}:${totalRivers}`]
            return (
              <button
                onClick={() => setQuestionCount(totalRivers)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-primary text-white'
                    : isCleared
                    ? 'bg-green-50 text-green-700 ring-2 ring-inset ring-green-400'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {isCleared && (
                    <svg className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  全て({totalRivers})
                </span>
              </button>
            )
          })()}
        </div>
      </div>

      {/* Start */}
      <button
        onClick={() => setStarted(true)}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        開始
      </button>
    </div>
  )
}

export default function RiverQuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">読み込み中...</div>}>
      <RiverQuizPageInner />
    </Suspense>
  )
}
