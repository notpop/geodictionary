'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
  zoomable?: boolean
}

// Parse the original viewBox
const [VB_X, VB_Y, VB_W, VB_H] = mapData.viewBox.split(' ').map(Number)

// lat/lng → SVG座標変換（投影メタデータ使用）
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const proj = mapData.projection

  if (lat < 29 && lng < 130) {
    const oki = proj.okinawa
    const x = oki.offsetX + oki.w / 2 + (lng - oki.midLng) * oki.scale
    const y = oki.offsetY + oki.h / 2 - (lat - oki.midLat) * oki.scale
    return { x, y }
  }

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

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
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
  zoomable = false,
}: JapanMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [hoveredName, setHoveredName] = useState<string>('')

  // Zoom/pan state (viewBox)
  const [vb, setVb] = useState({ x: VB_X, y: VB_Y, w: VB_W, h: VB_H })
  const svgRef = useRef<SVGSVGElement>(null)
  const touchRef = useRef<{
    startDist: number
    startVb: { x: number; y: number; w: number; h: number }
    startMid: { x: number; y: number }
    lastTap: number
    isPinching: boolean
    startTouch: { x: number; y: number }
  }>({
    startDist: 0,
    startVb: { x: VB_X, y: VB_Y, w: VB_W, h: VB_H },
    startMid: { x: 0, y: 0 },
    lastTap: 0,
    isPinching: false,
    startTouch: { x: 0, y: 0 },
  })
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; startVb: typeof vb; moved: boolean }>({
    dragging: false, startX: 0, startY: 0, startVb: vb, moved: false,
  })

  const isZoomed = vb.w < VB_W * 0.95

  const sizeClasses: Record<string, string> = {
    sm: 'w-full max-w-[200px]',
    md: 'w-full max-w-[320px]',
    lg: 'w-full max-w-[480px]',
    full: 'w-full',
  }

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const sx = (clientX - rect.left) / rect.width
    const sy = (clientY - rect.top) / rect.height
    return { x: vb.x + sx * vb.w, y: vb.y + sy * vb.h }
  }, [vb])

  const zoomTo = useCallback((factor: number, cx?: number, cy?: number) => {
    setVb((prev) => {
      const newW = clamp(prev.w * factor, VB_W * 0.15, VB_W)
      const newH = clamp(prev.h * factor, VB_H * 0.15, VB_H)
      const focusX = cx ?? (prev.x + prev.w / 2)
      const focusY = cy ?? (prev.y + prev.h / 2)
      const ratioX = (focusX - prev.x) / prev.w
      const ratioY = (focusY - prev.y) / prev.h
      let newX = focusX - ratioX * newW
      let newY = focusY - ratioY * newH
      // Clamp to bounds
      newX = clamp(newX, VB_X - newW * 0.1, VB_X + VB_W - newW * 0.9)
      newY = clamp(newY, VB_Y - newH * 0.1, VB_Y + VB_H - newH * 0.9)
      return { x: newX, y: newY, w: newW, h: newH }
    })
  }, [])

  const resetZoom = useCallback(() => {
    setVb({ x: VB_X, y: VB_Y, w: VB_W, h: VB_H })
  }, [])

  // Touch handlers for zoom/pan
  useEffect(() => {
    if (!zoomable) return
    const svg = svgRef.current
    if (!svg) return

    const getTouchDist = (t: TouchList) => {
      const dx = t[1].clientX - t[0].clientX
      const dy = t[1].clientY - t[0].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const getTouchMid = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    })

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        touchRef.current.isPinching = true
        touchRef.current.startDist = getTouchDist(e.touches)
        touchRef.current.startVb = { ...vb }
        const mid = getTouchMid(e.touches)
        touchRef.current.startMid = mid
      } else if (e.touches.length === 1 && isZoomed) {
        // Check for double-tap
        const now = Date.now()
        if (now - touchRef.current.lastTap < 300) {
          e.preventDefault()
          const svgPt = screenToSvg(e.touches[0].clientX, e.touches[0].clientY)
          if (vb.w < VB_W * 0.5) {
            resetZoom()
          } else {
            zoomTo(0.4, svgPt.x, svgPt.y)
          }
          touchRef.current.lastTap = 0
          return
        }
        touchRef.current.lastTap = now

        // Start drag
        dragRef.current = {
          dragging: true,
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startVb: { ...vb },
          moved: false,
        }
      } else if (e.touches.length === 1 && !isZoomed) {
        // Double-tap to zoom in
        const now = Date.now()
        if (now - touchRef.current.lastTap < 300) {
          e.preventDefault()
          const svgPt = screenToSvg(e.touches[0].clientX, e.touches[0].clientY)
          zoomTo(0.4, svgPt.x, svgPt.y)
          touchRef.current.lastTap = 0
          return
        }
        touchRef.current.lastTap = now
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchRef.current.isPinching) {
        e.preventDefault()
        const dist = getTouchDist(e.touches)
        const scale = touchRef.current.startDist / dist
        const sv = touchRef.current.startVb
        const newW = clamp(sv.w * scale, VB_W * 0.15, VB_W)
        const newH = clamp(sv.h * scale, VB_H * 0.15, VB_H)

        const rect = svg.getBoundingClientRect()
        const mid = touchRef.current.startMid
        const sx = (mid.x - rect.left) / rect.width
        const sy = (mid.y - rect.top) / rect.height
        const focusX = sv.x + sx * sv.w
        const focusY = sv.y + sy * sv.h
        let newX = focusX - sx * newW
        let newY = focusY - sy * newH
        newX = clamp(newX, VB_X - newW * 0.1, VB_X + VB_W - newW * 0.9)
        newY = clamp(newY, VB_Y - newH * 0.1, VB_Y + VB_H - newH * 0.9)
        setVb({ x: newX, y: newY, w: newW, h: newH })
      } else if (e.touches.length === 1 && dragRef.current.dragging) {
        const dx = e.touches[0].clientX - dragRef.current.startX
        const dy = e.touches[0].clientY - dragRef.current.startY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragRef.current.moved = true
        }
        if (dragRef.current.moved) {
          e.preventDefault()
          const rect = svg.getBoundingClientRect()
          const sv = dragRef.current.startVb
          const svgDx = -(dx / rect.width) * sv.w
          const svgDy = -(dy / rect.height) * sv.h
          let newX = sv.x + svgDx
          let newY = sv.y + svgDy
          newX = clamp(newX, VB_X - sv.w * 0.1, VB_X + VB_W - sv.w * 0.9)
          newY = clamp(newY, VB_Y - sv.h * 0.1, VB_Y + VB_H - sv.h * 0.9)
          setVb({ x: newX, y: newY, w: sv.w, h: sv.h })
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchRef.current.isPinching = false
      }
      if (e.touches.length === 0) {
        dragRef.current.dragging = false
      }
    }

    svg.addEventListener('touchstart', onTouchStart, { passive: false })
    svg.addEventListener('touchmove', onTouchMove, { passive: false })
    svg.addEventListener('touchend', onTouchEnd)

    return () => {
      svg.removeEventListener('touchstart', onTouchStart)
      svg.removeEventListener('touchmove', onTouchMove)
      svg.removeEventListener('touchend', onTouchEnd)
    }
  }, [zoomable, vb, isZoomed, screenToSvg, zoomTo, resetZoom])

  const handleClick = useCallback(
    (code: string) => {
      // Don't fire click if we just dragged or pinched
      if (dragRef.current.moved) return
      if (touchRef.current.isPinching) return
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

  const viewBox = zoomable
    ? `${vb.x} ${vb.y} ${vb.w} ${vb.h}`
    : mapData.viewBox

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto ${className}`}>
      {/* Tooltip */}
      {hoveredName && interactive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-3 py-1 rounded-full z-10 pointer-events-none animate-fade-in">
          {hoveredName}
        </div>
      )}

      {/* Zoom hint */}
      {zoomable && !isZoomed && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 pointer-events-none">
          ピンチで拡大 / ダブルタップ
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-auto gpu"
        style={{ touchAction: zoomable ? 'none' : 'manipulation' }}
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
            strokeWidth={isZoomed ? 0.5 : 1}
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
            onTouchEnd={() => {
              // Clear hover after touch to avoid sticky highlight
              setTimeout(() => {
                setHoveredCode(null)
                setHoveredName('')
              }, 300)
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
              fontSize={isZoomed ? Math.max(6, 10 * (vb.w / VB_W)) : 10}
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
