import Link from 'next/link'
import { Zen_Maru_Gothic } from 'next/font/google'

const zenMaru = Zen_Maru_Gothic({
  weight: '900',
  subsets: ['latin'],
  display: 'swap',
})

const tiles = [
  // 地図系（上部）
  { href: '/municipalities', label: '市区\n町村', color: 'bg-violet-600', area: '1 / 1 / 3 / 3', textClass: 'text-[76px] leading-[1.1]' },
  { href: '/roads', label: '国道', color: 'bg-blue-600', area: '1 / 3 / 2 / 5', textClass: 'text-[68px]' },
  { href: '/rivers', label: '河\n川', color: 'bg-teal-500', area: '2 / 3 / 4 / 4', textClass: 'text-[76px] leading-[1.1]' },
  // 学習・リファレンス系
  { href: '/quiz', label: 'ク\nイ\nズ', color: 'bg-orange-500', area: '2 / 4 / 5 / 5', textClass: 'text-[70px] leading-[1.15]' },
  { href: '/common', label: '共通\n知識', color: 'bg-slate-700', area: '3 / 1 / 5 / 3', textClass: 'text-[76px] leading-[1.1]' },
  { href: '/learn', label: '学習', color: 'bg-emerald-600', area: '4 / 3 / 5 / 4', textClass: 'text-[38px]' },
  { href: '/area-codes', label: '市外\n局番', color: 'bg-cyan-600', area: '5 / 1 / 6 / 3', textClass: 'text-[52px] leading-[1.1]' },
  { href: '/regions', label: '地域別', color: 'bg-rose-500', area: '5 / 3 / 6 / 4', textClass: 'text-[26px]' },
  { href: '/power-companies', label: '電柱', color: 'bg-amber-500', area: '5 / 4 / 6 / 5', textClass: 'text-[38px]' },
  { href: '/infrastructure', label: 'インフラ', color: 'bg-indigo-600', area: '6 / 1 / 7 / 5', textClass: 'text-[40px]' },
]

export default function Home() {
  return (
    <>
      <style>{`html,body{background:#0f172a!important;overflow:hidden!important;height:100dvh!important}`}</style>
      <div
        className={`grid grid-cols-4 gap-[2px] -mx-4 -mt-6 -mb-6 bg-slate-900 ${zenMaru.className}`}
        style={{
          height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))',
          gridTemplateRows: 'repeat(6, 1fr)',
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
