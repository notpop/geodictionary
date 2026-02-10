'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import JapanMap from '@/components/JapanMap'
import areaCodeData from '@/data/area-codes.json'
import type { AreaCode } from '@/lib/types'

const regions = ['全て', '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州']

export default function AreaCodesPage() {
  const [selected, setSelected] = useState<AreaCode | null>(null)
  const [filterRegion, setFilterRegion] = useState('全て')

  const areaCodes = areaCodeData.areaCodes as AreaCode[]

  const filtered = useMemo(() => {
    if (filterRegion === '全て') return areaCodes
    return areaCodes.filter((a) => a.region === filterRegion)
  }, [areaCodes, filterRegion])

  const highlightColors = useMemo(() => {
    if (!selected) return {}
    return { [selected.prefCode]: '#3b82f6' }
  }, [selected])

  // Build prefCode → area codes annotation for map labels
  const prefAnnotations = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const ac of areaCodes) {
      if (!map[ac.prefCode]) map[ac.prefCode] = []
      map[ac.prefCode].push(ac.code)
    }
    const result: Record<string, string> = {}
    for (const [code, codes] of Object.entries(map)) {
      result[code] = codes.slice(0, 2).join('/')
    }
    return result
  }, [areaCodes])

  return (
    <div className="animate-fade-in w-full max-w-full" style={{ overflowX: 'clip' }}>
      {/* Map - sticky */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden sticky z-30 mb-3"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <JapanMap
          prefectureColors={highlightColors}
          showLabels={true}
          prefectureAnnotations={prefAnnotations}
          size="full"
          zoomable={true}
        />
        {selected && (
          <div className="p-2.5 bg-blue-50">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-white font-mono font-bold px-3 py-1 rounded-lg text-lg tracking-wider">
                0{selected.code.startsWith('0') ? selected.code.slice(1) : selected.code}
              </span>
              <div>
                <div className="font-bold text-slate-800 text-sm">{selected.prefName} {selected.city}</div>
                <div className="text-xs text-slate-500">{selected.region}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      <Link href="/area-codes/quiz" className="block mb-3">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <h2 className="font-bold text-lg">市外局番クイズ</h2>
              <p className="text-blue-100 text-sm">市外局番から都道府県を当てよう</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Region filter */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRegion(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterRegion === r ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Area code list */}
      <div className="space-y-1.5">
        {filtered.map((ac) => (
          <button
            key={ac.code}
            className={`w-full text-left px-3 py-2.5 bg-white rounded-xl border transition-colors active:scale-[0.98] ${
              selected?.code === ac.code
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100'
            }`}
            onClick={() => setSelected(selected?.code === ac.code ? null : ac)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0 bg-slate-900 text-white font-mono font-bold px-2.5 py-0.5 rounded-lg text-sm tracking-wider">
                0{ac.code.startsWith('0') ? ac.code.slice(1) : ac.code}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800">{ac.city}</div>
              </div>
              <span className="flex-shrink-0 text-xs text-slate-400">{ac.prefName}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
