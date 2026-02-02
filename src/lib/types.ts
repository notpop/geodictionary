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
