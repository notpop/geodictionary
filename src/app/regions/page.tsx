import Link from 'next/link'
import regions from '@/data/regions.json'

const regionColors: { [key: string]: string } = {
  hokkaido: 'from-sky-500 to-blue-600',
  tohoku: 'from-teal-500 to-emerald-600',
  kanto: 'from-orange-500 to-red-500',
  chubu: 'from-amber-500 to-orange-500',
  hokuriku: 'from-cyan-500 to-teal-500',
  kinki: 'from-purple-500 to-violet-600',
  chugoku: 'from-rose-500 to-pink-600',
  shikoku: 'from-lime-500 to-green-600',
  kyushu: 'from-red-500 to-rose-600',
  okinawa: 'from-blue-500 to-cyan-500',
}

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

export default function RegionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          地域別Tips
        </h1>
        <p className="text-slate-600">
          {regions.description}
        </p>
      </div>

      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          日本は北海道から沖縄まで、地域ごとに景観やインフラが異なります。
          各地域の特徴を覚えることで、より正確に場所を特定できます。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {regions.regions.map((region) => (
          <Link key={region.id} href={`/regions/${region.id}`}>
            <div className="tip-card bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
              <div className={`h-2 bg-gradient-to-r ${regionColors[region.id] || 'from-slate-400 to-slate-500'}`} />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{regionEmojis[region.id] || '📍'}</span>
                  <h2 className="font-bold text-lg text-slate-800">{region.name}</h2>
                </div>
                <p className="text-sm text-slate-600 mb-3">{region.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    {region.prefectures?.reduce((acc, pref) => acc + (pref.tips?.length || 0), 0) || 0} Tips
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
