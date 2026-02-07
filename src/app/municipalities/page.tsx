'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import JapanMap from '@/components/JapanMap'
import municipalityData from '@/data/municipalities.json'
import { getMunicipalityProgress, getPrefectureAccuracy } from '@/lib/storage'
import type { MunicipalityProgress } from '@/lib/types'

export default function MunicipalitiesPage() {
  const [progress, setProgress] = useState<MunicipalityProgress | null>(null)

  useEffect(() => {
    setProgress(getMunicipalityProgress())
  }, [])

  const prefectures = municipalityData.prefectures

  const totalMunicipalities = useMemo(() => {
    let count = 0
    for (const pref of prefectures) {
      for (const m of pref.municipalities) {
        count++
        if (m.wards) count += m.wards.length
      }
    }
    return count
  }, [prefectures])

  const prefectureColors = useMemo(() => {
    if (!progress) return {}
    const colors: Record<string, string> = {}
    for (const pref of prefectures) {
      const acc = getPrefectureAccuracy(progress, pref.code)
      if (acc >= 80) {
        colors[pref.code] = '#86efac' // green-300
      } else if (acc >= 60) {
        colors[pref.code] = '#fde68a' // yellow-200
      } else if (progress.prefectureScores[pref.code]) {
        colors[pref.code] = '#fecaca' // red-200
      }
    }
    return colors
  }, [progress, prefectures])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">市区町村マスター</h1>
        <p className="text-sm text-slate-500">全{totalMunicipalities.toLocaleString()}市区町村を地図で覚える</p>
      </div>

      {/* Stats */}
      {progress && progress.quizzesTaken > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{progress.masteredPrefectures.length}</div>
              <div className="text-xs text-slate-500">修得県</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {progress.quizzesTaken > 0 ? Math.round((progress.correctAnswers / progress.quizzesTaken) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500">正解率</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{progress.quizzesTaken}</div>
              <div className="text-xs text-slate-500">解答数</div>
            </div>
          </div>
        </div>
      )}

      {/* Japan map */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs text-slate-500 text-center mb-2">都道府県をタップして学習</p>
        <JapanMap
          interactive={true}
          zoomable={true}
          onPrefectureClick={(code) => {
            const pref = prefectures.find((p) => p.code === code)
            if (pref) {
              window.location.href = `/municipalities/${pref.nameEn}`
            }
          }}
          prefectureColors={prefectureColors}
          size="full"
          showLabels={true}
        />
        <div className="flex justify-center gap-3 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-300 inline-block" />
            <span>修得</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-200 inline-block" />
            <span>学習中</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-200 inline-block" />
            <span>要復習</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
            <span>未学習</span>
          </div>
        </div>
      </div>

      {/* Quiz CTAs */}
      <div className="grid gap-3">
        <Link href="/municipalities/quiz" className="block">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-5 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h2 className="font-bold text-lg">全国チャレンジ</h2>
                <p className="text-blue-100 text-sm">全市区町村からランダム出題</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/municipalities/quiz?mode=map" className="block">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-5 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              <div>
                <h2 className="font-bold text-lg">地図クリックモード</h2>
                <p className="text-emerald-100 text-sm">地図をタップして回答</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Prefecture list */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">都道府県別に学習</h2>
        <div className="grid grid-cols-2 gap-2">
          {prefectures.map((pref) => {
            const muniCount = pref.municipalities.reduce(
              (acc, m) => acc + 1 + (m.wards?.length || 0),
              0
            )
            const acc = progress ? getPrefectureAccuracy(progress, pref.code) : 0
            const isMastered = progress?.masteredPrefectures.includes(pref.code)

            return (
              <Link
                key={pref.code}
                href={`/municipalities/${pref.nameEn}`}
                scroll={true}
                onClick={() => window.scrollTo(0, 0)}
                className={`block p-3 rounded-xl border transition-all active:scale-[0.98] ${
                  isMastered ? 'border-green-300 bg-green-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-sm">{pref.name}</span>
                  {isMastered && <span className="text-green-500 text-xs">✓</span>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{muniCount}件</div>
                {acc > 0 && (
                  <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${acc >= 80 ? 'bg-green-400' : acc >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
