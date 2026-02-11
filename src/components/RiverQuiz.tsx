'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import JapanMap from './JapanMap'
import { recordRiverQuiz, recordQuizClear } from '@/lib/storage'
import type { River } from '@/lib/types'

interface QuizQuestion {
  river: River
  options: string[]
  optionCodes: string[]
  correctCodes: string[]
}

interface RiverQuizProps {
  rivers: River[]
  prefectureNames: Record<string, string>
  mode: 'multiple_choice' | 'map_click' | 'identify'
  questionCount: number
  clearKey?: string
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
  rivers: River[],
  prefectureNames: Record<string, string>,
  count: number,
  mode: 'multiple_choice' | 'map_click' | 'identify'
): QuizQuestion[] {
  const picked = shuffle(rivers).slice(0, count)

  if (mode === 'identify') {
    return picked.map((river) => {
      const wrong = shuffle(rivers.filter((r) => r.name !== river.name)).slice(0, 3)
      const opts = shuffle([river, ...wrong])
      return {
        river,
        options: opts.map((r) => r.name),
        optionCodes: opts.map((r) => r.name),
        correctCodes: river.prefectures,
      }
    })
  }

  const allPrefs = Object.entries(prefectureNames).map(([code, name]) => ({ code, name }))
  return picked.map((river) => {
    const correctCode = river.prefectures[Math.floor(Math.random() * river.prefectures.length)]
    const correctName = prefectureNames[correctCode] || correctCode
    const wrong = shuffle(allPrefs.filter((p) => !river.prefectures.includes(p.code))).slice(0, 3)
    const opts = shuffle([{ code: correctCode, name: correctName }, ...wrong])
    return {
      river,
      options: opts.map((o) => o.name),
      optionCodes: opts.map((o) => o.code),
      correctCodes: river.prefectures,
    }
  })
}

export default function RiverQuiz({
  rivers,
  prefectureNames,
  mode,
  questionCount,
  clearKey,
  onComplete,
  onBack,
}: RiverQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animState, setAnimState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    setQuestions(generateQuestions(rivers, prefectureNames, questionCount, mode))
  }, [rivers, prefectureNames, questionCount, mode])

  // クイズ中はページスクロール無効化（html/body/main/container全て）
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null
    const container = main?.querySelector(':scope > div') as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    if (main) main.style.overflow = 'hidden'
    if (container) container.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      if (main) main.style.overflow = ''
      if (container) container.style.overflow = ''
    }
  }, [])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const isCorrectAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return false
      if (mode === 'identify') {
        return answer === currentQuestion.river.name
      }
      return currentQuestion.river.prefectures.includes(answer)
    },
    [currentQuestion, mode]
  )

  const isCorrect = selectedAnswer ? isCorrectAnswer(selectedAnswer) : false

  const highlightColors = useMemo(() => {
    if (!currentQuestion) return {}
    if (mode === 'identify') {
      const colors: Record<string, string> = {}
      for (const code of currentQuestion.river.prefectures) {
        colors[code] = '#3b82f6'
      }
      return colors
    }
    if (!isAnswered) return {}
    const colors: Record<string, string> = {}
    for (const code of currentQuestion.river.prefectures) {
      colors[code] = '#3b82f6'
    }
    if (selectedAnswer && !currentQuestion.river.prefectures.includes(selectedAnswer)) {
      colors[selectedAnswer] = '#ef4444'
    }
    return colors
  }, [isAnswered, currentQuestion, selectedAnswer, mode])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(answer)
      setIsAnswered(true)
      const correct = isCorrectAnswer(answer)
      if (correct) {
        setCorrectCount((prev) => prev + 1)
        setAnimState('correct')
      } else {
        setAnimState('wrong')
      }
      setTimeout(() => setAnimState('idle'), 600)
    },
    [isAnswered, currentQuestion, isCorrectAnswer]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setAnimState('idle')
    } else {
      setIsComplete(true)
      recordRiverQuiz(correctCount, questions.length)
      if (correctCount === questions.length && clearKey) {
        recordQuizClear(clearKey)
      }
      onComplete?.(correctCount, questions.length)
    }
  }, [currentIndex, questions.length, correctCount, onComplete])

  const handleRetry = useCallback(() => {
    setQuestions(generateQuestions(rivers, prefectureNames, questionCount, mode))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [rivers, prefectureNames, questionCount, mode])

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
            <button onClick={handleRetry} className="flex-1 py-3 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform">
              もう一度
            </button>
            {onBack && (
              <button onClick={onBack} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:scale-[0.98] transition-transform">
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
    <div className="flex flex-col relative" style={{ height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}>
      <div className="flex items-center justify-between py-2 flex-shrink-0 px-1">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 active:text-slate-600 px-2 py-1 -ml-2 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs font-medium">中止</span>
        </button>
        <span className="text-xs text-slate-500">Q{currentIndex + 1}/{questions.length}</span>
        <span className="text-xs font-medium text-primary">正解 {correctCount}</span>
      </div>

      <div className="h-1 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className={`rounded-xl p-3 flex-shrink-0 ${animState === 'correct' ? 'animate-pulse-green' : animState === 'wrong' ? 'animate-shake' : ''}`}>
        {mode === 'identify' ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 text-center">
              この川は何？
            </h2>
            <p className="text-xs text-slate-400 text-center mt-0.5">
              青く表示された都道府県を流れる川を選んでください
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-800 text-center">
              「{currentQuestion.river.name}」が流れる都道府県は？
            </h2>
            <p className="text-xs text-slate-400 text-center mt-0.5">
              {currentQuestion.river.reading} / {currentQuestion.river.length}km
            </p>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2 py-1">
        {/* Map click mode */}
        {mode === 'map_click' && (
          <div className="flex-1 min-h-0">
            <JapanMap
              interactive={!isAnswered}
              onPrefectureClick={!isAnswered ? handleAnswer : undefined}
              prefectureColors={isAnswered ? highlightColors : undefined}
              showLabels={isAnswered}
              size="full"
              zoomable={true}
              defaultScale={0.45}
            />
          </div>
        )}

        {/* Identify mode: map always shown + 4 river name choices */}
        {mode === 'identify' && (
          <>
            <div className="flex-1 min-h-0">
              <JapanMap
                prefectureColors={highlightColors}
                showLabels={true}
                size="full"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
              {currentQuestion.options.map((option, i) => {
                const code = currentQuestion.optionCodes[i]
                const isThisCorrect = code === currentQuestion.river.name
                const isSelected = code === selectedAnswer

                let btnClass = 'text-center px-2 py-2.5 rounded-xl border-2 transition-all active:scale-[0.98] '
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
                    <span className="font-medium text-slate-800 text-sm">{option}</span>
                  </button>
                )
              })}
            </div>
            {isAnswered && (
              <div className="text-center flex-shrink-0 animate-fade-in">
                <div className="text-xs text-slate-500">
                  {currentQuestion.river.source} → {currentQuestion.river.mouth} ({currentQuestion.river.length}km)
                </div>
              </div>
            )}
          </>
        )}

        {/* Multiple choice mode */}
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
                  <button key={`${code}-${i}`} onClick={() => handleAnswer(code)} disabled={isAnswered} className={btnClass}>
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isAnswered && isThisCorrect ? 'bg-green-500 text-white' :
                        isAnswered && isSelected ? 'bg-red-500 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>{String.fromCharCode(65 + i)}</span>
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
                <JapanMap prefectureColors={highlightColors} showLabels={true} size="full" />
              </div>
            )}
          </>
        )}

        {mode === 'map_click' && isAnswered && (
          <div className="text-center flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCorrect ? '正解!' : `不正解 → ${currentQuestion.river.prefectures.map((c) => prefectureNames[c]).join('、')}`}
            </span>
          </div>
        )}
      </div>

      {/* Next button - overlay at bottom */}
      {isAnswered && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-1 pb-1 pt-8 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none">
          <button
            onClick={handleNext}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold active:scale-[0.98] transition-transform pointer-events-auto"
          >
            {currentIndex < questions.length - 1 ? '次へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  )
}
