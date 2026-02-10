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

const mapItems = [
  { href: '/municipalities', icon: '🗺️', label: '市区町村' },
  { href: '/roads', icon: '🛣️', label: '国道' },
  { href: '/rivers', icon: '🏞️', label: '河川' },
  { href: '/area-codes', icon: '📞', label: '市外局番' },
]

const studyItems = [
  { href: '/quiz', icon: '🎯', label: 'クイズ' },
  { href: '/learn', icon: '📖', label: '学習' },
  { href: '/images', icon: '🖼️', label: '画像' },
]

const referenceItems = [
  { href: '/common', icon: '📚', label: '共通知識' },
  { href: '/regions', icon: '🗾', label: '地域別' },
  { href: '/infrastructure', icon: '🔌', label: 'インフラ' },
  { href: '/power-companies', icon: '⚡', label: '電柱' },
]

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const renderSection = (title: string, items: typeof mapItems) => (
    <div className="border-t border-white/10 mt-3 pt-3">
      <p className="px-3 text-[10px] text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
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
  )

  return (
    <nav
      id="mobile-nav"
      className="fixed left-0 bottom-0 w-64 bg-slate-900 overflow-y-auto z-40 nav-closed md:nav-open transition-transform duration-300"
      style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="p-3">
        {/* 地図データ — メインコンテンツ */}
        <ul className="space-y-1">
          {mapItems.map((item) => (
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

        {renderSection('練習', studyItems)}
        {renderSection('リファレンス', referenceItems)}
      </div>
    </nav>
  )
}
