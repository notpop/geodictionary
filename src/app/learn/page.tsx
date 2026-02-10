'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import curriculum from '@/data/curriculum.json'
import { getProgress, getLevelName } from '@/lib/storage'
import type { UserProgress } from '@/lib/storage'

const levelColors = [
  '', // index 0 unused
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-purple-500 to-purple-600',
  'from-slate-600 to-slate-800',
]

export default function LearnPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null)

  useEffect(() => {
    const p = getProgress()
    setProgress(p)
    if (p && p.currentLevel <= curriculum.levels.length) {
      setExpandedLevel(`level-${p.currentLevel}`)
    } else {
      setExpandedLevel('level-1')
    }
  }, [])

  const isLevelUnlocked = (levelId: string) => {
    if (!progress) return levelId === 'level-1'
    const levelNum = parseInt(levelId.split('-')[1])
    return levelNum <= progress.currentLevel
  }

  const isModuleCompleted = (moduleId: string) => {
    return progress?.completedModules.includes(moduleId) ?? false
  }

  const getLevelProgress = (levelId: string) => {
    if (!progress) return 0
    const level = curriculum.levels.find((l) => l.id === levelId)
    if (!level) return 0
    const completed = level.modules.filter((m) => progress.completedModules.includes(m.id)).length
    return Math.round((completed / level.modules.length) * 100)
  }

  const completedTotal = progress?.completedModules.length ?? 0

  return (
    <div className="animate-fade-in space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold">
          Lv.{progress?.currentLevel ?? 1} {getLevelName(progress?.currentLevel ?? 1)}
        </div>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(completedTotal / curriculum.totalModules) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{completedTotal}/{curriculum.totalModules}</span>
      </div>

      {/* Level cards */}
      {curriculum.levels.map((level) => {
        const levelNum = parseInt(level.id.split('-')[1])
        const isUnlocked = isLevelUnlocked(level.id)
        const levelProg = getLevelProgress(level.id)
        const isExpanded = expandedLevel === level.id
        const colorClass = levelColors[levelNum] || levelColors[1]

        return (
          <div key={level.id} className={`rounded-2xl overflow-hidden ${!isUnlocked ? 'opacity-50' : ''}`}>
            <button
              onClick={() => isUnlocked && setExpandedLevel(isExpanded ? null : level.id)}
              disabled={!isUnlocked}
              className={`w-full text-left p-4 bg-gradient-to-r ${colorClass} text-white relative`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg font-bold backdrop-blur-sm">
                  {isUnlocked ? levelNum : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base">{level.name}</div>
                  <div className="text-white/70 text-xs">{level.modules.length}モジュール</div>
                </div>
                {isUnlocked && levelProg > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-bold">{levelProg}%</span>
                  </div>
                )}
                {isUnlocked && (
                  <svg
                    className={`w-5 h-5 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
              {/* Progress bar */}
              {isUnlocked && levelProg > 0 && (
                <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full" style={{ width: `${levelProg}%` }} />
                </div>
              )}
            </button>

            {/* Modules */}
            {isExpanded && isUnlocked && (
              <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-3 space-y-2">
                {level.modules.map((module, index) => {
                  const done = isModuleCompleted(module.id)
                  return (
                    <Link
                      key={module.id}
                      href={`/learn/${level.id}/${module.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform ${
                        done ? 'bg-green-50' : 'bg-slate-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {done ? '✓' : index + 1}
                      </div>
                      <span className={`text-sm font-medium ${done ? 'text-green-700' : 'text-slate-700'}`}>
                        {module.title}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
