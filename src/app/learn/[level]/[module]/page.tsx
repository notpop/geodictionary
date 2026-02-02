import Link from 'next/link'
import ModuleContent from '@/components/ModuleContent'
import curriculum from '@/data/curriculum.json'

export function generateStaticParams() {
  const params: { level: string; module: string }[] = []
  curriculum.levels.forEach((level) => {
    level.modules.forEach((module) => {
      params.push({ level: level.id, module: module.id })
    })
  })
  return params
}

interface PageProps {
  params: Promise<{ level: string; module: string }>
}

export default async function ModulePage({ params }: PageProps) {
  const { level: levelId, module: moduleId } = await params

  const level = curriculum.levels.find((l) => l.id === levelId)
  const module = level?.modules.find((m) => m.id === moduleId)
  const moduleIndex = level?.modules.findIndex((m) => m.id === moduleId) ?? -1
  const nextModule = level?.modules[moduleIndex + 1]
  const prevModule = level?.modules[moduleIndex - 1]

  if (!level || !module) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">モジュールが見つかりません</h1>
        <Link href="/learn" className="text-primary hover:underline">
          カリキュラムに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link href="/learn" className="hover:text-primary">学習</Link>
        <span>/</span>
        <span>{level.name}</span>
        <span>/</span>
        <span className="text-slate-700">{module.title}</span>
      </div>

      <ModuleContent
        level={level as any}
        module={module as any}
        moduleIndex={moduleIndex}
        prevModule={prevModule as any}
        nextModule={nextModule as any}
      />
    </div>
  )
}
