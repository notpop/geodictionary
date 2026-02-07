'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import JapanMap from './JapanMap'
import { recordRoadQuiz } from '@/lib/storage'
import type { Road } from '@/lib/types'

interface QuizQuestion {
  road: Road
  options: string[] // prefecture names
  optionCodes: string[]
  correctCodes: string[] // all prefectures the road passes through
}

interface RoadQuizProps {
  roads: Road[]
  prefectureNames: Record<string, string>
  mode: 'multiple_choice' | 'map_click'
  questionCount: number
  filterCategory?: string
  onComplete?: (correct: number, total: number) => void
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

function generateQuestions(
  roads: Road[],
  prefectureNames: Record<string, string>,
  count: number,
  filterCategory?: string
): QuizQuestion[] {
  const filtered = filterCategory ? roads.filter((r) => r.category === filterCategory) : roads
  const picked = shuffle(filtered).slice(0, count)
  const allPrefs = Object.entries(prefectureNames).map(([code, name]) => ({ code, name }))

  return picked.map((road) => {
    // Pick one correct prefecture as the "answer"
    const correctCode = road.prefectures[Math.floor(Math.random() * road.prefectures.length)]
    const correctName = prefectureNames[correctCode] || correctCode

    // Pick 3 wrong prefectures (not in this road's list)
    const wrong = shuffle(allPrefs.filter((p) => !road.prefectures.includes(p.code))).slice(0, 3)
    const opts = shuffle([{ code: correctCode, name: correctName }, ...wrong])

    return {
      road,
      options: opts.map((o) => o.name),
      optionCodes: opts.map((o) => o.code),
      correctCodes: road.prefectures,
    }
  })
}

export default function RoadQuiz({
  roads,
  prefectureNames,
  mode,
  questionCount,
  filterCategory,
  onComplete,
  onBack,
}: RoadQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animState, setAnimState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    setQuestions(generateQuestions(roads, prefectureNames, questionCount, filterCategory))
  }, [roads, prefectureNames, questionCount, filterCategory])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const isCorrect = selectedAnswer ? currentQuestion?.road.prefectures.includes(selectedAnswer) : false

  const highlightColors = useMemo(() => {
    if (!isAnswered || !currentQuestion) return {}
    const colors: Record<string, string> = {}
    for (const code of currentQuestion.road.prefectures) {
      colors[code] = '#22c55e' // green
    }
    if (selectedAnswer && !currentQuestion.road.prefectures.includes(selectedAnswer)) {
      colors[selectedAnswer] = '#ef4444' // red for wrong answer
    }
    return colors
  }, [isAnswered, currentQuestion, selectedAnswer])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(answer)
      setIsAnswered(true)
      const correct = currentQuestion.road.prefectures.includes(answer)
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
      recordRoadQuiz(correctCount, questions.length)
      onComplete?.(correctCount, questions.length)
    }
  }, [currentIndex, questions.length, correctCount, onComplete])

  const handleRetry = useCallback(() => {
    setQuestions(generateQuestions(roads, prefectureNames, questionCount, filterCategory))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [roads, prefectureNames, questionCount, filterCategory])

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

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}>
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
        <h2 className="text-lg font-bold text-slate-800 text-center">
          {currentQuestion.road.name}が通る都道府県は？
        </h2>
        <p className="text-xs text-slate-400 text-center mt-0.5">
          {currentQuestion.road.startPoint} → {currentQuestion.road.endPoint}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 py-1">
        {mode === 'map_click' && (
          <div className="flex-1 min-h-0">
            <JapanMap
              interactive={!isAnswered}
              onPrefectureClick={!isAnswered ? handleAnswer : undefined}
              prefectureColors={isAnswered ? highlightColors : undefined}
              showLabels={isAnswered}
              size="full"
              zoomable={true}
            />
          </div>
        )}

        {mode === 'multiple_choice' && (
          <>
            <div className="space-y-2 flex-shrink-0">
              {currentQuestion.options.map((option, i) => {
                const code = currentQuestion.optionCodes[i]
                const isThisCorrect = currentQuestion.correctCodes.includes(code)
                const isSelected = code === selectedAnswer

                let btnClass = 'w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all active:scale-[0.98] '
                if (!isAnswered) {
                  btnClass += 'border-slate-200 bg-white'
                } else if (isThisCorrect) {
                  btnClass += 'border-green-500 bg-green-50'
                } else if (isSelected) {
                  btnClass += 'border-red-500 bg-red-50'
                } else {
                  btnClass += 'border-slate-100 bg-white opacity-50'
                }

                return (
                  <button
                    key={`${code}-${i}`}
                    onClick={() => handleAnswer(code)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isAnswered && isThisCorrect ? 'bg-green-500 text-white' :
                        isAnswered && isSelected ? 'bg-red-500 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-medium text-slate-800 text-sm">{option}</span>
                      {isAnswered && isThisCorrect && <span className="ml-auto text-green-500">✓</span>}
                      {isAnswered && isSelected && !isThisCorrect && <span className="ml-auto text-red-500">✗</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            {isAnswered && (
              <div className="flex-1 min-h-0 animate-fade-in">
                <JapanMap
                  prefectureColors={highlightColors}
                  showLabels={true}
                  size="full"
                />
              </div>
            )}
          </>
        )}

        {mode === 'map_click' && isAnswered && (
          <div className="text-center flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCorrect ? '正解!' : `不正解 → ${currentQuestion.road.prefectures.map((c) => prefectureNames[c]).join('、')}`}
            </span>
          </div>
        )}
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex-shrink-0 mb-1"
        >
          {currentIndex < questions.length - 1 ? '次へ' : '結果を見る'}
        </button>
      )}
    </div>
  )
}
