import Link from 'next/link'

interface CategoryCardProps {
  title: string
  description: string
  href: string
  icon: string
  tipCount?: number
}

export default function CategoryCard({ title, description, href, icon, tipCount }: CategoryCardProps) {
  return (
    <Link href={href} className="block">
      <div className="tip-card bg-white rounded-xl border border-slate-200 p-6 h-full">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{icon}</div>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-slate-800 mb-1">{title}</h2>
            <p className="text-slate-600 text-sm">{description}</p>
            {tipCount !== undefined && (
              <div className="mt-3 text-xs text-primary font-medium">
                {tipCount} Tips
              </div>
            )}
          </div>
          <div className="text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
