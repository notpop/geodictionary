'use client'

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import PrefectureLeafletMap from './PrefectureLeafletMap'
import { useGeoJson } from '@/lib/useGeoJson'
import type { MunicipalityPrefecture } from '@/lib/types'

interface PrefectureDetailProps {
  prefecture: MunicipalityPrefecture
  prevPrefecture?: { name: string; nameEn: string } | null
  nextPrefecture?: { name: string; nameEn: string } | null
}

const typeLabels: Record<string, string> = {
  designated_city: '政令指定都市',
  city: '市',
  special_ward: '特別区',
  ward: '区',
  town: '町',
  village: '村',
}

const typeColors: Record<string, string> = {
  designated_city: 'bg-purple-100 text-purple-700',
  city: 'bg-blue-100 text-blue-700',
  special_ward: 'bg-amber-100 text-amber-700',
  ward: 'bg-orange-100 text-orange-700',
  town: 'bg-green-100 text-green-700',
  village: 'bg-emerald-100 text-emerald-700',
}

function getAllEntries(pref: MunicipalityPrefecture): { name: string; reading: string; type: string; lat: number; lng: number; parent?: string }[] {
  const entries: { name: string; reading: string; type: string; lat: number; lng: number; parent?: string }[] = []
  for (const m of pref.municipalities) {
    entries.push({ name: m.name, reading: m.reading, type: m.type, lat: m.lat, lng: m.lng })
    if (m.wards) {
      for (const w of m.wards) {
        entries.push({ name: w.name, reading: w.reading, type: 'ward', lat: w.lat, lng: w.lng, parent: m.name })
      }
    }
  }
  return entries
}

export default function PrefectureDetail({ prefecture, prevPrefecture, nextPrefecture }: PrefectureDetailProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [highlightedMuni, setHighlightedMuni] = useState<string | null>(null)
  const [showLabels, setShowLabels] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const { data: geoJson } = useGeoJson(prefecture.code)

  const allEntries = useMemo(() => getAllEntries(prefecture), [prefecture])

  const readingMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const e of allEntries) {
      map[e.name] = e.reading
    }
    return map
  }, [allEntries])

  // GeoJSONのcode → 親市名マッピング（同名区のラベルに「北区（堺市）」のように表示）
  const parentMap = useMemo(() => {
    if (!geoJson) return {}
    const map: Record<string, string> = {}
    for (const feat of geoJson.features) {
      const code = feat.properties?.code
      const parent = feat.properties?.parent
      if (code && parent) {
        map[code] = parent
      }
    }
    return map
  }, [geoJson])

  const filteredEntries = useMemo(() => {
    let entries = allEntries
    if (selectedType !== 'all') {
      entries = entries.filter((e) => e.type === selectedType)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      entries = entries.filter(
        (e) => e.name.includes(q) || e.reading.includes(q) || (e.parent && e.parent.includes(q))
      )
    }
    return entries
  }, [allEntries, selectedType, searchQuery])

  const markers = useMemo(() => {
    if (highlightedMuni) {
      const entry = allEntries.find((e) => e.name === highlightedMuni)
      if (entry) return [{ lat: entry.lat, lng: entry.lng, label: entry.name }]
    }
    return allEntries.map((e) => ({ lat: e.lat, lng: e.lng }))
  }, [allEntries, highlightedMuni])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of allEntries) {
      counts[e.type] = (counts[e.type] || 0) + 1
    }
    return counts
  }, [allEntries])

  return (
    <div className="animate-fade-in" style={{ marginTop: '-0.75rem' }}>
      {/* Navigation bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Link href="/municipalities" className="text-xs text-slate-500 bg-slate-100 active:bg-slate-200 px-2 py-1 rounded-full flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            一覧
          </Link>
          {prevPrefecture ? (
            <Link href={`/municipalities/${prevPrefecture.nameEn}`} scroll={true} onClick={() => window.scrollTo(0, 0)} className="text-slate-300 active:text-primary p-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
          ) : <div className="w-5" />}
          <h2 className="text-lg font-bold text-slate-800">{prefecture.name}</h2>
          {nextPrefecture ? (
            <Link href={`/municipalities/${nextPrefecture.nameEn}`} scroll={true} onClick={() => window.scrollTo(0, 0)} className="text-slate-300 active:text-primary p-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : <div className="w-5" />}
        </div>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="flex items-center gap-1.5 active:scale-[0.96] transition-transform"
        >
          <span className="text-xs text-slate-500">ラベル</span>
          <div className={`relative w-9 h-5 rounded-full transition-colors ${showLabels ? 'bg-primary' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showLabels ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Map - sticky, with expand button outside Leaflet's stacking context */}
      <div
        className="sticky z-30 mb-3"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="relative">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
            {geoJson ? (
              <PrefectureLeafletMap
                geojson={geoJson}
                interactive={false}
                highlightedName={highlightedMuni}
                showLabels={showLabels}
                readingMap={readingMap}
                parentMap={parentMap}
                className="h-44 rounded-xl overflow-hidden"
              />
            ) : (
              <div className="h-44 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm">地図を読み込み中...</span>
              </div>
            )}
          </div>
          {/* Expand button - outside Leaflet's stacking context */}
          {geoJson && (
            <button
              onClick={() => setMapExpanded(true)}
              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow active:scale-95 transition-transform"
              style={{ zIndex: 1 }}
              aria-label="地図を拡大"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded map overlay - rendered via Portal to escape transform containing block */}
      {mapExpanded && geoJson && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col" style={{ height: '100dvh' }}>
          {/* Dark control bar */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
          >
            <button
              onClick={() => setMapExpanded(false)}
              className="flex items-center gap-1 text-slate-300 active:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{prefecture.name}</span>
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center gap-2 active:opacity-70 transition-opacity"
            >
              <span className="text-xs text-slate-400">ラベル</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${showLabels ? 'bg-primary' : 'bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showLabels ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
          {/* Map fills remaining space */}
          <div className="flex-1 min-h-0">
            <PrefectureLeafletMap
              geojson={geoJson}
              interactive={false}
              highlightedName={highlightedMuni}
              showLabels={showLabels}
              readingMap={readingMap}
              parentMap={parentMap}
              className="w-full h-full"
            />
          </div>
        </div>,
        document.body
      )}

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setSelectedType('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedType === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          全て ({allEntries.length})
        </button>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === type ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {typeLabels[type] || type} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="市区町村を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          style={{ fontSize: '16px' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Municipality list */}
      <div className="space-y-1.5">
        {filteredEntries.map((entry, i) => (
          <button
            key={`${entry.name}-${i}`}
            className={`w-full text-left px-4 py-3 bg-white rounded-xl border transition-all active:scale-[0.98] ${
              highlightedMuni === entry.name
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100'
            }`}
            onClick={() => setHighlightedMuni(highlightedMuni === entry.name ? null : entry.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {entry.parent && (
                  <span className="text-xs text-slate-400">{entry.parent}</span>
                )}
                <span className="font-medium text-slate-800">{entry.name}</span>
                <span className="text-xs text-slate-400">{entry.reading}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[entry.type] || 'bg-slate-100 text-slate-600'}`}>
                {typeLabels[entry.type] || entry.type}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quiz CTA */}
      <div className="sticky bottom-4 pt-4">
        <Link
          href={`/municipalities/quiz?pref=${prefecture.code}&mode=map`}
          className="block w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform text-center"
        >
          {prefecture.name}をクイズする
        </Link>
      </div>
    </div>
  )
}
