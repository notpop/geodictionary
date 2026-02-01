'use client'

import { useState } from 'react'
import imagesData from '@/data/images.json'

interface ImageItem {
  id: string
  title: string
  url: string
  description: string
  source?: string
}

interface ImageCategory {
  title: string
  images: ImageItem[]
}

export default function ImagesPage() {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = imagesData.categories as Record<string, ImageCategory>
  const categoryKeys = Object.keys(categories)

  const filteredCategories = selectedCategory
    ? { [selectedCategory]: categories[selectedCategory] }
    : categories

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">画像リファレンス</h1>
        <p className="text-slate-600">
          GeoGuessrで日本を識別するための参考画像集。カテゴリ別に整理されています。
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          すべて
        </button>
        {categoryKeys.map((key) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {categories[key].title}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {Object.entries(filteredCategories).map(([key, category]) => (
        <div key={key} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
            {category.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="aspect-video bg-slate-100 relative">
                  <img
                    src={image.url}
                    alt={image.title}
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
                <div className="p-3">
                  <h3 className="font-medium text-slate-800 mb-1">{image.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{image.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">{selectedImage.title}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full max-h-[60vh] object-contain bg-slate-100 rounded-lg"
                />
                {selectedImage.source && (
                  <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                    出典: {selectedImage.source}
                  </span>
                )}
              </div>
              <p className="mt-4 text-slate-700">{selectedImage.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  画像を新しいタブで開く
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Attribution */}
      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
        <h3 className="font-medium text-slate-700 mb-2">画像ソース</h3>
        <ul className="space-y-1">
          <li>• <a href={imagesData.sources.plonkit} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Plonkit</a> - GeoGuessr攻略情報</li>
          <li>• <a href={imagesData.sources.geotips} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GeoTips</a> - 地域別Tips</li>
          <li>• <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Wikimedia Commons</a> - 参考画像</li>
        </ul>
      </div>
    </div>
  )
}
