'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mainNavItems = [
  {
    title: '学習カリキュラム',
    href: '/learn',
    icon: '📖',
    description: '体系的に学ぶ',
  },
  {
    title: 'クイズ',
    href: '/quiz',
    icon: '🎯',
    description: '知識を確認',
  },
  {
    title: '画像リファレンス',
    href: '/images',
    icon: '🖼️',
    description: '参考画像集',
  },
]

const navItems = [
  {
    title: '共通知識',
    href: '/common',
    icon: '📚',
    description: '日本識別の基本',
  },
  {
    title: 'インフラ',
    href: '/infrastructure',
    icon: '🔌',
    description: '電柱・道路・標識',
  },
  {
    title: '電力会社別',
    href: '/power-companies',
    icon: '⚡',
    description: '10電力会社の電柱',
  },
  {
    title: '地域別Tips',
    href: '/regions',
    icon: '🗾',
    description: '北海道〜沖縄',
  },
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
