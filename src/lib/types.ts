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

export interface Region {
  id: string
  name: string
  description: string
  prefectures?: string[]
  tips: Tip[]
}
