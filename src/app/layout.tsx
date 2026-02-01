import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'GeoGuessr 日本攻略ガイド',
  description: '日本マップを攻略するためのTips、電柱・道路・地域別の見分け方を体系的にまとめたガイド',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Header />
        <div className="flex">
          <Navigation />
          <main className="flex-1 md:ml-64 min-h-screen pt-16">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
