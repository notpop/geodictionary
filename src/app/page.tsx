import Link from 'next/link'

const menuItems = [
  {
    href: '/municipalities',
    icon: '🗺️',
    label: '市区町村',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    href: '/roads',
    icon: '🛣️',
    label: '国道',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    href: '/rivers',
    icon: '🏞️',
    label: '河川',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    href: '/quiz',
    icon: '🎯',
    label: 'クイズ',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    href: '/learn',
    icon: '📖',
    label: '学習',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    href: '/regions',
    icon: '🗾',
    label: '地域別',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    href: '/power-companies',
    icon: '⚡',
    label: '電柱',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    href: '/common',
    icon: '📚',
    label: '共通知識',
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    href: '/infrastructure',
    icon: '🔌',
    label: 'インフラ',
    gradient: 'from-indigo-500 to-indigo-600',
  },
]

export default function Home() {
  return (
    <div className="animate-fade-in flex flex-col items-center" style={{ minHeight: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px) - 3rem)' }}>
      {/* Logo */}
      <div className="text-center pt-6 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          Geo<span className="text-slate-800">JP</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">GeoGuessr Japan Guide</p>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm px-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 active:scale-[0.93] transition-transform"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <span className="text-xs font-medium text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
