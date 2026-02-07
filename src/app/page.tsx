import Link from 'next/link'
import { Zen_Maru_Gothic } from 'next/font/google'

const zenMaru = Zen_Maru_Gothic({
  weight: '900',
  subsets: ['latin'],
  display: 'swap',
})

const tiles = [
  { href: '/municipalities', label: '市区\n町村', color: 'bg-violet-600', area: '1 / 1 / 3 / 3', textClass: 'text-[76px] leading-[1.1]' },
  { href: '/quiz', label: 'ク\nイ\nズ', color: 'bg-orange-500', area: '1 / 3 / 2 / 4', textClass: 'text-[54px] leading-[1.05]' },
  { href: '/learn', label: '学習', color: 'bg-emerald-600', area: '1 / 4 / 2 / 5', textClass: 'text-[38px]' },
  { href: '/roads', label: '国道', color: 'bg-blue-600', area: '2 / 3 / 3 / 5', textClass: 'text-[76px]' },
  { href: '/rivers', label: '河川', color: 'bg-teal-500', area: '3 / 1 / 4 / 3', textClass: 'text-[76px]' },
  { href: '/regions', label: '地域別', color: 'bg-rose-500', area: '3 / 3 / 4 / 4', textClass: 'text-[26px]' },
  { href: '/power-companies', label: '電柱', color: 'bg-amber-500', area: '3 / 4 / 4 / 5', textClass: 'text-[38px]' },
  { href: '/common', label: '共通\n知識', color: 'bg-slate-700', area: '4 / 1 / 5 / 3', textClass: 'text-[68px] leading-[1.1]' },
  { href: '/infrastructure', label: 'インフラ', color: 'bg-indigo-600', area: '4 / 3 / 5 / 5', textClass: 'text-[40px]' },
]

export default function Home() {
  return (
    <>
      <style>{`body{background:#0f172a!important}`}</style>
      <div
        className={`grid grid-cols-4 gap-[2px] -mx-4 -mt-6 bg-slate-900 ${zenMaru.className}`}
        style={{
          height: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))',
          gridTemplateRows: 'repeat(4, 1fr)',
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
