import { notFound } from 'next/navigation'
import PrefectureMunicipalityPage from './PrefectureMunicipalityPage'
import municipalityData from '@/data/municipalities.json'

export function generateStaticParams() {
  return municipalityData.prefectures.map((pref) => ({
    prefecture: pref.nameEn,
  }))
}

export default async function Page({ params }: { params: Promise<{ prefecture: string }> }) {
  const { prefecture: prefSlug } = await params
  const prefecture = municipalityData.prefectures.find((p) => p.nameEn === prefSlug)

  if (!prefecture) {
    notFound()
  }

  const prefIndex = municipalityData.prefectures.findIndex((p) => p.nameEn === prefSlug)
  const prevPref = prefIndex > 0 ? municipalityData.prefectures[prefIndex - 1] : null
  const nextPref = prefIndex < municipalityData.prefectures.length - 1 ? municipalityData.prefectures[prefIndex + 1] : null

  return (
    <PrefectureMunicipalityPage
      prefecture={prefecture as any}
      prevPrefecture={prevPref ? { name: prevPref.name, nameEn: prevPref.nameEn } : null}
      nextPrefecture={nextPref ? { name: nextPref.name, nameEn: nextPref.nameEn } : null}
    />
  )
}
