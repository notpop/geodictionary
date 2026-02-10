'use client'

import { useState, useEffect } from 'react'
import Quiz from '@/components/Quiz'
import quizData from '@/data/quiz-questions.json'
import { getProgress, calculateAccuracy, getLevelName } from '@/lib/storage'
import type { UserProgress } from '@/lib/storage'

const categoryIcons: Record<string, string> = {
  basics: '📌',
  'power-companies': '⚡',
  regions: '🗾',
  vegetation: '🌿',
  architecture: '🏠',
  roads: '🛣️',
  agriculture: '🌾',
  prefectures: '📍',
  advanced: '🎓',
}

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const categories = quizData.categories
  const questions = quizData.questions

  const getQuestionsByCategory = (categoryId: string) => {
    if (categoryId === 'all') return questions
    return questions.filter((q) => q.category === categoryId)
  }

  const handleQuizComplete = () => {
    setProgress(getProgress())
  }

  if (selectedCategory) {
    const categoryQuestions = getQuestionsByCategory(selectedCategory)
    const category = categories.find((c) => c.id === selectedCategory)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => setSelectedCategory(null)} className="active:text-primary">
            クイズ
          </button>
          <span>/</span>
          <span className="text-slate-700">{category?.name || '全カテゴリ'}</span>
        </div>
        <Quiz
          questions={categoryQuestions as any}
          title={category?.name || '全カテゴリ混合'}
          onComplete={handleQuizComplete}
        />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-3">
      {/* Stats */}
      {progress && progress.totalQuizzesTaken > 0 && (
        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-primary">Lv.{progress.currentLevel}</span>
            <span className="text-slate-500">{getLevelName(progress.currentLevel)}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="text-sm">
            <span className="font-bold text-green-600">{calculateAccuracy(progress)}%</span>
            <span className="text-slate-400 ml-1">正解率</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="text-sm">
            <span className="font-bold text-slate-700">{progress.totalQuizzesTaken}</span>
            <span className="text-slate-400 ml-1">問</span>
          </div>
        </div>
      )}

      {/* All mix CTA */}
      <button
        onClick={() => setSelectedCategory('all')}
        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <div className="font-bold text-lg">全カテゴリ混合</div>
            <div className="text-blue-100 text-xs">{questions.length}問からランダム10問</div>
          </div>
        </div>
      </button>

      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => {
          const count = questions.filter((q) => q.category === category.id).length
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="bg-white rounded-xl border border-slate-200 p-3 text-center active:scale-[0.98] transition-transform"
            >
              <div className="text-2xl mb-1">{categoryIcons[category.id] || '📝'}</div>
              <div className="text-xs font-bold text-slate-800 leading-tight">{category.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{count}問</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
