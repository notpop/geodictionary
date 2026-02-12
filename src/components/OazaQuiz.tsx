'use client'

import { useState, useEffect, useCallback } from 'react'
import PrefectureLeafletMap from './PrefectureLeafletMap'
import { useOazaGeoJson } from '@/lib/useOazaGeoJson'
import { recordOazaQuiz, recordQuizClear } from '@/lib/storage'

interface QuizQuestion {
  name: string
  code: string
}

interface OazaQuizProps {
  muniCode: string
  muniName: string
  questionCount: number
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

export default function OazaQuiz({
  muniCode,
  muniName,
  questionCount,
  clearKey,
  onBack,
}: OazaQuizProps) {
  const { data: geoJson, loading } = useOazaGeoJson(muniCode)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animState, setAnimState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  // Disable page scrolling during quiz
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

  // Generate questions from GeoJSON features
  useEffect(() => {
    if (!geoJson) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features = (geoJson.features || []).filter((f: any) => f.properties?.name && f.properties?.code)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: QuizQuestion[] = features.map((f: any) => ({
      name: f.properties.name,
      code: f.properties.code,
    }))
    setQuestions(shuffle(entries).slice(0, questionCount))
  }, [geoJson, questionCount])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const isCorrect = selectedCode === currentQuestion?.code

  const handleMapClick = useCallback(
    (name: string, code?: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedCode(code || name)
      setSelectedName(name)
      setIsAnswered(true)
      const correct = (code || name) === currentQuestion.code
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
      setSelectedCode(null)
      setSelectedName(null)
      setIsAnswered(false)
      setAnimState('idle')
    } else {
      setIsComplete(true)
      recordOazaQuiz(correctCount, questions.length)
      if (correctCount === questions.length && clearKey) {
        recordQuizClear(clearKey)
      }
    }
  }, [currentIndex, questions.length, correctCount, clearKey])

  const handleRetry = useCallback(() => {
    if (!geoJson) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features = (geoJson.features || []).filter((f: any) => f.properties?.name && f.properties?.code)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: QuizQuestion[] = features.map((f: any) => ({
      name: f.properties.name,
      code: f.properties.code,
    }))
    setQuestions(shuffle(entries).slice(0, questionCount))
    setCurrentIndex(0)
    setSelectedCode(null)
    setSelectedName(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [geoJson, questionCount])

  if (loading || questions.length === 0) {
    return <div className="text-center py-12 text-slate-500">問題を生成中...</div>
  }

  // Result screen
  if (isComplete) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="space-y-4 animate-fade-in px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className={`text-5xl mb-3 ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">クイズ完了!</h2>
          <p className="text-sm text-slate-500 mb-3">{muniName} 大字・町クイズ</p>
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
    <div className="flex flex-col relative" style={{ height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}>
      {/* Header row */}
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

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className={`rounded-xl p-3 flex-shrink-0 ${animState === 'correct' ? 'animate-pulse-green' : animState === 'wrong' ? 'animate-shake' : ''}`}>
        <h2 className="text-lg font-bold text-slate-800 text-center">
          「{currentQuestion.name}」は{muniName}のどこ？
        </h2>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 py-1">
        <div className="flex-1 min-h-0">
          {geoJson && (
            <PrefectureLeafletMap
              geojson={geoJson}
              interactive={!isAnswered}
              onFeatureClick={!isAnswered ? handleMapClick : undefined}
              highlightedCode={isAnswered ? currentQuestion.code : null}
              wrongCode={isAnswered && !isCorrect ? selectedCode : null}
              className="h-full rounded-xl overflow-hidden"
            />
          )}
        </div>

        {/* Answer feedback */}
        {isAnswered && (
          <div className="text-center flex-shrink-0">
            {isCorrect ? (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                正解!
              </span>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                <span>{selectedName}</span>
                <span className="text-red-400">→</span>
                <span className="font-bold">{currentQuestion.name}</span>
              </div>
            )}
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
  )
}
