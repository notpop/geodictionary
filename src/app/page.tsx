import Link from 'next/link'

const tiles = [
  { href: '/municipalities', icon: '🗺️', label: '市区町村', color: 'bg-violet-600', area: '1 / 1 / 3 / 3', iconSize: 'text-6xl', labelSize: 'text-lg' },
  { href: '/quiz', icon: '🎯', label: 'クイズ', color: 'bg-orange-500', area: '1 / 3 / 2 / 4', iconSize: 'text-2xl', labelSize: 'text-xs' },
  { href: '/learn', icon: '📖', label: '学習', color: 'bg-emerald-600', area: '1 / 4 / 2 / 5', iconSize: 'text-2xl', labelSize: 'text-xs' },
  { href: '/roads', icon: '🛣️', label: '国道', color: 'bg-blue-600', area: '2 / 3 / 4 / 4', iconSize: 'text-4xl', labelSize: 'text-sm' },
  { href: '/rivers', icon: '🏞️', label: '河川', color: 'bg-teal-500', area: '2 / 4 / 4 / 5', iconSize: 'text-4xl', labelSize: 'text-sm' },
  { href: '/regions', icon: '🗾', label: '地域別', color: 'bg-rose-500', area: '3 / 1 / 4 / 2', iconSize: 'text-2xl', labelSize: 'text-xs' },
  { href: '/power-companies', icon: '⚡', label: '電柱', color: 'bg-amber-500', area: '3 / 2 / 4 / 3', iconSize: 'text-2xl', labelSize: 'text-xs' },
  { href: '/common', icon: '📚', label: '共通知識', color: 'bg-slate-700', area: '4 / 1 / 5 / 3', iconSize: 'text-3xl', labelSize: 'text-sm' },
  { href: '/infrastructure', icon: '🔌', label: 'インフラ', color: 'bg-indigo-600', area: '4 / 3 / 5 / 5', iconSize: 'text-3xl', labelSize: 'text-sm' },
]

export default function Home() {
  return (
    <div
      className="grid grid-cols-4 gap-[2px] -mx-4 -mt-6 bg-slate-900"
      style={{
        height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))',
        gridTemplateRows: 'repeat(4, 1fr)',
      }}
    >
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className={`${tile.color} flex flex-col justify-end p-3 active:brightness-[0.85] transition-[filter]`}
          style={{ gridArea: tile.area }}
        >
          <span className={`${tile.iconSize} leading-none mb-1`}>{tile.icon}</span>
          <span className={`text-white font-bold ${tile.labelSize}`}>{tile.label}</span>
        </Link>
      ))}
    </div>
  )
}
