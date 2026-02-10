'use client'

import { useState, useEffect, useCallback } from 'react'
import JapanMap from './JapanMap'
import { recordAreaCodeQuiz, recordQuizClear } from '@/lib/storage'
import type { AreaCode } from '@/lib/types'

interface QuizQuestion {
  areaCode: AreaCode
  correctPrefCode: string
}

interface AreaCodeQuizProps {
  areaCodes: AreaCode[]
  questionCount: number
  filterRegion?: string
  clearKey?: string
  onBack?: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestions(areaCodes: AreaCode[], count: number, filterRegion?: string): QuizQuestion[] {
  const filtered = filterRegion ? areaCodes.filter((a) => a.region === filterRegion) : areaCodes
  const picked = shuffle(filtered).slice(0, count)
  return picked.map((ac) => ({
    areaCode: ac,
    correctPrefCode: ac.prefCode,
  }))
}

export default function AreaCodeQuiz({ areaCodes, questionCount, filterRegion, clearKey, onBack }: AreaCodeQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animState, setAnimState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    setQuestions(generateQuestions(areaCodes, questionCount, filterRegion))
  }, [areaCodes, questionCount, filterRegion])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const isCorrect = selectedAnswer === currentQuestion?.correctPrefCode

  const handleAnswer = useCallback(
    (prefCode: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(prefCode)
      setIsAnswered(true)
      const correct = prefCode === currentQuestion.correctPrefCode
      if (correct) {
        setCorrectCount((prev) => prev + 1)
        setAnimState('correct')
      } else {
        setAnimState('wrong')
      }
      setTimeout(() => setAnimState('idle'), 600)
    },
    [isAnswered, currentQuestion]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setAnimState('idle')
    } else {
      setIsComplete(true)
      recordAreaCodeQuiz(correctCount, questions.length)
      if (correctCount === questions.length && clearKey) {
        recordQuizClear(clearKey)
      }
    }
  }, [currentIndex, questions.length, correctCount])

  const handleRetry = useCallback(() => {
    setQuestions(generateQuestions(areaCodes, questionCount, filterRegion))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [areaCodes, questionCount, filterRegion])

  if (questions.length === 0) {
    return <div className="text-center py-12 text-slate-500">問題を生成中...</div>
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className={`text-5xl mb-3 ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">クイズ完了!</h2>
          <div className="bg-slate-50 rounded-xl p-4 mb-3">
            <div className="text-3xl font-bold text-primary">
              {correctCount} / {questions.length}
            </div>
            <div className="text-slate-600 text-sm mt-1">正解率: {percentage}%</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform"
            >
              もう一度
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-[0.98] transition-transform"
              >
                戻る
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const highlightColors: Record<string, string> = {}
  if (isAnswered) {
    highlightColors[currentQuestion.correctPrefCode] = '#22c55e'
    if (selectedAnswer && selectedAnswer !== currentQuestion.correctPrefCode) {
      highlightColors[selectedAnswer] = '#ef4444'
    }
  }

  return (
    <>
    <style>{`html,body{overflow:hidden!important}`}</style>
    <div className="flex flex-col relative" style={{ height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="flex items-center justify-between py-2 flex-shrink-0 px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 active:text-slate-600 px-2 py-1 -ml-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs font-medium">中止</span>
        </button>
        <span className="text-xs text-slate-500">Q{currentIndex + 1}/{questions.length}</span>
        <span className="text-xs font-medium text-primary">正解 {correctCount}</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className={`rounded-xl p-3 flex-shrink-0 ${animState === 'correct' ? 'animate-pulse-green' : animState === 'wrong' ? 'animate-shake' : ''}`}>
        <div className="text-center">
          <span className="inline-block bg-slate-900 text-white text-3xl font-mono font-bold px-6 py-2 rounded-xl tracking-wider">
            0{currentQuestion.areaCode.code.startsWith('0') ? currentQuestion.areaCode.code.slice(1) : currentQuestion.areaCode.code}
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-800 text-center mt-2">
          この市外局番はどの都道府県？
        </h2>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 py-1">
        <div className="flex-1 min-h-0">
          <JapanMap
            key={`q-${currentIndex}`}
            interactive={!isAnswered}
            onPrefectureClick={!isAnswered ? handleAnswer : undefined}
            prefectureColors={isAnswered ? highlightColors : undefined}
            showLabels={isAnswered}
            size="full"
            zoomable={true}
            defaultScale={0.45}
          />
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className="text-center flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCorrect
                ? `正解! ${currentQuestion.areaCode.code} → ${currentQuestion.areaCode.prefName}（${currentQuestion.areaCode.city}）`
                : `不正解 → ${currentQuestion.areaCode.prefName}（${currentQuestion.areaCode.city}）`}
            </span>
          </div>
        )}
      </div>

      {/* Next button */}
      {isAnswered && (
        <div className="flex-shrink-0 px-1 pt-2 pb-1">
          <button
            onClick={handleNext}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
          >
            {currentIndex < questions.length - 1 ? '次へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
    </>
  )
}
