'use client'

import { useEffect } from 'react'
import PrefectureDetail from '@/components/PrefectureDetail'
import type { MunicipalityPrefecture } from '@/lib/types'

interface Props {
  prefecture: MunicipalityPrefecture
  prevPrefecture: { name: string; nameEn: string } | null
  nextPrefecture: { name: string; nameEn: string } | null
}

export default function PrefectureMunicipalityPage({ prefecture, prevPrefecture, nextPrefecture }: Props) {
  // 遷移時にページトップへスクロール
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [prefecture.code])

  return (
    <div>
      <PrefectureDetail
        prefecture={prefecture}
        prevPrefecture={prevPrefecture}
        nextPrefecture={nextPrefecture}
      />
    </div>
  )
}
