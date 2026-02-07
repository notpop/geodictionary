'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import JapanMap from '@/components/JapanMap'
import roadData from '@/data/roads.json'
import type { Road } from '@/lib/types'

const categories = ['全て', '主要幹線', '一般国道', '補助国道']

function shortName(s: string) {
  return s.replace(/（.*?）/g, '')
}

export default function RoadsPage() {
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null)
  const [filterCategory, setFilterCategory] = useState('全て')
  const [searchQuery, setSearchQuery] = useState('')

  const roads = roadData.roads as Road[]
  const prefectureNames = roadData.prefectureNames as Record<string, string>

  const filteredRoads = useMemo(() => {
    let result = roads
    if (filterCategory !== '全て') {
      result = result.filter((r) => r.category === filterCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.includes(q) ||
          r.startPoint.includes(q) ||
          r.endPoint.includes(q) ||
          String(r.number).includes(q)
      )
    }
    return result
  }, [roads, filterCategory, searchQuery])

  const highlightColors = useMemo(() => {
    if (!selectedRoad) return {}
    const colors: Record<string, string> = {}
    for (const code of selectedRoad.prefectures) {
      colors[code] = '#3b82f6'
    }
    return colors
  }, [selectedRoad])

  return (
    <div className="animate-fade-in w-full max-w-full" style={{ overflowX: 'clip' }}>
      {/* Map - sticky */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden sticky z-30 mb-3"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <JapanMap
          prefectureColors={highlightColors}
          showLabels={!!selectedRoad}
          size="full"
          zoomable={true}
        />
        {selectedRoad && (
          <div className="p-2.5 bg-blue-50">
            <div className="font-bold text-slate-800 text-sm">{selectedRoad.name}</div>
            <div className="text-xs text-slate-600 mt-0.5">
              {selectedRoad.startPoint} → {selectedRoad.endPoint} ({selectedRoad.length}km)
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{selectedRoad.tips}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedRoad.prefectures.map((code) => (
                <span key={code} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {prefectureNames[code]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      <Link href="/roads/quiz" className="block mb-3">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="font-bold text-lg">国道クイズ</h2>
              <p className="text-blue-100 text-sm">国道番号から都道府県を当てよう</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Filter */}
      <div className="flex gap-1.5 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCategory === cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="国道番号や地名で検索..."
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

      {/* Road list */}
      <div className="space-y-1.5">
        {filteredRoads.map((road) => (
          <button
            key={road.number}
            className={`w-full text-left px-3 py-2.5 bg-white rounded-xl border transition-colors active:scale-[0.98] ${
              selectedRoad?.number === road.number
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100'
            }`}
            onClick={() => setSelectedRoad(selectedRoad?.number === road.number ? null : road)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`flex-shrink-0 w-8 text-center text-xs font-bold py-0.5 rounded ${
                road.category === '主要幹線' ? 'bg-purple-100 text-purple-700' :
                road.category === '一般国道' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {road.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800 truncate">
                  {shortName(road.startPoint)} → {shortName(road.endPoint)}
                </div>
              </div>
              <span className="flex-shrink-0 text-xs text-slate-400">{road.length}km</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
