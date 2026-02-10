export interface Tip {
  id: string
  title: string
  description: string
  details?: string[]
  image?: string
  source?: string
  importance?: 'high' | 'medium' | 'low'
  tags?: string[]
}

export interface PowerCompany {
  id: string
  name: string
  area: string
  plateFeatures: string
  importance?: 'high' | 'medium' | 'low'
  details: string[]
  tips: string
}

export interface Prefecture {
  id: string
  name: string
  areaCode?: string
  powerCompany?: string
  tips: Tip[]
}

export interface Region {
  id: string
  name: string
  description: string
  prefectures?: Prefecture[]
  tips?: Tip[]
}

// 市区町村関連
export interface Ward {
  name: string
  reading: string
  lat: number
  lng: number
}

export interface Municipality {
  name: string
  reading: string
  type: 'designated_city' | 'city' | 'special_ward' | 'town' | 'village'
  lat: number
  lng: number
  wards?: Ward[]
}

export interface MunicipalityPrefecture {
  code: string
  name: string
  nameEn: string
  region: string
  lat: number
  lng: number
  municipalities: Municipality[]
}

export interface MunicipalityData {
  prefectures: MunicipalityPrefecture[]
}

export interface MunicipalityProgress {
  quizzesTaken: number
  correctAnswers: number
  prefectureScores: { [prefCode: string]: { correct: number; total: number } }
  masteredPrefectures: string[]
  bestFullScores?: { [prefCode: string]: number }
  lastQuizDate: string
}

// 国道関連
export interface Road {
  number: number
  name: string
  startPoint: string
  endPoint: string
  prefectures: string[]
  length: number
  category: string
  tips: string
}

export interface RoadData {
  roads: Road[]
  prefectureNames: Record<string, string>
}

export interface RoadProgress {
  quizzesTaken: number
  correctAnswers: number
  masteredRoads: number[]
  lastQuizDate: string
}

// 河川関連
export interface River {
  name: string
  reading: string
  system: string
  class: number
  length: number
  basinArea: number
  prefectures: string[]
  source: string
  mouth: string
  rank: { length: number; basinArea: number }
  tips: string
}

export interface RiverData {
  rivers: River[]
}

export interface RiverProgress {
  quizzesTaken: number
  correctAnswers: number
  masteredRivers: string[]
  lastQuizDate: string
}

// 市外局番関連
export interface AreaCode {
  code: string
  city: string
  prefCode: string
  prefName: string
  region: string
}

export interface AreaCodeProgress {
  quizzesTaken: number
  correctAnswers: number
  lastQuizDate: string
}
