'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { completeModule, getProgress } from '@/lib/storage'

interface ModuleImage {
  url: string
  caption: string
  source?: string
}

interface Module {
  id: string
  title: string
  description: string
  points: string[]
  images?: ModuleImage[]
  quiz?: string[]
}

interface Level {
  id: string
  name: string
  title: string
}

interface ModuleContentProps {
  level: Level
  module: Module
  moduleIndex: number
  prevModule?: Module
  nextModule?: Module
}

export default function ModuleContent({
  level,
  module,
  moduleIndex,
  prevModule,
  nextModule,
}: ModuleContentProps) {
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    setIsCompleted(progress.completedModules.includes(module.id))
  }, [module.id])

  const handleComplete = () => {
    completeModule(module.id)
    setIsCompleted(true)
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">
            {moduleIndex + 1}
          </span>
          <div>
            <div className="text-sm text-primary font-medium">{level.title}</div>
            <h1 className="text-2xl font-bold text-slate-800">{module.title}</h1>
          </div>
        </div>
        <p className="text-slate-600">{module.description}</p>
      </div>

      {/* Images */}
      {module.images && module.images.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">参考画像</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {module.images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">画像読込エラー</text></svg>'
                    }}
                  />
                  {image.source && (
                    <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {image.source}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 text-center">{image.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">学習ポイント</h2>
        <div className="space-y-4">
          {module.points.map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
            >
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-slate-700 leading-relaxed pt-1">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Completion */}
      <div className={`rounded-2xl p-6 ${isCompleted ? 'bg-green-50' : 'bg-amber-50'}`}>
        {isCompleted ? (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold text-green-800 mb-2">このモジュールは完了しています</h3>
            <p className="text-sm text-green-700">次のモジュールに進むか、クイズで復習しましょう。</p>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="font-bold text-amber-800 mb-3">ポイントを覚えましたか？</h3>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              このモジュールを完了にする
            </button>
          </div>
        )}
      </div>

      {/* Quiz link */}
      {module.quiz && module.quiz.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-800">クイズで確認</h3>
              <p className="text-sm text-blue-700">このモジュールの内容をクイズで確認しましょう。</p>
            </div>
            <Link
              href="/quiz"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              クイズへ
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevModule ? (
          <Link
            href={`/learn/${level.id}/${prevModule.id}`}
            className="flex items-center gap-2 text-slate-600 hover:text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{prevModule.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            href={`/learn/${level.id}/${nextModule.id}`}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <span className="text-sm font-medium">{nextModule.title}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/learn"
            className="flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <span className="text-sm font-medium">カリキュラムに戻る</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Link>
        )}
      </div>
    </>
  )
}
