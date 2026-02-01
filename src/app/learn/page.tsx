'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import curriculum from '@/data/curriculum.json'
import { getProgress, getLevelName } from '@/lib/storage'
import type { UserProgress } from '@/lib/storage'

export default function LearnPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<string | null>('level-1')

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  const isLevelUnlocked = (levelId: string) => {
    if (!progress) return levelId === 'level-1'
    const levelNum = parseInt(levelId.split('-')[1])
    return levelNum <= progress.currentLevel
  }

  const isModuleCompleted = (moduleId: string) => {
    if (!progress) return false
    return progress.completedModules.includes(moduleId)
  }

  const getLevelProgress = (levelId: string) => {
    if (!progress) return 0
    const level = curriculum.levels.find((l) => l.id === levelId)
    if (!level) return 0
    const completed = level.modules.filter((m) => progress.completedModules.includes(m.id)).length
    return Math.round((completed / level.modules.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{curriculum.title}</h1>
        <p className="text-slate-600">{curriculum.description}</p>
      </div>

      {/* Current level */}
      {progress && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">現在のレベル</div>
              <div className="text-2xl font-bold text-primary">
                Lv.{progress.currentLevel} {getLevelName(progress.currentLevel)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">完了モジュール</div>
              <div className="text-2xl font-bold text-slate-800">
                {progress.completedModules.length} / {curriculum.totalModules}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum levels */}
      <div className="space-y-4">
        {curriculum.levels.map((level) => {
          const isUnlocked = isLevelUnlocked(level.id)
          const levelProgress = getLevelProgress(level.id)
          const isExpanded = expandedLevel === level.id

          return (
            <div
              key={level.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                isUnlocked ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <button
                onClick={() => isUnlocked && setExpandedLevel(isExpanded ? null : level.id)}
                disabled={!isUnlocked}
                className="w-full p-6 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      isUnlocked
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {level.id.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-slate-800">{level.title}</h2>
                        {!isUnlocked && <span className="text-slate-400">🔒</span>}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{level.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm text-slate-500">{level.estimatedTime}</div>
                      <div className="text-xs text-slate-400">{level.modules.length}モジュール</div>
                    </div>
                    {isUnlocked && (
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {isUnlocked && levelProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>進捗</span>
                      <span>{levelProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>

              {/* Expanded modules */}
              {isExpanded && isUnlocked && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <div className="space-y-3">
                    {level.modules.map((module, index) => {
                      const isCompleted = isModuleCompleted(module.id)
                      return (
                        <Link
                          key={module.id}
                          href={`/learn/${level.id}/${module.id}`}
                          className={`block p-4 bg-white rounded-xl border transition-all hover:shadow-md ${
                            isCompleted ? 'border-green-200' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800">{module.title}</h3>
                              <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* How it works */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-bold text-slate-800 mb-3">学習の進め方</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            <span>レベル1から順番に学習を進めてください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            <span>各モジュールを読み、ポイントを覚えましょう</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            <span>クイズで理解度を確認しましょう</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">4.</span>
            <span>正解率80%以上で次のレベルが解放されます</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
