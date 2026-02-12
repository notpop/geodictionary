import Link from 'next/link'
import { Zen_Maru_Gothic } from 'next/font/google'

const zenMaru = Zen_Maru_Gothic({
  weight: '900',
  subsets: ['latin'],
  display: 'swap',
})

const tiles = [
  // Row 1-2: 地図データ系
  { href: '/municipalities', label: '市区\n町村', color: 'bg-violet-600', area: '1 / 1 / 3 / 3', textClass: 'text-[76px] leading-[1.1]' },
  { href: '/roads', label: '国道', color: 'bg-blue-600', area: '1 / 3 / 2 / 5', textClass: 'text-[68px]' },
  { href: '/rivers', label: '河\n川', color: 'bg-teal-500', area: '2 / 3 / 3 / 4', textClass: 'text-[56px] leading-[1.1]' },
  { href: '/area-codes', label: '市外\n局番', color: 'bg-cyan-600', area: '2 / 4 / 4 / 5', textClass: 'text-[50px] leading-[1.1]' },
  // Row 3: 練習系
  { href: '/quiz', label: 'クイズ', color: 'bg-orange-500', area: '3 / 1 / 4 / 3', textClass: 'text-[58px]' },
  { href: '/regions', label: '地域別', color: 'bg-rose-500', area: '3 / 3 / 4 / 4', textClass: 'text-[28px]' },
  // Row 4-5: リファレンス系
  { href: '/common', label: '共通\n知識', color: 'bg-slate-700', area: '4 / 1 / 6 / 2', textClass: 'text-[56px] leading-[1.1]' },
  { href: '/learn', label: '学習', color: 'bg-emerald-600', area: '4 / 2 / 5 / 3', textClass: 'text-[42px]' },
  { href: '/power-companies', label: '電柱', color: 'bg-amber-500', area: '4 / 3 / 5 / 5', textClass: 'text-[54px]' },
  { href: '/infrastructure', label: 'インフラ', color: 'bg-indigo-600', area: '5 / 2 / 6 / 5', textClass: 'text-[44px]' },
]

export default function Home() {
  return (
    <>
      <style>{`html,body{background:#0f172a!important;overflow:hidden!important}`}</style>
      <div
        className={`fixed left-0 md:left-64 right-0 bottom-0 grid grid-cols-4 gap-[2px] bg-slate-900 ${zenMaru.className}`}
        style={{
          top: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
          gridTemplateRows: 'repeat(5, 1fr)',
        }}
      >
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`${tile.color} flex items-center justify-center p-2 active:brightness-[0.85] transition-[filter]`}
            style={{ gridArea: tile.area }}
          >
            <span className={`text-white/90 ${tile.textClass} text-center whitespace-pre-line`}>
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
