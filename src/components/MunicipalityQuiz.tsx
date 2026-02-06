'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import JapanMap from './JapanMap'
import { recordMunicipalityQuiz } from '@/lib/storage'
import type { MunicipalityPrefecture } from '@/lib/types'

interface QuizQuestion {
  municipalityName: string
  reading: string
  correctPrefCode: string
  correctPrefName: string
  lat: number
  lng: number
  options?: string[] // for multiple choice mode
  optionCodes?: string[]
}

interface MunicipalityQuizProps {
  prefectures: MunicipalityPrefecture[]
  mode: 'multiple_choice' | 'map_click'
  questionCount: number
  filterPrefecture?: string
  onComplete?: (correct: number, total: number) => void
  onBack?: () => void
}

function generateQuestions(
  prefectures: MunicipalityPrefecture[],
  count: number,
  filterPref?: string,
  mode?: string
): QuizQuestion[] {
  // Collect all quizzable entries
  type Entry = {
    name: string
    reading: string
    prefCode: string
    prefName: string
    lat: number
    lng: number
  }
  const allEntries: Entry[] = []
  const targetPrefs = filterPref
    ? prefectures.filter((p) => p.code === filterPref)
    : prefectures

  for (const pref of targetPrefs) {
    for (const m of pref.municipalities) {
      allEntries.push({
        name: m.name,
        reading: m.reading,
        prefCode: pref.code,
        prefName: pref.name,
        lat: m.lat,
        lng: m.lng,
      })
      if (m.wards) {
        for (const w of m.wards) {
          allEntries.push({
            name: `${m.name}${w.name}`,
            reading: `${m.reading}${w.reading}`,
            prefCode: pref.code,
            prefName: pref.name,
            lat: w.lat,
            lng: w.lng,
          })
        }
      }
    }
  }

  // Shuffle and pick
  const shuffled = [...allEntries].sort(() => Math.random() - 0.5).slice(0, count)
  const allPrefNames = prefectures.map((p) => ({ code: p.code, name: p.name }))

  return shuffled.map((entry) => {
    // Generate 3 wrong options
    const wrongOptions = allPrefNames
      .filter((p) => p.code !== entry.prefCode)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const optionsList = [
      { code: entry.prefCode, name: entry.prefName },
      ...wrongOptions,
    ].sort(() => Math.random() - 0.5)

    return {
      municipalityName: entry.name,
      reading: entry.reading,
      correctPrefCode: entry.prefCode,
      correctPrefName: entry.prefName,
      lat: entry.lat,
      lng: entry.lng,
      options: optionsList.map((o) => o.name),
      optionCodes: optionsList.map((o) => o.code),
    }
  })
}

export default function MunicipalityQuiz({
  prefectures,
  mode,
  questionCount,
  filterPrefecture,
  onComplete,
  onBack,
}: MunicipalityQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animState, setAnimState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    const q = generateQuestions(prefectures, questionCount, filterPrefecture, mode)
    setQuestions(q)
  }, [prefectures, questionCount, filterPrefecture, mode])

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctPrefCode
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleAnswer = useCallback(
    (code: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(code)
      setIsAnswered(true)
      const correct = code === currentQuestion.correctPrefCode
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
      const finalCorrect = correctCount + (selectedAnswer === currentQuestion?.correctPrefCode ? 0 : 0)
      recordMunicipalityQuiz(correctCount, questions.length, filterPrefecture)
      onComplete?.(correctCount, questions.length)
    }
  }, [currentIndex, questions.length, correctCount, selectedAnswer, currentQuestion, filterPrefecture, onComplete])

  const handleRetry = useCallback(() => {
    const q = generateQuestions(prefectures, questionCount, filterPrefecture, mode)
    setQuestions(q)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [prefectures, questionCount, filterPrefecture, mode])

  if (questions.length === 0) {
    return <div className="text-center py-12 text-slate-500 animate-fade-in">問題を生成中...</div>
  }

  // Result screen
  if (isComplete) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className={`text-6xl mb-4 animate-fade-in-scale ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">クイズ完了!</h2>
          <div className="bg-slate-50 rounded-xl p-6 mb-4">
            <div className="text-4xl font-bold text-primary animate-count-up">
              {correctCount} / {questions.length}
            </div>
            <div className="text-slate-600 mt-1">正解率: {percentage}%</div>
          </div>
          {percentage >= 80 ? (
            <p className="text-green-600 font-medium mb-4">素晴らしい!</p>
          ) : percentage >= 60 ? (
            <p className="text-yellow-600 font-medium mb-4">もう少し頑張りましょう!</p>
          ) : (
            <p className="text-red-600 font-medium mb-4">復習して再挑戦!</p>
          )}
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
    <div className="space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>問題 {currentIndex + 1} / {questions.length}</span>
        <span className="font-medium text-primary">正解: {correctCount}</span>
      </div>

      {/* Question */}
      <div className={`bg-white rounded-2xl shadow-sm p-5 ${animState === 'correct' ? 'animate-pulse-green' : animState === 'wrong' ? 'animate-shake' : ''}`}>
        <p className="text-sm text-slate-500 mb-1">
          {mode === 'map_click' ? '地図上で都道府県をタップ' : '正しい都道府県を選択'}
        </p>
        <h2 className="text-xl font-bold text-slate-800">
          {currentQuestion.municipalityName}
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">{currentQuestion.reading}</p>
      </div>

      {/* Map (for map_click mode or after answer) */}
      {(mode === 'map_click' || isAnswered) && (
        <div className="bg-white rounded-2xl shadow-sm p-4 animate-fade-in">
          <JapanMap
            interactive={mode === 'map_click' && !isAnswered}
            onPrefectureClick={mode === 'map_click' ? handleAnswer : undefined}
            correctPrefecture={isAnswered ? currentQuestion.correctPrefCode : undefined}
            wrongPrefecture={isAnswered && !isCorrect ? selectedAnswer || undefined : undefined}
            markers={
              isAnswered
                ? [{ lat: currentQuestion.lat, lng: currentQuestion.lng, label: currentQuestion.municipalityName }]
                : []
            }
            size="full"
          />
          {isAnswered && (
            <div className="mt-3 text-center">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isCorrect ? '正解!' : `不正解 → ${currentQuestion.correctPrefName}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Multiple choice options */}
      {mode === 'multiple_choice' && (
        <div className="space-y-2.5">
          {currentQuestion.options?.map((option, i) => {
            const code = currentQuestion.optionCodes?.[i] || ''
            const isThisCorrect = code === currentQuestion.correctPrefCode
            const isSelected = code === selectedAnswer

            let btnClass = 'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all active:scale-[0.98] '
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
                key={code}
                onClick={() => handleAnswer(code)}
                disabled={isAnswered}
                className={btnClass}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isAnswered && isThisCorrect ? 'bg-green-500 text-white' :
                    isAnswered && isSelected ? 'bg-red-500 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium text-slate-800">{option}</span>
                  {isAnswered && isThisCorrect && <span className="ml-auto text-green-500 text-xl">✓</span>}
                  {isAnswered && isSelected && !isThisCorrect && <span className="ml-auto text-red-500 text-xl">✗</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Map display for multiple choice after answer */}
      {mode === 'multiple_choice' && isAnswered && (
        <div className="bg-white rounded-2xl shadow-sm p-4 animate-fade-in">
          <p className="text-xs text-slate-500 mb-2 text-center">地図上の位置</p>
          <JapanMap
            correctPrefecture={currentQuestion.correctPrefCode}
            wrongPrefecture={!isCorrect ? selectedAnswer || undefined : undefined}
            markers={[{ lat: currentQuestion.lat, lng: currentQuestion.lng, label: currentQuestion.municipalityName }]}
            size="md"
          />
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform animate-fade-in"
        >
          {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
        </button>
      )}
    </div>
  )
}
