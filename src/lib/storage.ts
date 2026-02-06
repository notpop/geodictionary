// ローカルストレージを使った進捗管理

export interface UserProgress {
  completedModules: string[]
  quizScores: { [quizId: string]: number }
  totalQuizzesTaken: number
  correctAnswers: number
  currentLevel: number
  lastUpdated: string
}

const STORAGE_KEY = 'geoguessr-japan-progress'

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress()
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return getDefaultProgress()
  }
  try {
    return JSON.parse(stored)
  } catch {
    return getDefaultProgress()
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  progress.lastUpdated = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getDefaultProgress(): UserProgress {
  return {
    completedModules: [],
    quizScores: {},
    totalQuizzesTaken: 0,
    correctAnswers: 0,
    currentLevel: 1,
    lastUpdated: new Date().toISOString(),
  }
}

export function completeModule(moduleId: string): void {
  const progress = getProgress()
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId)
    saveProgress(progress)
  }
}

export function recordQuizResult(correct: number, total: number, category?: string): void {
  const progress = getProgress()
  progress.totalQuizzesTaken += total
  progress.correctAnswers += correct

  // レベルアップ判定
  const accuracy = progress.correctAnswers / progress.totalQuizzesTaken
  if (progress.totalQuizzesTaken >= 10 && accuracy >= 0.8 && progress.currentLevel < 2) {
    progress.currentLevel = 2
  } else if (progress.totalQuizzesTaken >= 30 && accuracy >= 0.7 && progress.currentLevel < 3) {
    progress.currentLevel = 3
  } else if (progress.totalQuizzesTaken >= 50 && accuracy >= 0.75 && progress.currentLevel < 4) {
    progress.currentLevel = 4
  } else if (progress.totalQuizzesTaken >= 80 && accuracy >= 0.8 && progress.currentLevel < 5) {
    progress.currentLevel = 5
  } else if (progress.totalQuizzesTaken >= 120 && accuracy >= 0.85 && progress.currentLevel < 6) {
    progress.currentLevel = 6
  }

  saveProgress(progress)
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function calculateAccuracy(progress: UserProgress): number {
  if (progress.totalQuizzesTaken === 0) return 0
  return Math.round((progress.correctAnswers / progress.totalQuizzesTaken) * 100)
}

export function getLevelName(level: number): string {
  const names = ['', '入門', '基礎', '中級', '上級', 'エキスパート', 'マスター']
  return names[level] || '入門'
}

// 市区町村学習の進捗管理
import type { MunicipalityProgress } from './types'

const MUNICIPALITY_KEY = 'geoguessr-municipality-progress'

export function getMunicipalityProgress(): MunicipalityProgress {
  if (typeof window === 'undefined') return getDefaultMunicipalityProgress()
  const stored = localStorage.getItem(MUNICIPALITY_KEY)
  if (!stored) return getDefaultMunicipalityProgress()
  try {
    return JSON.parse(stored)
  } catch {
    return getDefaultMunicipalityProgress()
  }
}

export function saveMunicipalityProgress(progress: MunicipalityProgress): void {
  if (typeof window === 'undefined') return
  progress.lastQuizDate = new Date().toISOString()
  localStorage.setItem(MUNICIPALITY_KEY, JSON.stringify(progress))
}

export function getDefaultMunicipalityProgress(): MunicipalityProgress {
  return {
    quizzesTaken: 0,
    correctAnswers: 0,
    prefectureScores: {},
    masteredPrefectures: [],
    lastQuizDate: new Date().toISOString(),
  }
}

export function recordMunicipalityQuiz(
  correct: number,
  total: number,
  prefCode?: string
): void {
  const progress = getMunicipalityProgress()
  progress.quizzesTaken += total
  progress.correctAnswers += correct

  if (prefCode) {
    if (!progress.prefectureScores[prefCode]) {
      progress.prefectureScores[prefCode] = { correct: 0, total: 0 }
    }
    progress.prefectureScores[prefCode].correct += correct
    progress.prefectureScores[prefCode].total += total

    const score = progress.prefectureScores[prefCode]
    const accuracy = score.correct / score.total
    if (score.total >= 10 && accuracy >= 0.8 && !progress.masteredPrefectures.includes(prefCode)) {
      progress.masteredPrefectures.push(prefCode)
    }
  }

  saveMunicipalityProgress(progress)
}

export function getMunicipalityAccuracy(progress: MunicipalityProgress): number {
  if (progress.quizzesTaken === 0) return 0
  return Math.round((progress.correctAnswers / progress.quizzesTaken) * 100)
}

export function getPrefectureAccuracy(progress: MunicipalityProgress, prefCode: string): number {
  const score = progress.prefectureScores[prefCode]
  if (!score || score.total === 0) return 0
  return Math.round((score.correct / score.total) * 100)
}
