'use client'

import { useState } from 'react'
import TipCard from '@/components/TipCard'
import SearchBar from '@/components/SearchBar'
import commonTips from '@/data/common-tips.json'
import type { Tip } from '@/lib/types'

const tips = commonTips.tips as Tip[]

export default function CommonPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTips = tips.filter((tip) => {
    const query = searchQuery.toLowerCase()
    return (
      tip.title.toLowerCase().includes(query) ||
      tip.description.toLowerCase().includes(query) ||
      tip.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          共通知識
        </h1>
        <p className="text-slate-600">
          {commonTips.description}
        </p>
      </div>

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
    </div>
  )
}
