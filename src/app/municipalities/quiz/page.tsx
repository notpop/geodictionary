'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MunicipalityQuiz from '@/components/MunicipalityQuiz'
import municipalityData from '@/data/municipalities.json'
import { getMunicipalityProgress, getMunicipalityAccuracy } from '@/lib/storage'
import type { MunicipalityProgress } from '@/lib/types'

type QuizMode = 'multiple_choice' | 'map_click'

function QuizPageInner() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'map' ? 'map_click' : null
  const initialPref = searchParams.get('pref') || null

  const [started, setStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<QuizMode>(initialMode || 'multiple_choice')
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
      if (pref && questionCount > pref.municipalities.length) {
        setQuestionCount(Math.min(10, pref.municipalities.length))
      }
    } else if (selectedRegion) {
      const rPrefs = prefectures.filter((p) => p.region === selectedRegion)
      const rMax = rPrefs.reduce((s, p) => s + p.municipalities.length, 0)
      if (questionCount > rMax) {
        setQuestionCount(Math.min(20, rMax))
      }
    }
  }, [selectedPref, selectedRegion]) // eslint-disable-line react-hooks/exhaustive-deps

  const prefectures = municipalityData.prefectures

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

  // 選択中の範囲の市区町村数を計算
  const selectedPrefData = selectedPref ? prefectures.find((p) => p.code === selectedPref) : null
  const regionPrefs = selectedRegion ? prefectures.filter((p) => p.region === selectedRegion) : null
  const maxMunis = selectedPrefData
    ? selectedPrefData.municipalities.length
    : regionPrefs
    ? regionPrefs.reduce((sum, p) => sum + p.municipalities.length, 0)
    : 1900

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
          onComplete={() => {
            setProgress(getMunicipalityProgress())
          }}
          onBack={() => setStarted(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">市区町村クイズ</h1>
        <p className="text-sm text-slate-500">モードと出題数を選んで開始</p>
      </div>

      {/* Stats */}
      {progress && progress.quizzesTaken > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{progress.quizzesTaken}</div>
              <div className="text-xs text-slate-500">解答数</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{getMunicipalityAccuracy(progress)}%</div>
              <div className="text-xs text-slate-500">正解率</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{progress.masteredPrefectures.length}/47</div>
              <div className="text-xs text-slate-500">修得県</div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">クイズモード</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setQuizMode('multiple_choice')}
            className={`p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
              quizMode === 'multiple_choice'
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="text-2xl mb-1">✋</div>
            <div className="font-medium text-slate-800 text-sm">4択モード</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {selectedPref ? '県内の市区町村から4択' : '4つの都道府県名から選択'}
            </div>
          </button>
          <button
            onClick={() => setQuizMode('map_click')}
            className={`p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
              quizMode === 'map_click'
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="text-2xl mb-1">🗺️</div>
            <div className="font-medium text-slate-800 text-sm">地図タップ</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {selectedPref ? '県内地図から市区町村を選択' : '地図上で都道府県を選択'}
            </div>
          </button>
        </div>
      </div>

      {/* Question Count */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          出題数
          {selectedPrefData ? (
            <span className="font-normal text-slate-400 ml-2">（{selectedPrefData.name}: {maxMunis}件）</span>
          ) : selectedRegion ? (
            <span className="font-normal text-slate-400 ml-2">（{selectedRegion}: {maxMunis}件）</span>
          ) : null}
        </h2>
        <div className="flex gap-2">
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all active:scale-[0.98] ${
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
              className={`flex-1 py-3 rounded-xl font-medium transition-all active:scale-[0.98] ${
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
        <h2 className="text-sm font-semibold text-slate-700 mb-2">出題範囲</h2>

        {/* 全国 */}
        <button
          onClick={() => { setSelectedPref(null); setSelectedRegion(null) }}
          className={`w-full p-3 rounded-xl border-2 mb-2 text-left transition-all active:scale-[0.98] ${
            !selectedPref && !selectedRegion ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="font-medium text-slate-800">全国</div>
          <div className="text-xs text-slate-500">全都道府県からランダム</div>
        </button>

        {/* 地方別 */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 mb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedRegion(r.id); setSelectedPref(null) }}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                selectedRegion === r.id && !selectedPref
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 都道府県別 */}
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-2">
          {prefectures.map((pref) => (
            <button
              key={pref.code}
              onClick={() => { setSelectedPref(pref.code); setSelectedRegion(null) }}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                selectedPref === pref.code
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              {pref.name}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => setStarted(true)}
        className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        クイズ開始
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
