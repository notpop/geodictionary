'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleCloseMenu = () => setIsMenuOpen(false)
    window.addEventListener('closeMenu', handleCloseMenu)
    return () => window.removeEventListener('closeMenu', handleCloseMenu)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌏</span>
            <span className="font-bold text-lg text-slate-800">
              GeoGuessr 日本攻略
            </span>
          </Link>

          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              const nav = document.getElementById('mobile-nav')
              if (nav) {
                nav.classList.toggle('nav-open')
                nav.classList.toggle('nav-closed')
              }
            }}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/common" className="text-slate-600 hover:text-primary transition-colors">
              <ruby>共通知識<rp>(</rp><rt>きょうつうちしき</rt><rp>)</rp></ruby>
            </Link>
            <Link href="/infrastructure" className="text-slate-600 hover:text-primary transition-colors">
              インフラ
            </Link>
            <Link href="/power-companies" className="text-slate-600 hover:text-primary transition-colors">
              <ruby>電力会社<rp>(</rp><rt>でんりょくがいしゃ</rt><rp>)</rp></ruby>
            </Link>
            <Link href="/regions" className="text-slate-600 hover:text-primary transition-colors">
              <ruby>地域別<rp>(</rp><rt>ちいきべつ</rt><rp>)</rp></ruby>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
