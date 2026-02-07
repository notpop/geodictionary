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
  const [mode, setMode] = useState<'learn' | 'quiz_map'>('learn')

  if (mode === 'quiz_map') {
    return (
      <div className="-mx-4 -mt-6">
        <MunicipalityQuiz
          prefectures={municipalityData.prefectures as any}
          mode="map_click"
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
        onStartQuiz={() => setMode('quiz_map')}
      />

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
