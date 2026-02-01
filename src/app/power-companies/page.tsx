'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import powerCompanies from '@/data/power-companies.json'

export default function PowerCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; source?: string } | null>(null)

  const filteredCompanies = powerCompanies.companies.filter((company) => {
    const query = searchQuery.toLowerCase()
    return (
      company.name.toLowerCase().includes(query) ||
      company.area.toLowerCase().includes(query) ||
      company.plateFeatures.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          電力会社別電柱
        </h1>
        <p className="text-slate-600">
          {powerCompanies.description}
        </p>
      </div>

      {/* Main Plate Image */}
      {powerCompanies.headerImages.map((img, index) => (
        <button
          key={index}
          onClick={() => setSelectedImage({ url: img.url, title: img.title, source: (img as { source?: string }).source })}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full text-left"
        >
          <div className="aspect-[2/1] bg-slate-100 relative">
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text fill="%2394a3b8" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">画像読込エラー</text></svg>'
              }}
            />
            {(img as { source?: string }).source && (
              <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                {(img as { source?: string }).source}
              </span>
            )}
          </div>
          <div className="p-4">
            <h2 className="font-bold text-slate-800">{img.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{img.description}</p>
          </div>
        </button>
      ))}

      {/* Service Area Map */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-slate-800 mb-3">管轄地域マップ</h2>
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <span className="font-medium text-blue-800">北海道電力</span>
              <p className="text-blue-600 text-xs">北海道</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <span className="font-medium text-green-800">東北電力</span>
              <p className="text-green-600 text-xs">青森・岩手・宮城・秋田・山形・福島・新潟</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <span className="font-medium text-orange-800">東京電力</span>
              <p className="text-orange-600 text-xs">茨城・栃木・群馬・埼玉・千葉・東京・神奈川・山梨・静岡(東部)</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <span className="font-medium text-yellow-800">中部電力</span>
              <p className="text-yellow-600 text-xs">愛知・岐阜・三重・長野・静岡(西部)</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="font-medium text-purple-800">北陸電力</span>
              <p className="text-purple-600 text-xs">富山・石川・福井</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <span className="font-medium text-red-800">関西電力</span>
              <p className="text-red-600 text-xs">滋賀・京都・大阪・兵庫・奈良・和歌山</p>
            </div>
            <div className="bg-teal-50 p-2 rounded-lg">
              <span className="font-medium text-teal-800">中国電力</span>
              <p className="text-teal-600 text-xs">広島・岡山・山口・鳥取・島根</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg">
              <span className="font-medium text-amber-800">四国電力</span>
              <p className="text-amber-600 text-xs">香川・徳島・愛媛・高知</p>
            </div>
            <div className="bg-pink-50 p-2 rounded-lg">
              <span className="font-medium text-pink-800">九州電力</span>
              <p className="text-pink-600 text-xs">福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島</p>
            </div>
            <div className="bg-cyan-50 p-2 rounded-lg">
              <span className="font-medium text-cyan-800">沖縄電力</span>
              <p className="text-cyan-600 text-xs">沖縄</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <h2 className="font-bold text-blue-800 mb-2">電柱プレートの見方</h2>
        <p className="text-sm text-blue-700">
          日本には10の電力会社があり、それぞれ管轄地域が決まっています。
          電柱のプレートを見れば、どの電力会社かわかり、地域を絞り込めます。
        </p>
      </div>

      <SearchBar onSearch={setSearchQuery} placeholder="電力会社名、地域名で検索..." />

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>{filteredCompanies.length} 社</span>
        {searchQuery && (
          <span className="bg-slate-100 px-2 py-0.5 rounded">
            「{searchQuery}」で検索中
          </span>
        )}
      </div>

      <div className="space-y-4">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
              company.importance === 'high' ? 'border-l-4 border-l-yellow-500' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
              className="w-full text-left p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{company.name}</h3>
                    {company.importance === 'high' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        重要
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary mt-1">{company.area}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedId === company.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm mt-2">{company.plateFeatures}</p>
            </button>

            {expandedId === company.id && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">詳細</h4>
                    <ul className="space-y-1">
                      {company.details.map((detail, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">覚え方</h4>
                    <p className="text-sm text-slate-600">{company.tips}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>該当する電力会社が見つかりませんでした</p>
        </div>
      )}

      {/* Image Modal */}
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
                  className="w-full max-h-[70vh] object-contain bg-slate-100 rounded-lg"
                />
                {selectedImage.source && (
                  <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                    出典: {selectedImage.source}
                  </span>
                )}
              </div>
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
    </div>
  )
}
