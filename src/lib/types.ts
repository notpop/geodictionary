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
  lastQuizDate: string
}
