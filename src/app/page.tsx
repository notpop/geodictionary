import Link from 'next/link'
import CategoryCard from '@/components/CategoryCard'
import commonTips from '@/data/common-tips.json'
import infrastructure from '@/data/infrastructure.json'
import powerCompanies from '@/data/power-companies.json'
import regions from '@/data/regions.json'
import curriculum from '@/data/curriculum.json'

export default function Home() {
  const categories = [
    {
      title: '共通知識',
      description: '日本を識別するための基本的なTips。左側通行、ナンバープレート、市外局番など。',
      href: '/common',
      icon: '📚',
      tipCount: commonTips.tips.length,
    },
    {
      title: 'インフラストラクチャ',
      description: '電柱、道路標識、ガードレール、ボラードなどインフラの見分け方。',
      href: '/infrastructure',
      icon: '🔌',
      tipCount: infrastructure.tips.length,
    },
    {
      title: '電力会社別電柱',
      description: '10電力会社の電柱プレートの特徴。電柱を見れば地域がわかる。',
      href: '/power-companies',
      icon: '⚡',
      tipCount: powerCompanies.companies.length,
    },
    {
      title: '地域別Tips',
      description: '北海道から沖縄まで、各地域の特徴的な景観や設備。',
      href: '/regions',
      icon: '🗾',
      tipCount: regions.regions.length,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          GeoGuessr 日本完全攻略ガイド
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          日本マップで高得点を取るための完全な知識を体系的に学べます。
          カリキュラムを順番に進めれば、あらゆる場所を特定できるようになります。
        </p>
      </section>

      {/* Main CTAs */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/municipalities" className="block sm:col-span-2">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl p-6 hover:shadow-lg transition-shadow active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🗺️</span>
              <div>
                <h2 className="font-bold text-xl">市区町村マスター</h2>
                <p className="text-violet-100 text-sm mt-1">
                  全1,900+市区町村を地図で覚える
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/learn" className="block">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-6 h-full hover:shadow-lg transition-shadow active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📖</span>
              <div>
                <h2 className="font-bold text-xl">学習カリキュラム</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {curriculum.levels.length}レベル・{curriculum.totalModules}モジュールで体系的に学ぶ
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/quiz" className="block">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 h-full hover:shadow-lg transition-shadow active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎯</span>
              <div>
                <h2 className="font-bold text-xl">クイズで確認</h2>
                <p className="text-amber-100 text-sm mt-1">
                  200問以上のクイズで知識をテスト
                </p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">クイックスタート</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
            <p className="text-slate-700">
              <strong>左側通行</strong>を確認 → 日本・香港・インドネシアの一部のみ
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
            <p className="text-slate-700">
              <strong>電柱のプレート</strong>を確認 → 電力会社で地域を絞り込み
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
            <p className="text-slate-700">
              <strong>青い案内標識</strong>を探す → 地名と道路番号を確認
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
            <p className="text-slate-700">
              <strong>地域特有の特徴</strong>を探す → 赤い屋根、黄色いガードレールなど
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">カテゴリ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.href} {...category} />
          ))}
        </div>
      </section>

      <section className="bg-amber-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-amber-800 mb-3">重要ポイント</h2>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span>⚡</span>
            <span><strong>電柱プレート</strong>は最も確実な地域判定方法。電力会社ごとにデザインが異なる。</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🏔️</span>
            <span><strong>北海道</strong>は赤白矢印（スノーポール）でほぼ確定。巨大フキも目印。</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🏠</span>
            <span><strong>沖縄</strong>は白いコンクリート建物とシーサーで確定。電柱プレートも独特。</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🟡</span>
            <span><strong>山口県</strong>のみ黄色いガードレール。見つけたら山口確定。</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
