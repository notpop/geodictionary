'use client'

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-slate-100 flex items-center justify-center" style={{ minHeight: 200 }}>
      <span className="text-slate-400 text-sm">地図を読み込み中...</span>
    </div>
  ),
})

export default LeafletMap
