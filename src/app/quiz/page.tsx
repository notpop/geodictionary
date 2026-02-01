'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Quiz from '@/components/Quiz'
import quizData from '@/data/quiz-questions.json'
import { getProgress, calculateAccuracy, getLevelName } from '@/lib/storage'
import type { UserProgress } from '@/lib/storage'

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const categories = quizData.categories
  const questions = quizData.questions

  const getQuestionsByCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      return questions
    }
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
          <button onClick={() => setSelectedCategory(null)} className="hover:text-primary">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">クイズ</h1>
        <p className="text-slate-600">
          カテゴリを選んでクイズに挑戦。知識を確認しましょう。
        </p>
      </div>

      {/* Stats */}
      {progress && progress.totalQuizzesTaken > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">あなたの成績</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{progress.totalQuizzesTaken}</div>
              <div className="text-xs text-slate-500">解答数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{calculateAccuracy(progress)}%</div>
              <div className="text-xs text-slate-500">正解率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">Lv.{progress.currentLevel}</div>
              <div className="text-xs text-slate-500">{getLevelName(progress.currentLevel)}</div>
            </div>
          </div>
        </div>
      )}

      {/* All questions */}
      <button
        onClick={() => setSelectedCategory('all')}
        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">🎯</span>
          <div>
            <h2 className="font-bold text-xl">全カテゴリ混合</h2>
            <p className="text-blue-100 text-sm mt-1">
              すべてのカテゴリからランダムに出題（{questions.length}問から10問）
            </p>
          </div>
        </div>
      </button>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">カテゴリ別</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const count = questions.filter((q) => q.category === category.id).length
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{category.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-xs text-slate-400">問</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-xl p-4">
        <h3 className="font-bold text-amber-800 mb-2">ヒント</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 各クイズは10問です</li>
          <li>• 解答後に解説が表示されます</li>
          <li>• 正解率が上がるとレベルアップします</li>
          <li>• 何度でも挑戦できます</li>
        </ul>
      </div>
    </div>
  )
}
