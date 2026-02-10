'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const closeMenuOnMobile = () => {
  if (window.innerWidth < 768) {
    const nav = document.getElementById('mobile-nav')
    if (nav && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open')
      nav.classList.add('nav-closed')
      window.dispatchEvent(new CustomEvent('closeMenu'))
    }
  }
}

const mainNavItems = [
  { href: '/municipalities', icon: '🗺️', label: '市区町村' },
  { href: '/roads', icon: '🛣️', label: '国道' },
  { href: '/rivers', icon: '🏞️', label: '河川' },
  { href: '/area-codes', icon: '📞', label: '市外局番' },
  { href: '/learn', icon: '📖', label: '学習' },
  { href: '/quiz', icon: '🎯', label: 'クイズ' },
  { href: '/images', icon: '🖼️', label: '画像' },
]

const subNavItems = [
  { href: '/common', icon: '📚', label: '共通知識' },
  { href: '/infrastructure', icon: '🔌', label: 'インフラ' },
  { href: '/power-companies', icon: '⚡', label: '電柱' },
  { href: '/regions', icon: '🗾', label: '地域別' },
]

const regions = [
  { name: '北海道', href: '/regions/hokkaido' },
  { name: '東北', href: '/regions/tohoku' },
  { name: '関東', href: '/regions/kanto' },
  { name: '中部', href: '/regions/chubu' },
  { name: '北陸', href: '/regions/hokuriku' },
  { name: '近畿', href: '/regions/kinki' },
  { name: '中国', href: '/regions/chugoku' },
  { name: '四国', href: '/regions/shikoku' },
  { name: '九州', href: '/regions/kyushu' },
  { name: '沖縄', href: '/regions/okinawa' },
]

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      id="mobile-nav"
      className="fixed left-0 bottom-0 w-64 bg-slate-900 overflow-y-auto z-40 nav-closed md:nav-open transition-transform duration-300"
      style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="p-3">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenuOnMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 active:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/10 mt-3 pt-3">
          <p className="px-3 text-[10px] text-slate-500 uppercase tracking-wider mb-2">リファレンス</p>
          <ul className="space-y-1">
            {subNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenuOnMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 active:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/10 mt-3 pt-3">
          <p className="px-3 text-[10px] text-slate-500 uppercase tracking-wider mb-2">地域別</p>
          <ul className="grid grid-cols-2 gap-1">
            {regions.map((region) => (
              <li key={region.href}>
                <Link
                  href={region.href}
                  onClick={closeMenuOnMobile}
                  className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                    pathname === region.href
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-slate-400 active:bg-white/10'
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
