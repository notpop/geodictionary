'use client'

import { useState } from 'react'
import Link from 'next/link'
import TipCard from '@/components/TipCard'
import SearchBar from '@/components/SearchBar'
import type { Region, Tip, Prefecture } from '@/lib/types'

const regionEmojis: { [key: string]: string } = {
  hokkaido: '🏔️',
  tohoku: '🌾',
  kanto: '🏙️',
  chubu: '🗻',
  hokuriku: '❄️',
  kinki: '⛩️',
  chugoku: '🏠',
  shikoku: '🍊',
  kyushu: '🌴',
  okinawa: '🏝️',
}

interface RegionContentProps {
  region: Region
}

export default function RegionContent({ region }: RegionContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)

  // Get all tips from all prefectures
  const allTips: Tip[] = region.prefectures?.flatMap((pref) => pref.tips || []) || []

  // Filter tips by search query and selected prefecture
  const filteredTips = allTips.filter((tip) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      tip.title.toLowerCase().includes(query) ||
      tip.description.toLowerCase().includes(query) ||
      tip.tags?.some((tag) => tag.toLowerCase().includes(query))

    if (!selectedPrefecture) return matchesSearch

    // Find if this tip belongs to selected prefecture
    const prefectureOfTip = region.prefectures?.find((pref) =>
      pref.tips?.some((t) => t.id === tip.id)
    )
    return matchesSearch && prefectureOfTip?.id === selectedPrefecture
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/regions" className="hover:text-primary">
          地域別Tips
        </Link>
        <span>/</span>
        <span className="text-slate-700">{region.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-4xl">{regionEmojis[region.id] || '📍'}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {region.name}
          </h1>
          <p className="text-slate-600">{region.description}</p>
        </div>
      </div>

      {region.prefectures && region.prefectures.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">都道府県でフィルター</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPrefecture(null)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                selectedPrefecture === null
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary'
              }`}
            >
              すべて ({allTips.length})
            </button>
            {region.prefectures.map((pref) => (
              <button
                key={pref.id}
                onClick={() => setSelectedPrefecture(pref.id)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  selectedPrefecture === pref.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary'
                }`}
              >
                {pref.name} ({pref.tips?.length || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      <SearchBar onSearch={setSearchQuery} />

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>{filteredTips.length} Tips</span>
        {searchQuery && (
          <span className="bg-slate-100 px-2 py-0.5 rounded">
            「{searchQuery}」で検索中
          </span>
        )}
      </div>

      <div className="space-y-4">
        {filteredTips.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>該当するTipsが見つかりませんでした</p>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200">
        <Link
          href="/regions"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          他の地域を見る
        </Link>
      </div>
    </div>
  )
}
