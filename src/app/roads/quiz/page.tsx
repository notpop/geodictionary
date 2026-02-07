'use client'

import { Suspense, useState } from 'react'
import RoadQuiz from '@/components/RoadQuiz'
import roadData from '@/data/roads.json'
import type { Road } from '@/lib/types'

type QuizMode = 'multiple_choice' | 'map_click' | 'identify'

const categories = ['全て', '主要幹線', '一般国道', '補助国道']

function RoadQuizPageInner() {
  const [started, setStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<QuizMode>('identify')
  const [questionCount, setQuestionCount] = useState(10)
  const [filterCategory, setFilterCategory] = useState('全て')

  const roads = roadData.roads as Road[]
  const prefectureNames = roadData.prefectureNames as Record<string, string>

  const filteredCount = filterCategory === '全て'
    ? roads.length
    : roads.filter((r) => r.category === filterCategory).length

  const countOptions = [10, 20].filter((n) => n <= filteredCount)

  if (started) {
    return (
      <div className="-mx-4 -mt-6">
        <RoadQuiz
          roads={roads}
          prefectureNames={prefectureNames}
          mode={quizMode}
          questionCount={questionCount}
          filterCategory={filterCategory === '全て' ? undefined : filterCategory}
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
          <span className="font-normal text-slate-400 ml-1 text-xs">（{filteredCount}本）</span>
        </h2>
        <div className="flex gap-2">
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                questionCount === n && questionCount !== filteredCount
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n}問
            </button>
          ))}
          <button
            onClick={() => setQuestionCount(filteredCount)}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
              questionCount === filteredCount ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            全て({filteredCount})
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">範囲</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat)
                const newCount = cat === '全て' ? roads.length : roads.filter((r) => r.category === cat).length
                if (questionCount > newCount) setQuestionCount(Math.min(10, newCount))
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                filterCategory === cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
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

export default function RoadQuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">読み込み中...</div>}>
      <RoadQuizPageInner />
    </Suspense>
  )
}
