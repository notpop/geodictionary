'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import JapanMap from '@/components/JapanMap'
import riverData from '@/data/rivers.json'
import roadData from '@/data/roads.json'
import type { River } from '@/lib/types'

type SortKey = 'length' | 'basinArea' | 'name'

export default function RiversPage() {
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('length')
  const [searchQuery, setSearchQuery] = useState('')

  const rivers = riverData.rivers as River[]
  const prefectureNames = roadData.prefectureNames as Record<string, string>

  const sortedRivers = useMemo(() => {
    let result = [...rivers]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) => r.name.includes(q) || r.reading.includes(q) || r.system.includes(q)
      )
    }
    if (sortBy === 'length') {
      result.sort((a, b) => b.length - a.length)
    } else if (sortBy === 'basinArea') {
      result.sort((a, b) => b.basinArea - a.basinArea)
    }
    return result
  }, [rivers, sortBy, searchQuery])

  const highlightColors = useMemo(() => {
    if (!selectedRiver) return {}
    const colors: Record<string, string> = {}
    for (const code of selectedRiver.prefectures) {
      colors[code] = '#3b82f6'
    }
    return colors
  }, [selectedRiver])

  return (
    <div className="animate-fade-in w-full max-w-full" style={{ overflowX: 'clip' }}>
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">川マスター</h1>
        <p className="text-sm text-slate-500">主要河川{rivers.length}本を地図で覚える</p>
      </div>

      {/* Map - sticky */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden sticky z-30 mb-3"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <JapanMap
          prefectureColors={highlightColors}
          showLabels={!!selectedRiver}
          size="full"
          zoomable={true}
        />
        {selectedRiver && (
          <div className="p-2.5 bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{selectedRiver.name}</span>
              <span className="text-xs text-slate-400">{selectedRiver.reading}</span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {selectedRiver.source} → {selectedRiver.mouth} ({selectedRiver.length}km)
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{selectedRiver.tips}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedRiver.prefectures.map((code) => (
                <span key={code} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {prefectureNames[code]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      <Link href="/rivers/quiz" className="block mb-3">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="font-bold text-lg">河川クイズ</h2>
              <p className="text-cyan-100 text-sm">河川名から都道府県を当てよう</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Sort */}
      <div className="flex gap-1.5 mb-3">
        {([['length', '長さ順'], ['basinArea', '流域面積順'], ['name', '名前順']] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sortBy === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="河川名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          style={{ fontSize: '16px' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* River list */}
      <div className="space-y-1.5">
        {sortedRivers.map((river) => (
          <button
            key={river.name}
            className={`w-full text-left px-3 py-2.5 bg-white rounded-xl border transition-colors active:scale-[0.98] ${
              selectedRiver?.name === river.name
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100'
            }`}
            onClick={() => setSelectedRiver(selectedRiver?.name === river.name ? null : river)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800 text-sm">{river.name}</span>
                <span className="text-xs text-slate-400">{river.reading}</span>
              </div>
              <span className="text-xs text-slate-500">{river.length}km</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
