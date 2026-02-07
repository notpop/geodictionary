import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'GeoGuessr 日本攻略ガイド',
  description: '日本マップを攻略するためのTips、電柱・道路・地域別の見分け方を体系的にまとめたガイド',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GeoJP',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased" style={{ overflowX: 'clip' }}>
        <Header />
        <div className="flex">
          <Navigation />
          <main className="flex-1 md:ml-64 min-h-screen pb-safe" style={{ overflowX: 'clip', paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
            <div className="container mx-auto px-4 py-6 max-w-4xl overflow-hidden">
              {children}
            </div>
          </main>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  )
}
