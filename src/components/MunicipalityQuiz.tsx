'use client'

import { useState, useEffect, useCallback } from 'react'
import JapanMap from './JapanMap'
import PrefectureLeafletMap from './PrefectureLeafletMap'
import { useGeoJson } from '@/lib/useGeoJson'
import { recordMunicipalityQuiz } from '@/lib/storage'
import type { MunicipalityPrefecture } from '@/lib/types'

interface QuizQuestion {
  municipalityName: string
  reading: string
  correctPrefCode: string
  correctPrefName: string
  correctMuniName: string // for intra-pref: same as municipalityName
  lat: number
  lng: number
  options: string[]
  optionCodes: string[]
  isIntraPref: boolean
}

interface MunicipalityQuizProps {
  prefectures: MunicipalityPrefecture[]
  mode: 'multiple_choice' | 'map_click'
  questionCount: number
  filterPrefecture?: string
  filterRegion?: string
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

type Entry = {
  name: string
  reading: string
  prefCode: string
  prefName: string
  lat: number
  lng: number
}

function collectEntries(prefs: MunicipalityPrefecture[], filterPref?: string): Entry[] {
  const target = filterPref ? prefs.filter((p) => p.code === filterPref) : prefs
  const entries: Entry[] = []
  for (const pref of target) {
    for (const m of pref.municipalities) {
      entries.push({
        name: m.name,
        reading: m.reading,
        prefCode: pref.code,
        prefName: pref.name,
        lat: m.lat,
        lng: m.lng,
      })
    }
  }
  return entries
}

function generateNationalQuestions(
  prefectures: MunicipalityPrefecture[],
  count: number,
  filterRegion?: string
): QuizQuestion[] {
  const targetPrefs = filterRegion
    ? prefectures.filter((p) => p.region === filterRegion)
    : prefectures
  const entries = collectEntries(targetPrefs)
  const picked = shuffle(entries).slice(0, count)
  // Options come from the same scope (region or all)
  const allPrefs = targetPrefs.map((p) => ({ code: p.code, name: p.name }))

  return picked.map((entry) => {
    const wrong = shuffle(allPrefs.filter((p) => p.code !== entry.prefCode)).slice(0, 3)
    const opts = shuffle([{ code: entry.prefCode, name: entry.prefName }, ...wrong])
    return {
      municipalityName: entry.name,
      reading: entry.reading,
      correctPrefCode: entry.prefCode,
      correctPrefName: entry.prefName,
      correctMuniName: entry.name,
      lat: entry.lat,
      lng: entry.lng,
      options: opts.map((o) => o.name),
      optionCodes: opts.map((o) => o.code),
      isIntraPref: false,
    }
  })
}

function generateIntraPrefQuestions(
  prefectures: MunicipalityPrefecture[],
  count: number,
  prefCode: string
): QuizQuestion[] {
  const pref = prefectures.find((p) => p.code === prefCode)
  if (!pref) return []

  const munis = pref.municipalities.map((m) => ({
    name: m.name,
    reading: m.reading,
    lat: m.lat,
    lng: m.lng,
  }))

  const picked = shuffle(munis).slice(0, count)

  return picked.map((entry) => {
    const wrong = shuffle(munis.filter((m) => m.name !== entry.name)).slice(0, 3)
    const opts = shuffle([entry, ...wrong])
    return {
      municipalityName: entry.name,
      reading: entry.reading,
      correctPrefCode: prefCode,
      correctPrefName: pref.name,
      correctMuniName: entry.name,
      lat: entry.lat,
      lng: entry.lng,
      options: opts.map((o) => o.name),
      optionCodes: opts.map((o) => o.name), // use name as identifier for intra-pref
      isIntraPref: true,
    }
  })
}

export default function MunicipalityQuiz({
  prefectures,
  mode,
  questionCount,
  filterPrefecture,
  filterRegion,
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

  const isIntraPref = !!filterPrefecture
  const { data: geoJson } = useGeoJson(isIntraPref ? filterPrefecture : null)

  useEffect(() => {
    const q = isIntraPref
      ? generateIntraPrefQuestions(prefectures, questionCount, filterPrefecture!)
      : generateNationalQuestions(prefectures, questionCount, filterRegion)
    setQuestions(q)
  }, [prefectures, questionCount, filterPrefecture, filterRegion, isIntraPref])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const correctId = currentQuestion
    ? isIntraPref
      ? currentQuestion.correctMuniName
      : currentQuestion.correctPrefCode
    : ''
  const isCorrect = selectedAnswer === correctId

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(answer)
      setIsAnswered(true)
      const cId = isIntraPref ? currentQuestion.correctMuniName : currentQuestion.correctPrefCode
      const correct = answer === cId
      if (correct) {
        setCorrectCount((prev) => prev + 1)
        setAnimState('correct')
      } else {
        setAnimState('wrong')
      }
      setTimeout(() => setAnimState('idle'), 600)
    },
    [isAnswered, currentQuestion, isIntraPref]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setAnimState('idle')
    } else {
      setIsComplete(true)
      recordMunicipalityQuiz(correctCount, questions.length, filterPrefecture)
      onComplete?.(correctCount, questions.length)
    }
  }, [currentIndex, questions.length, correctCount, filterPrefecture, onComplete])

  const handleRetry = useCallback(() => {
    const q = isIntraPref
      ? generateIntraPrefQuestions(prefectures, questionCount, filterPrefecture!)
      : generateNationalQuestions(prefectures, questionCount, filterRegion)
    setQuestions(q)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    setAnimState('idle')
  }, [prefectures, questionCount, filterPrefecture, filterRegion, isIntraPref])

  if (questions.length === 0) {
    return <div className="text-center py-12 text-slate-500">問題を生成中...</div>
  }

  // Result screen
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

  // Quiz screen - compact layout for 100dvh
  return (
    <div className="flex flex-col relative" style={{ height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}>
      {/* Header row with quit button */}
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
          {isIntraPref
            ? `「${currentQuestion.municipalityName}」は${currentQuestion.correctPrefName}のどこ？`
            : `「${currentQuestion.municipalityName}」はどの都道府県？`}
        </h2>
        <p className="text-xs text-slate-400 text-center mt-0.5">{currentQuestion.reading}</p>
      </div>

      {/* Main content area - flex-1 fills remaining space */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 py-1">
        {/* Map click mode: show Leaflet map for intra-pref, JapanMap for national */}
        {mode === 'map_click' && (
          <div className="flex-1 min-h-0">
            {isIntraPref && geoJson ? (
              <PrefectureLeafletMap
                geojson={geoJson}
                interactive={!isAnswered}
                onFeatureClick={!isAnswered ? handleAnswer : undefined}
                highlightedName={isAnswered ? currentQuestion.correctMuniName : null}
                wrongName={isAnswered && !isCorrect ? selectedAnswer : null}
                className="h-full"
              />
            ) : (
              <JapanMap
                interactive={!isAnswered}
                onPrefectureClick={!isAnswered ? handleAnswer : undefined}
                correctPrefecture={isAnswered ? currentQuestion.correctPrefCode : undefined}
                wrongPrefecture={isAnswered && !isCorrect ? (selectedAnswer || undefined) : undefined}
                markers={
                  isAnswered
                    ? [{ lat: currentQuestion.lat, lng: currentQuestion.lng, label: currentQuestion.municipalityName }]
                    : []
                }
                size="full"
              />
            )}
          </div>
        )}

        {/* Multiple choice options */}
        {mode === 'multiple_choice' && (
          <>
            <div className="space-y-2 flex-shrink-0">
              {currentQuestion.options.map((option, i) => {
                const code = currentQuestion.optionCodes[i]
                const isThisCorrect = code === correctId
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

            {/* Show map after answering in multiple choice mode */}
            {isAnswered && (
              <div className="flex-1 min-h-0 animate-fade-in">
                {isIntraPref && geoJson ? (
                  <PrefectureLeafletMap
                    geojson={geoJson}
                    interactive={false}
                    highlightedName={currentQuestion.correctMuniName}
                    wrongName={!isCorrect ? selectedAnswer : null}
                    className="h-full"
                  />
                ) : (
                  <JapanMap
                    correctPrefecture={currentQuestion.correctPrefCode}
                    wrongPrefecture={!isCorrect ? (selectedAnswer || undefined) : undefined}
                    markers={[{ lat: currentQuestion.lat, lng: currentQuestion.lng, label: currentQuestion.municipalityName }]}
                    size="full"
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Answer feedback for map click */}
        {mode === 'map_click' && isAnswered && (
          <div className="text-center flex-shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCorrect ? '正解!' : `不正解 → ${isIntraPref ? currentQuestion.correctMuniName : currentQuestion.correctPrefName}`}
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
