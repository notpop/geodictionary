'use client'

import { useState, useMemo } from 'react'
import PrefectureLeafletMap from './PrefectureLeafletMap'
import { useGeoJson } from '@/lib/useGeoJson'
import type { MunicipalityPrefecture } from '@/lib/types'

interface PrefectureDetailProps {
  prefecture: MunicipalityPrefecture
  onStartQuiz?: () => void
}

const typeLabels: Record<string, string> = {
  designated_city: '政令指定都市',
  city: '市',
  special_ward: '特別区',
  town: '町',
  village: '村',
}

const typeColors: Record<string, string> = {
  designated_city: 'bg-purple-100 text-purple-700',
  city: 'bg-blue-100 text-blue-700',
  special_ward: 'bg-amber-100 text-amber-700',
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

export default function PrefectureDetail({ prefecture, onStartQuiz }: PrefectureDetailProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [highlightedMuni, setHighlightedMuni] = useState<string | null>(null)
  const { data: geoJson } = useGeoJson(prefecture.code)

  const allEntries = useMemo(() => getAllEntries(prefecture), [prefecture])

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
    <div className="space-y-4 animate-fade-in">
      {/* Header with map */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-800">{prefecture.name}</h2>
            <span className="text-sm text-slate-500">{allEntries.length}件</span>
          </div>
          {geoJson ? (
            <PrefectureLeafletMap
              geojson={geoJson}
              interactive={false}
              highlightedName={highlightedMuni}
              className="h-48"
            />
          ) : (
            <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-slate-400 text-sm">地図を読み込み中...</span>
            </div>
          )}
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
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
      <div className="relative">
        <input
          type="text"
          placeholder="市区町村を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
      {onStartQuiz && (
        <div className="sticky bottom-4 pt-2">
          <button
            onClick={onStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
          >
            {prefecture.name}をクイズする
          </button>
        </div>
      )}
    </div>
  )
}
