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
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">川マスター</h1>
        <p className="text-sm text-slate-500">主要河川{rivers.length}本を地図で覚える</p>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm p-3">
        <JapanMap
          prefectureColors={highlightColors}
          showLabels={!!selectedRiver}
          size="full"
          zoomable={true}
        />
        {selectedRiver && (
          <div className="mt-2 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{selectedRiver.name}</span>
              <span className="text-xs text-slate-400">{selectedRiver.reading}</span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {selectedRiver.source} → {selectedRiver.mouth}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-slate-500">
              <span>延長: {selectedRiver.length}km</span>
              <span>流域: {selectedRiver.basinArea.toLocaleString()}km²</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{selectedRiver.tips}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedRiver.prefectures.map((code) => (
                <span key={code} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {prefectureNames[code]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      <Link href="/rivers/quiz" className="block">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="font-bold text-lg">川クイズ</h2>
              <p className="text-blue-100 text-sm">河川名から都道府県を当てよう</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Sort */}
      <div className="flex gap-1.5">
        {([['length', '長さ順'], ['basinArea', '流域面積順'], ['name', '名前順']] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sortBy === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
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
            className={`w-full text-left px-4 py-3 bg-white rounded-xl border transition-all active:scale-[0.98] ${
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
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{river.length}km</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {river.system}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
