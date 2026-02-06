'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrefectureDetail from '@/components/PrefectureDetail'
import MunicipalityQuiz from '@/components/MunicipalityQuiz'
import municipalityData from '@/data/municipalities.json'
import type { MunicipalityPrefecture } from '@/lib/types'

interface Props {
  prefecture: MunicipalityPrefecture
  prevPrefecture: { name: string; nameEn: string } | null
  nextPrefecture: { name: string; nameEn: string } | null
}

export default function PrefectureMunicipalityPage({ prefecture, prevPrefecture, nextPrefecture }: Props) {
  const [mode, setMode] = useState<'learn' | 'quiz_mc' | 'quiz_map'>('learn')

  if (mode === 'quiz_mc' || mode === 'quiz_map') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode('learn')}
          className="text-sm text-slate-500 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {prefecture.name}に戻る
        </button>
        <MunicipalityQuiz
          prefectures={municipalityData.prefectures as any}
          mode={mode === 'quiz_mc' ? 'multiple_choice' : 'map_click'}
          questionCount={10}
          filterPrefecture={prefecture.code}
          onBack={() => setMode('learn')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/municipalities" className="hover:text-primary">市区町村</Link>
        <span>/</span>
        <span className="text-slate-700">{prefecture.name}</span>
      </div>

      <PrefectureDetail
        prefecture={prefecture}
        onStartQuiz={() => setMode('quiz_mc')}
      />

      {/* Quiz mode buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode('quiz_mc')}
          className="p-4 bg-primary text-white rounded-xl font-medium active:scale-[0.98] transition-transform"
        >
          4択クイズ
        </button>
        <button
          onClick={() => setMode('quiz_map')}
          className="p-4 bg-emerald-500 text-white rounded-xl font-medium active:scale-[0.98] transition-transform"
        >
          地図クイズ
        </button>
      </div>

      {/* Prev/Next navigation */}
      <div className="flex gap-3">
        {prevPrefecture ? (
          <Link
            href={`/municipalities/${prevPrefecture.nameEn}`}
            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-center active:scale-[0.98] transition-transform"
          >
            <span className="text-xs text-slate-500">前</span>
            <div className="font-medium text-slate-800 text-sm">{prevPrefecture.name}</div>
          </Link>
        ) : <div className="flex-1" />}
        {nextPrefecture ? (
          <Link
            href={`/municipalities/${nextPrefecture.nameEn}`}
            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-center active:scale-[0.98] transition-transform"
          >
            <span className="text-xs text-slate-500">次</span>
            <div className="font-medium text-slate-800 text-sm">{nextPrefecture.name}</div>
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}
