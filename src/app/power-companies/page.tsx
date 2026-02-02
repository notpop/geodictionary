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
          <ruby>電力会社別<rp>(</rp><rt>でんりょくがいしゃべつ</rt><rp>)</rp></ruby>
          <ruby>電柱<rp>(</rp><rt>でんちゅう</rt><rp>)</rp></ruby>
        </h1>
        <p className="text-slate-600">
          10<ruby>電力会社<rp>(</rp><rt>でんりょくがいしゃ</rt><rp>)</rp></ruby>の
          <ruby>電柱<rp>(</rp><rt>でんちゅう</rt><rp>)</rp></ruby>プレートの
          <ruby>見分<rp>(</rp><rt>みわ</rt><rp>)</rp></ruby>け<ruby>方<rp>(</rp><rt>かた</rt><rp>)</rp></ruby>。
          プレートを<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>れば
          <ruby>地域<rp>(</rp><rt>ちいき</rt><rp>)</rp></ruby>を
          <ruby>特定<rp>(</rp><rt>とくてい</rt><rp>)</rp></ruby>できる。
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
        <h2 className="font-bold text-slate-800 mb-3">
          <ruby>管轄地域<rp>(</rp><rt>かんかつちいき</rt><rp>)</rp></ruby>マップ
        </h2>
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <span className="font-medium text-blue-800"><ruby>北海道電力<rp>(</rp><rt>ほっかいどうでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-blue-600 text-xs"><ruby>北海道<rp>(</rp><rt>ほっかいどう</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <span className="font-medium text-green-800"><ruby>東北電力<rp>(</rp><rt>とうほくでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-green-600 text-xs"><ruby>青森<rp>(</rp><rt>あおもり</rt><rp>)</rp></ruby>・<ruby>岩手<rp>(</rp><rt>いわて</rt><rp>)</rp></ruby>・<ruby>宮城<rp>(</rp><rt>みやぎ</rt><rp>)</rp></ruby>・<ruby>秋田<rp>(</rp><rt>あきた</rt><rp>)</rp></ruby>・<ruby>山形<rp>(</rp><rt>やまがた</rt><rp>)</rp></ruby>・<ruby>福島<rp>(</rp><rt>ふくしま</rt><rp>)</rp></ruby>・<ruby>新潟<rp>(</rp><rt>にいがた</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <span className="font-medium text-orange-800"><ruby>東京電力<rp>(</rp><rt>とうきょうでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-orange-600 text-xs"><ruby>茨城<rp>(</rp><rt>いばらき</rt><rp>)</rp></ruby>・<ruby>栃木<rp>(</rp><rt>とちぎ</rt><rp>)</rp></ruby>・<ruby>群馬<rp>(</rp><rt>ぐんま</rt><rp>)</rp></ruby>・<ruby>埼玉<rp>(</rp><rt>さいたま</rt><rp>)</rp></ruby>・<ruby>千葉<rp>(</rp><rt>ちば</rt><rp>)</rp></ruby>・<ruby>東京<rp>(</rp><rt>とうきょう</rt><rp>)</rp></ruby>・<ruby>神奈川<rp>(</rp><rt>かながわ</rt><rp>)</rp></ruby>・<ruby>山梨<rp>(</rp><rt>やまなし</rt><rp>)</rp></ruby>・<ruby>静岡<rp>(</rp><rt>しずおか</rt><rp>)</rp></ruby>(<ruby>東部<rp>(</rp><rt>とうぶ</rt><rp>)</rp></ruby>)</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <span className="font-medium text-yellow-800"><ruby>中部電力<rp>(</rp><rt>ちゅうぶでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-yellow-600 text-xs"><ruby>愛知<rp>(</rp><rt>あいち</rt><rp>)</rp></ruby>・<ruby>岐阜<rp>(</rp><rt>ぎふ</rt><rp>)</rp></ruby>・<ruby>三重<rp>(</rp><rt>みえ</rt><rp>)</rp></ruby>・<ruby>長野<rp>(</rp><rt>ながの</rt><rp>)</rp></ruby>・<ruby>静岡<rp>(</rp><rt>しずおか</rt><rp>)</rp></ruby>(<ruby>西部<rp>(</rp><rt>せいぶ</rt><rp>)</rp></ruby>)</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <span className="font-medium text-purple-800"><ruby>北陸電力<rp>(</rp><rt>ほくりくでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-purple-600 text-xs"><ruby>富山<rp>(</rp><rt>とやま</rt><rp>)</rp></ruby>・<ruby>石川<rp>(</rp><rt>いしかわ</rt><rp>)</rp></ruby>・<ruby>福井<rp>(</rp><rt>ふくい</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <span className="font-medium text-red-800"><ruby>関西電力<rp>(</rp><rt>かんさいでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-red-600 text-xs"><ruby>滋賀<rp>(</rp><rt>しが</rt><rp>)</rp></ruby>・<ruby>京都<rp>(</rp><rt>きょうと</rt><rp>)</rp></ruby>・<ruby>大阪<rp>(</rp><rt>おおさか</rt><rp>)</rp></ruby>・<ruby>兵庫<rp>(</rp><rt>ひょうご</rt><rp>)</rp></ruby>・<ruby>奈良<rp>(</rp><rt>なら</rt><rp>)</rp></ruby>・<ruby>和歌山<rp>(</rp><rt>わかやま</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-teal-50 p-2 rounded-lg">
              <span className="font-medium text-teal-800"><ruby>中国電力<rp>(</rp><rt>ちゅうごくでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-teal-600 text-xs"><ruby>広島<rp>(</rp><rt>ひろしま</rt><rp>)</rp></ruby>・<ruby>岡山<rp>(</rp><rt>おかやま</rt><rp>)</rp></ruby>・<ruby>山口<rp>(</rp><rt>やまぐち</rt><rp>)</rp></ruby>・<ruby>鳥取<rp>(</rp><rt>とっとり</rt><rp>)</rp></ruby>・<ruby>島根<rp>(</rp><rt>しまね</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg">
              <span className="font-medium text-amber-800"><ruby>四国電力<rp>(</rp><rt>しこくでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-amber-600 text-xs"><ruby>香川<rp>(</rp><rt>かがわ</rt><rp>)</rp></ruby>・<ruby>徳島<rp>(</rp><rt>とくしま</rt><rp>)</rp></ruby>・<ruby>愛媛<rp>(</rp><rt>えひめ</rt><rp>)</rp></ruby>・<ruby>高知<rp>(</rp><rt>こうち</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-pink-50 p-2 rounded-lg">
              <span className="font-medium text-pink-800"><ruby>九州電力<rp>(</rp><rt>きゅうしゅうでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-pink-600 text-xs"><ruby>福岡<rp>(</rp><rt>ふくおか</rt><rp>)</rp></ruby>・<ruby>佐賀<rp>(</rp><rt>さが</rt><rp>)</rp></ruby>・<ruby>長崎<rp>(</rp><rt>ながさき</rt><rp>)</rp></ruby>・<ruby>熊本<rp>(</rp><rt>くまもと</rt><rp>)</rp></ruby>・<ruby>大分<rp>(</rp><rt>おおいた</rt><rp>)</rp></ruby>・<ruby>宮崎<rp>(</rp><rt>みやざき</rt><rp>)</rp></ruby>・<ruby>鹿児島<rp>(</rp><rt>かごしま</rt><rp>)</rp></ruby></p>
            </div>
            <div className="bg-cyan-50 p-2 rounded-lg">
              <span className="font-medium text-cyan-800"><ruby>沖縄電力<rp>(</rp><rt>おきなわでんりょく</rt><rp>)</rp></ruby></span>
              <p className="text-cyan-600 text-xs"><ruby>沖縄<rp>(</rp><rt>おきなわ</rt><rp>)</rp></ruby></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <h2 className="font-bold text-blue-800 mb-2">
          <ruby>電柱<rp>(</rp><rt>でんちゅう</rt><rp>)</rp></ruby>プレートの
          <ruby>見方<rp>(</rp><rt>みかた</rt><rp>)</rp></ruby>
        </h2>
        <p className="text-sm text-blue-700">
          <ruby>日本<rp>(</rp><rt>にほん</rt><rp>)</rp></ruby>には10の
          <ruby>電力会社<rp>(</rp><rt>でんりょくがいしゃ</rt><rp>)</rp></ruby>があり、それぞれ
          <ruby>管轄地域<rp>(</rp><rt>かんかつちいき</rt><rp>)</rp></ruby>が
          <ruby>決<rp>(</rp><rt>き</rt><rp>)</rp></ruby>まっています。
          <ruby>電柱<rp>(</rp><rt>でんちゅう</rt><rp>)</rp></ruby>のプレートを
          <ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>れば、どの
          <ruby>電力会社<rp>(</rp><rt>でんりょくがいしゃ</rt><rp>)</rp></ruby>かわかり、
          <ruby>地域<rp>(</rp><rt>ちいき</rt><rp>)</rp></ruby>を
          <ruby>絞<rp>(</rp><rt>しぼ</rt><rp>)</rp></ruby>り
          <ruby>込<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>めます。
        </p>
      </div>

      <SearchBar onSearch={setSearchQuery} placeholder="電力会社名(でんりょくがいしゃめい)、地域名(ちいきめい)で検索..." />

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>{filteredCompanies.length} <ruby>社<rp>(</rp><rt>しゃ</rt><rp>)</rp></ruby></span>
        {searchQuery && (
          <span className="bg-slate-100 px-2 py-0.5 rounded">
            「{searchQuery}」で<ruby>検索中<rp>(</rp><rt>けんさくちゅう</rt><rp>)</rp></ruby>
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
                        <ruby>重要<rp>(</rp><rt>じゅうよう</rt><rp>)</rp></ruby>
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
                    <h4 className="text-sm font-semibold text-slate-700 mb-2"><ruby>詳細<rp>(</rp><rt>しょうさい</rt><rp>)</rp></ruby></h4>
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
                    <h4 className="text-sm font-semibold text-slate-700 mb-1"><ruby>覚<rp>(</rp><rt>おぼ</rt><rp>)</rp></ruby>え<ruby>方<rp>(</rp><rt>かた</rt><rp>)</rp></ruby></h4>
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
          <p><ruby>該当<rp>(</rp><rt>がいとう</rt><rp>)</rp></ruby>する<ruby>電力会社<rp>(</rp><rt>でんりょくがいしゃ</rt><rp>)</rp></ruby>が<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>つかりませんでした</p>
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
                    <ruby>出典<rp>(</rp><rt>しゅってん</rt><rp>)</rp></ruby>: {selectedImage.source}
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
                  <ruby>画像<rp>(</rp><rt>がぞう</rt><rp>)</rp></ruby>を<ruby>新<rp>(</rp><rt>あたら</rt><rp>)</rp></ruby>しいタブで<ruby>開<rp>(</rp><rt>ひら</rt><rp>)</rp></ruby>く
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
