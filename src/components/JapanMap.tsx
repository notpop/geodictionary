'use client'

import { useState, useCallback, useMemo } from 'react'
import mapData from '@/data/japan-map-paths.json'

interface Marker {
  lat: number
  lng: number
  label?: string
}

interface JapanMapProps {
  highlightedPrefecture?: string
  correctPrefecture?: string
  wrongPrefecture?: string
  onPrefectureClick?: (code: string) => void
  interactive?: boolean
  markers?: Marker[]
  prefectureColors?: Record<string, string>
  size?: 'sm' | 'md' | 'lg' | 'full'
  showLabels?: boolean
  className?: string
}

// lat/lng → SVG座標変換（投影メタデータ使用）
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const proj = mapData.projection

  // 沖縄判定: lat < 29 かつ lng < 130
  if (lat < 29 && lng < 130) {
    const oki = proj.okinawa
    const x = oki.offsetX + oki.w / 2 + (lng - oki.midLng) * oki.scale
    const y = oki.offsetY + oki.h / 2 - (lat - oki.midLat) * oki.scale
    return { x, y }
  }

  // 本土
  const main = proj.main
  const x = main.cx + (lng - main.midLng) * main.scale
  const y = main.cy - (lat - main.midLat) * main.scale
  return { x, y }
}

function getPrefFill(
  code: string,
  correctPrefecture?: string,
  wrongPrefecture?: string,
  highlightedPrefecture?: string,
  prefectureColors?: Record<string, string>,
  hoveredCode?: string | null
): string {
  if (code === correctPrefecture) return '#22c55e'
  if (code === wrongPrefecture) return '#ef4444'
  if (code === highlightedPrefecture) return '#3b82f6'
  if (prefectureColors?.[code]) return prefectureColors[code]
  if (code === hoveredCode) return '#bfdbfe'
  return '#e2e8f0'
}

export default function JapanMap({
  highlightedPrefecture,
  correctPrefecture,
  wrongPrefecture,
  onPrefectureClick,
  interactive = false,
  markers = [],
  prefectureColors,
  size = 'md',
  showLabels = false,
  className = '',
}: JapanMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [hoveredName, setHoveredName] = useState<string>('')

  const sizeClasses: Record<string, string> = {
    sm: 'w-full max-w-[200px]',
    md: 'w-full max-w-[320px]',
    lg: 'w-full max-w-[480px]',
    full: 'w-full',
  }

  const handleClick = useCallback(
    (code: string) => {
      if (interactive && onPrefectureClick) {
        onPrefectureClick(code)
      }
    },
    [interactive, onPrefectureClick]
  )

  const svgMarkers = useMemo(
    () =>
      markers.map((m, i) => {
        const pos = geoToSvg(m.lat, m.lng)
        return { ...m, ...pos, key: i }
      }),
    [markers]
  )

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto ${className}`}>
      {/* Tooltip */}
      {hoveredName && interactive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-3 py-1 rounded-full z-10 pointer-events-none animate-fade-in">
          {hoveredName}
        </div>
      )}

      <svg
        viewBox={mapData.viewBox}
        className="w-full h-auto gpu"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Prefecture paths */}
        {mapData.prefectures.map((pref) => (
          <path
            key={pref.code}
            d={pref.path}
            data-code={pref.code}
            className={`prefecture-path ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
            fill={getPrefFill(
              pref.code,
              correctPrefecture,
              wrongPrefecture,
              highlightedPrefecture,
              prefectureColors,
              hoveredCode
            )}
            stroke="#94a3b8"
            strokeWidth="1"
            onClick={() => handleClick(pref.code)}
            onMouseEnter={() => {
              if (interactive) {
                setHoveredCode(pref.code)
                setHoveredName(pref.name)
              }
            }}
            onMouseLeave={() => {
              setHoveredCode(null)
              setHoveredName('')
            }}
            onTouchStart={() => {
              if (interactive) {
                setHoveredCode(pref.code)
                setHoveredName(pref.name)
              }
            }}
          />
        ))}

        {/* Prefecture labels */}
        {showLabels &&
          mapData.prefectures.map((pref) => (
            <text
              key={`label-${pref.code}`}
              x={pref.labelX}
              y={pref.labelY}
              textAnchor="middle"
              className="pointer-events-none"
              fill="#475569"
              fontSize="10"
              fontWeight="500"
            >
              {pref.name}
            </text>
          ))}

        {/* Markers */}
        {svgMarkers.map((m) => (
          <g key={m.key} className="map-marker animate-fade-in-scale">
            <circle cx={m.x} cy={m.y} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            {m.label && (
              <text
                x={m.x}
                y={m.y - 12}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="9"
                fontWeight="bold"
                className="pointer-events-none"
              >
                <tspan
                  fill="white"
                  stroke="white"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {m.label}
                </tspan>
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
