'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
              共通知識
            </Link>
            <Link href="/infrastructure" className="text-slate-600 hover:text-primary transition-colors">
              インフラ
            </Link>
            <Link href="/power-companies" className="text-slate-600 hover:text-primary transition-colors">
              電力会社
            </Link>
            <Link href="/regions" className="text-slate-600 hover:text-primary transition-colors">
              地域別
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
