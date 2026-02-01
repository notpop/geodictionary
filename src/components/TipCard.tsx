'use client'

import { useState } from 'react'
import ImageModal from './ImageModal'
import type { Tip } from '@/lib/types'

interface TipCardProps {
  tip: Tip
}

export default function TipCard({ tip }: TipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const importanceColors = {
    high: 'border-l-red-500 bg-red-50/50',
    medium: 'border-l-yellow-500 bg-yellow-50/50',
    low: 'border-l-slate-300 bg-white',
  }

  const importanceBadge = {
    high: { text: '重要', class: 'bg-red-100 text-red-700' },
    medium: { text: '参考', class: 'bg-yellow-100 text-yellow-700' },
    low: { text: '', class: '' },
  }

  return (
    <>
      <div
        className={`tip-card rounded-xl border-l-4 shadow-sm p-4 cursor-pointer ${
          importanceColors[tip.importance || 'low']
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-800">{tip.title}</h3>
              {tip.importance && tip.importance !== 'low' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${importanceBadge[tip.importance].class}`}>
                  {importanceBadge[tip.importance].text}
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {tip.description}
            </p>

            {tip.tags && tip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tip.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {tip.image && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(true)
              }}
              className="relative flex-shrink-0 w-20 h-20 bg-slate-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img
                src={tip.image}
                alt={tip.title}
                className="w-full h-full object-cover"
              />
              {tip.source && (
                <span className="absolute bottom-0 right-0 text-[8px] bg-black/60 text-white px-1 py-0.5 rounded-tl">
                  {tip.source}
                </span>
              )}
            </button>
          )}
        </div>

        {isExpanded && tip.details && tip.details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <ul className="space-y-2">
              {tip.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center mt-2">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {tip.image && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageSrc={tip.image}
          title={tip.title}
          source={tip.source}
        />
      )}
    </>
  )
}
