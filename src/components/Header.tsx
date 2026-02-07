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
    <header className="fixed top-0 left-0 right-0 bg-slate-900 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <Link href="/" className="font-extrabold text-xl tracking-tight">
          <span className="text-white">Geo</span>
          <span className="text-blue-400">JP</span>
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
          className="md:hidden p-2 rounded-lg active:bg-white/10"
          aria-label="メニュー"
        >
          <svg
            className="w-6 h-6 text-white"
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
          <Link href="/common" className="text-slate-300 hover:text-white transition-colors text-sm">
            共通知識
          </Link>
          <Link href="/infrastructure" className="text-slate-300 hover:text-white transition-colors text-sm">
            インフラ
          </Link>
          <Link href="/power-companies" className="text-slate-300 hover:text-white transition-colors text-sm">
            電力会社
          </Link>
          <Link href="/regions" className="text-slate-300 hover:text-white transition-colors text-sm">
            地域別
          </Link>
        </nav>
      </div>
    </header>
  )
}
