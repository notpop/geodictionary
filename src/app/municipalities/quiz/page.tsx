'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MunicipalityQuiz from '@/components/MunicipalityQuiz'
import municipalityData from '@/data/municipalities.json'
import { getMunicipalityProgress } from '@/lib/storage'
import type { MunicipalityProgress } from '@/lib/types'

type QuizMode = 'multiple_choice' | 'map_click'

function QuizPageInner() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'map' ? 'map_click' : null
  const initialPref = searchParams.get('pref') || null

  const [started, setStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<QuizMode>(initialMode || (initialPref ? 'map_click' : 'multiple_choice'))
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedPref, setSelectedPref] = useState<string | null>(initialPref)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [progress, setProgress] = useState<MunicipalityProgress | null>(null)

  useEffect(() => {
    setProgress(getMunicipalityProgress())
  }, [])

  // 範囲切替時に出題数が市区町村数を超えていたらリセット
  useEffect(() => {
    if (selectedPref) {
      const pref = prefectures.find((p) => p.code === selectedPref)
      if (pref) {
        const count = getEntryCount(pref)
        if (questionCount > count) {
          setQuestionCount(Math.min(10, count))
        }
      }
    } else if (selectedRegion) {
      const rPrefs = prefectures.filter((p) => p.region === selectedRegion)
      const rMax = rPrefs.reduce((s, p) => s + getEntryCount(p), 0)
      if (questionCount > rMax) {
        setQuestionCount(Math.min(20, rMax))
      }
    }
  }, [selectedPref, selectedRegion]) // eslint-disable-line react-hooks/exhaustive-deps

  const prefectures = municipalityData.prefectures

  // 政令指定都市の区を展開した実際のクイズ対象数を計算
  const getEntryCount = (pref: typeof prefectures[0]) => {
    let count = 0
    for (const m of pref.municipalities) {
      if (m.type === 'designated_city' && m.wards && m.wards.length > 0) {
        count += m.wards.length
      } else {
        count += 1
      }
    }
    return count
  }

  const regions = [
    { id: '北海道', label: '北海道' },
    { id: '東北', label: '東北' },
    { id: '関東', label: '関東' },
    { id: '中部', label: '中部' },
    { id: '近畿', label: '近畿' },
    { id: '中国', label: '中国' },
    { id: '四国', label: '四国' },
    { id: '九州', label: '九州' },
  ]

  // 選択中の範囲の市区町村数を計算（区展開済み）
  const selectedPrefData = selectedPref ? prefectures.find((p) => p.code === selectedPref) : null
  const regionPrefs = selectedRegion ? prefectures.filter((p) => p.region === selectedRegion) : null
  const maxMunis = selectedPrefData
    ? getEntryCount(selectedPrefData)
    : regionPrefs
    ? regionPrefs.reduce((sum, p) => sum + getEntryCount(p), 0)
    : prefectures.reduce((sum, p) => sum + getEntryCount(p), 0)

  // 出題数の選択肢を動的に生成
  const countOptions = [10, 20, 50].filter((n) => n <= maxMunis)
  const showAllOption = (selectedPref || selectedRegion) ? true : maxMunis > 50

  if (started) {
    return (
      <div className="-mx-4 -mt-6">
        <MunicipalityQuiz
          prefectures={prefectures as any}
          mode={quizMode}
          questionCount={questionCount}
          filterPrefecture={selectedPref || undefined}
          filterRegion={selectedRegion || undefined}
          isFullQuiz={questionCount === maxMunis}
          onComplete={() => {
            setProgress(getMunicipalityProgress())
          }}
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

      {/* Quiz Mode - hide when single prefecture selected (4択 makes no sense) */}
      {!selectedPref && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-1.5">モード</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setQuizMode('multiple_choice')}
              className={`p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
                quizMode === 'multiple_choice'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="font-medium text-slate-800 text-sm">4択</div>
            </button>
            <button
              onClick={() => setQuizMode('map_click')}
              className={`p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
                quizMode === 'map_click'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="font-medium text-slate-800 text-sm">地図タップ</div>
            </button>
          </div>
        </div>
      )}

      {/* Question Count */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">
          出題数
          {selectedPrefData ? (
            <span className="font-normal text-slate-400 ml-1 text-xs">（{selectedPrefData.name}: {maxMunis}件）</span>
          ) : selectedRegion ? (
            <span className="font-normal text-slate-400 ml-1 text-xs">（{selectedRegion}: {maxMunis}件）</span>
          ) : null}
        </h2>
        <div className="flex gap-2">
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                questionCount === n && questionCount !== maxMunis
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n}問
            </button>
          ))}
          {showAllOption && (
            <button
              onClick={() => setQuestionCount(maxMunis)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                questionCount === maxMunis
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              全て{selectedPref ? `(${maxMunis})` : ''}
            </button>
          )}
        </div>
      </div>

      {/* Scope */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1.5">範囲</h2>

        {/* 全国 + 地方 (2行で折返し) */}
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          <button
            onClick={() => { setSelectedPref(null); setSelectedRegion(null) }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
              !selectedPref && !selectedRegion
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            全国
          </button>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedRegion(r.id); setSelectedPref(null) }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                selectedRegion === r.id && !selectedPref
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 都道府県別 (全表示) */}
        <div className="grid grid-cols-6 gap-1 rounded-xl bg-slate-50 p-1.5">
          {prefectures.map((pref) => (
            <button
              key={pref.code}
              onClick={() => { setSelectedPref(pref.code); setSelectedRegion(null); setQuizMode('map_click') }}
              className={`px-0.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-[0.98] ${
                selectedPref === pref.code
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              {pref.name.replace(/[都府県]$/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => setStarted(true)}
        className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        開始
      </button>
    </div>
  )
}

export default function MunicipalityQuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">読み込み中...</div>}>
      <QuizPageInner />
    </Suspense>
  )
}
