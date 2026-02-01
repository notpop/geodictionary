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
