'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const closeMenuOnMobile = () => {
  // モバイルでメニューを閉じる
  if (window.innerWidth < 768) {
    const nav = document.getElementById('mobile-nav')
    if (nav && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open')
      nav.classList.add('nav-closed')
      // ヘッダーのメニューボタン状態も同期
      window.dispatchEvent(new CustomEvent('closeMenu'))
    }
  }
}

// ふりがなヘルパー
const Ruby = ({ children, reading }: { children: React.ReactNode; reading: string }) => (
  <ruby>{children}<rp>(</rp><rt>{reading}</rt><rp>)</rp></ruby>
)

const mainNavItems = [
  {
    title: <><Ruby reading="がくしゅう">学習</Ruby>カリキュラム</>,
    href: '/learn',
    icon: '📖',
    description: <><Ruby reading="たいけいてき">体系的</Ruby>に<Ruby reading="まな">学</Ruby>ぶ</>,
  },
  {
    title: 'クイズ',
    href: '/quiz',
    icon: '🎯',
    description: <><Ruby reading="ちしき">知識</Ruby>を<Ruby reading="かくにん">確認</Ruby></>,
  },
  {
    title: <><Ruby reading="がぞう">画像</Ruby>リファレンス</>,
    href: '/images',
    icon: '🖼️',
    description: <><Ruby reading="さんこうがぞうしゅう">参考画像集</Ruby></>,
  },
]

const navItems = [
  {
    title: <><Ruby reading="きょうつうちしき">共通知識</Ruby></>,
    href: '/common',
    icon: '📚',
    description: <><Ruby reading="にほん">日本</Ruby><Ruby reading="しきべつ">識別</Ruby>の<Ruby reading="きほん">基本</Ruby></>,
  },
  {
    title: 'インフラ',
    href: '/infrastructure',
    icon: '🔌',
    description: <><Ruby reading="でんちゅう">電柱</Ruby>・<Ruby reading="どうろ">道路</Ruby>・<Ruby reading="ひょうしき">標識</Ruby></>,
  },
  {
    title: <><Ruby reading="でんりょくがいしゃべつ">電力会社別</Ruby></>,
    href: '/power-companies',
    icon: '⚡',
    description: <>10<Ruby reading="でんりょくがいしゃ">電力会社</Ruby>の<Ruby reading="でんちゅう">電柱</Ruby></>,
  },
  {
    title: <><Ruby reading="ちいきべつ">地域別</Ruby>Tips</>,
    href: '/regions',
    icon: '🗾',
    description: <><Ruby reading="ほっかいどう">北海道</Ruby>〜<Ruby reading="おきなわ">沖縄</Ruby></>,
  },
]

const regions = [
  { name: <Ruby reading="ほっかいどう">北海道</Ruby>, href: '/regions/hokkaido' },
  { name: <Ruby reading="とうほく">東北</Ruby>, href: '/regions/tohoku' },
  { name: <Ruby reading="かんとう">関東</Ruby>, href: '/regions/kanto' },
  { name: <Ruby reading="ちゅうぶ">中部</Ruby>, href: '/regions/chubu' },
  { name: <Ruby reading="ほくりく">北陸</Ruby>, href: '/regions/hokuriku' },
  { name: <Ruby reading="きんき">近畿</Ruby>, href: '/regions/kinki' },
  { name: <Ruby reading="ちゅうごく">中国</Ruby>, href: '/regions/chugoku' },
  { name: <Ruby reading="しこく">四国</Ruby>, href: '/regions/shikoku' },
  { name: <Ruby reading="きゅうしゅう">九州</Ruby>, href: '/regions/kyushu' },
  { name: <Ruby reading="おきなわ">沖縄</Ruby>, href: '/regions/okinawa' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      id="mobile-nav"
      className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto z-40 nav-closed md:nav-open transition-transform duration-300"
    >
      <div className="p-4">
        {/* Main features */}
        <ul className="space-y-2 mb-4">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenuOnMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className={`text-xs ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-200 pt-4 mb-2">
          <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            リファレンス
          </h3>
        </div>

        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenuOnMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className={`text-xs ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            地域別クイックアクセス
          </h3>
          <ul className="grid grid-cols-2 gap-1">
            {regions.map((region) => (
              <li key={region.href}>
                <Link
                  href={region.href}
                  onClick={closeMenuOnMobile}
                  className={`block px-3 py-2 text-sm rounded transition-colors ${
                    pathname === region.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {region.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
