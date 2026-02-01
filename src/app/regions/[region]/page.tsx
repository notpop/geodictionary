import Link from 'next/link'
import RegionContent from '@/components/RegionContent'
import regions from '@/data/regions.json'
import type { Region } from '@/lib/types'

const regionsData = regions.regions as Region[]

export function generateStaticParams() {
  return regionsData.map((region) => ({
    region: region.id,
  }))
}

interface PageProps {
  params: Promise<{ region: string }>
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionId } = await params

  const region = regionsData.find((r) => r.id === regionId)

  if (!region) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          地域が見つかりません
        </h1>
        <Link href="/regions" className="text-primary hover:underline">
          地域一覧に戻る
        </Link>
      </div>
    )
  }

  return <RegionContent region={region} />
}
