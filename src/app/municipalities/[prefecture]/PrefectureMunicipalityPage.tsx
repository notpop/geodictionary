'use client'

import { useState } from 'react'
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
    <div>
      <PrefectureDetail
        prefecture={prefecture}
        onStartQuiz={() => setMode('quiz_map')}
        prevPrefecture={prevPrefecture}
        nextPrefecture={nextPrefecture}
      />
    </div>
  )
}
