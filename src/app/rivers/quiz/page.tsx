'use client'

import { Suspense, useState } from 'react'
import RiverQuiz from '@/components/RiverQuiz'
import riverData from '@/data/rivers.json'
import roadData from '@/data/roads.json'
import type { River } from '@/lib/types'

type QuizMode = 'multiple_choice' | 'map_click'

function RiverQuizPageInner() {
  const [started, setStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<QuizMode>('multiple_choice')
  const [questionCount, setQuestionCount] = useState(10)

  const rivers = riverData.rivers as River[]
  const prefectureNames = roadData.prefectureNames as Record<string, string>
  const totalRivers = rivers.length
  const countOptions = [10, 20].filter((n) => n <= totalRivers)

  if (started) {
    return (
      <div className="-mx-4 -mt-6">
        <RiverQuiz
          rivers={rivers}
          prefectureNames={prefectureNames}
          mode={quizMode}
          questionCount={questionCount}
          onBack={() => setStarted(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Mode */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">モード</h2>
        <div className="grid grid-cols-2 gap-2">
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
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                questionCount === n && questionCount !== totalRivers
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n}問
            </button>
          ))}
          <button
            onClick={() => setQuestionCount(totalRivers)}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
              questionCount === totalRivers ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            全て({totalRivers})
          </button>
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
