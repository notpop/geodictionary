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
import type { MunicipalityProgress, RoadProgress, RiverProgress, AreaCodeProgress } from './types'

const MUNICIPALITY_KEY = 'geoguessr-municipality-progress'

export function getMunicipalityProgress(): MunicipalityProgress {
  if (typeof window === 'undefined') return getDefaultMunicipalityProgress()
  const stored = localStorage.getItem(MUNICIPALITY_KEY)
  if (!stored) return getDefaultMunicipalityProgress()
  try {
    const progress: MunicipalityProgress = JSON.parse(stored)
    // Reconcile masteredPrefectures from bestFullScores
    if (progress.bestFullScores) {
      for (const [prefCode, score] of Object.entries(progress.bestFullScores)) {
        if (score >= 80 && !progress.masteredPrefectures.includes(prefCode)) {
          progress.masteredPrefectures.push(prefCode)
        }
      }
    }
    return progress
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
  prefCode?: string,
  isFullQuiz?: boolean
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

    // ベストスコアを記録（全問・部分問わず）
    if (!progress.bestFullScores) progress.bestFullScores = {}
    const pct = Math.round((correct / total) * 100)
    const prev = progress.bestFullScores[prefCode] ?? 0
    if (pct > prev) {
      progress.bestFullScores[prefCode] = pct
    }

    // 習得判定：ベストスコア80%以上で習得
    const bestPct = progress.bestFullScores[prefCode] ?? 0
    if (bestPct >= 80 && !progress.masteredPrefectures.includes(prefCode)) {
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
  // ベストスコアがあればそちらを優先
  const best = progress.bestFullScores?.[prefCode]
  if (best !== undefined) return best
  const score = progress.prefectureScores[prefCode]
  if (!score || score.total === 0) return 0
  return Math.round((score.correct / score.total) * 100)
}

// 国道マスター進捗管理
const ROAD_KEY = 'geoguessr-road-progress'

export function getRoadProgress(): RoadProgress {
  if (typeof window === 'undefined') return getDefaultRoadProgress()
  const stored = localStorage.getItem(ROAD_KEY)
  if (!stored) return getDefaultRoadProgress()
  try {
    return JSON.parse(stored)
  } catch {
    return getDefaultRoadProgress()
  }
}

function getDefaultRoadProgress(): RoadProgress {
  return {
    quizzesTaken: 0,
    correctAnswers: 0,
    masteredRoads: [],
    lastQuizDate: new Date().toISOString(),
  }
}

export function recordRoadQuiz(correct: number, total: number): void {
  const progress = getRoadProgress()
  progress.quizzesTaken += total
  progress.correctAnswers += correct
  progress.lastQuizDate = new Date().toISOString()
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROAD_KEY, JSON.stringify(progress))
  }
}

export function getRoadAccuracy(progress: RoadProgress): number {
  if (progress.quizzesTaken === 0) return 0
  return Math.round((progress.correctAnswers / progress.quizzesTaken) * 100)
}

// 川マスター進捗管理
const RIVER_KEY = 'geoguessr-river-progress'

export function getRiverProgress(): RiverProgress {
  if (typeof window === 'undefined') return getDefaultRiverProgress()
  const stored = localStorage.getItem(RIVER_KEY)
  if (!stored) return getDefaultRiverProgress()
  try {
    return JSON.parse(stored)
  } catch {
    return getDefaultRiverProgress()
  }
}

function getDefaultRiverProgress(): RiverProgress {
  return {
    quizzesTaken: 0,
    correctAnswers: 0,
    masteredRivers: [],
    lastQuizDate: new Date().toISOString(),
  }
}

export function recordRiverQuiz(correct: number, total: number): void {
  const progress = getRiverProgress()
  progress.quizzesTaken += total
  progress.correctAnswers += correct
  progress.lastQuizDate = new Date().toISOString()
  if (typeof window !== 'undefined') {
    localStorage.setItem(RIVER_KEY, JSON.stringify(progress))
  }
}

export function getRiverAccuracy(progress: RiverProgress): number {
  if (progress.quizzesTaken === 0) return 0
  return Math.round((progress.correctAnswers / progress.quizzesTaken) * 100)
}

// ========== 市外局番進捗 ==========
const AREA_CODE_KEY = 'geoguessr-area-code-progress'

export function getAreaCodeProgress(): AreaCodeProgress {
  if (typeof window === 'undefined') return getDefaultAreaCodeProgress()
  const raw = localStorage.getItem(AREA_CODE_KEY)
  if (!raw) return getDefaultAreaCodeProgress()
  return JSON.parse(raw)
}

function getDefaultAreaCodeProgress(): AreaCodeProgress {
  return {
    quizzesTaken: 0,
    correctAnswers: 0,
    lastQuizDate: new Date().toISOString(),
  }
}

export function recordAreaCodeQuiz(correct: number, total: number): void {
  const progress = getAreaCodeProgress()
  progress.quizzesTaken += total
  progress.correctAnswers += correct
  progress.lastQuizDate = new Date().toISOString()
  if (typeof window !== 'undefined') {
    localStorage.setItem(AREA_CODE_KEY, JSON.stringify(progress))
  }
}

export function getAreaCodeAccuracy(progress: AreaCodeProgress): number {
  if (progress.quizzesTaken === 0) return 0
  return Math.round((progress.correctAnswers / progress.quizzesTaken) * 100)
}

// ========== クイズクリア記録（全クイズ共通） ==========
const QUIZ_CLEARS_KEY = 'geoguessr-quiz-clears'

export function getQuizClears(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(QUIZ_CLEARS_KEY)
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

export function recordQuizClear(key: string): void {
  if (typeof window === 'undefined') return
  const clears = getQuizClears()
  clears[key] = true
  localStorage.setItem(QUIZ_CLEARS_KEY, JSON.stringify(clears))
}
