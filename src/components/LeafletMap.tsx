'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ラベルモード用パステルカラーパレット（隣接区域が区別しやすいよう多めに用意）
const LABEL_COLORS = [
  '#dbeafe', // blue-100
  '#fce7f3', // pink-100
  '#d1fae5', // emerald-100
  '#fef3c7', // amber-100
  '#e0e7ff', // indigo-100
  '#ffe4e6', // rose-100
  '#ccfbf1', // teal-100
  '#fef9c3', // yellow-100
  '#ede9fe', // violet-100
  '#ffedd5', // orange-100
  '#cffafe', // cyan-100
  '#f3e8ff', // purple-100
  '#dcfce7', // green-100
  '#fce4ec', // pink-50ish
  '#e8eaf6', // indigo-50ish
  '#fff3e0', // orange-50ish
]

interface LeafletMapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson: any
  onFeatureClick?: (name: string, code?: string) => void
  highlightedName?: string | null
  highlightedCode?: string | null
  wrongName?: string | null
  wrongCode?: string | null
  interactive?: boolean
  showLabels?: boolean
  readingMap?: Record<string, string>
  parentMap?: Record<string, string>
  className?: string
}

export default function LeafletMap({
  geojson,
  onFeatureClick,
  highlightedName,
  highlightedCode,
  wrongName,
  wrongCode,
  interactive = true,
  showLabels = false,
  readingMap,
  parentMap,
  className = '',
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null)

  const getStyle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (feature: any) => {
      const name = feature?.properties?.name
      const code = feature?.properties?.code
      const isHighlighted = highlightedCode ? code === highlightedCode : name === highlightedName
      const isWrong = wrongCode ? code === wrongCode : name === wrongName
      if (isHighlighted) {
        return { fillColor: '#22c55e', fillOpacity: 0.6, color: '#16a34a', weight: 2 }
      }
      if (isWrong) {
        return { fillColor: '#ef4444', fillOpacity: 0.6, color: '#dc2626', weight: 2 }
      }
      if (showLabels && code) {
        // codeのハッシュで色を割り当て（隣接が異なる色になるよう素数で散らす）
        const idx = (parseInt(code, 10) * 7) % LABEL_COLORS.length
        return {
          fillColor: LABEL_COLORS[idx],
          fillOpacity: 0.6,
          color: '#94a3b8',
          weight: 1.5,
        }
      }
      return {
        fillColor: '#ffffff',
        fillOpacity: 1,
        color: '#94a3b8',
        weight: 1.5,
      }
    },
    [highlightedName, highlightedCode, wrongName, wrongCode, showLabels]
  )

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      attributionControl: false,
      center: [36.5, 137.5],
      zoom: 5,
    })

    // Light basemap for geographic context (no labels - we add our own in Japanese)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)
    map.getContainer().style.backgroundColor = '#f0f4f8'

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [interactive])

  // Update GeoJSON layer
  useEffect(() => {
    const map = mapRef.current
    if (!map || !geojson) return

    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.remove()
    }

    const layer = L.geoJSON(geojson, {
      style: getStyle,
      onEachFeature: (feature, lyr) => {
        if (interactive && onFeatureClick) {
          lyr.on('click', () => {
            onFeatureClick(feature.properties.name, feature.properties.code)
          })
        }
        // Add Japanese labels from GeoJSON properties
        if (showLabels && feature.properties?.name) {
          const name = feature.properties.name
          const parent = parentMap?.[feature.properties.code]
          const reading = readingMap?.[name]
          let label = parent ? `${name}（${parent}）` : name
          if (reading) {
            label += `<br><span style="font-size:0.7em;opacity:0.7">${reading}</span>`
          }
          lyr.bindTooltip(label, {
            permanent: true,
            direction: 'center',
            className: 'leaflet-municipality-label',
          })
        }
      },
    }).addTo(map)

    geojsonLayerRef.current = layer

    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      map.invalidateSize()
      map.fitBounds(bounds, { padding: [8, 8], maxZoom: 16 })
      // Re-fit after layout settles (fixes expanded overlay sizing)
      const retryFit = () => {
        map.invalidateSize()
        map.fitBounds(bounds, { padding: [8, 8], maxZoom: 16 })
      }
      requestAnimationFrame(retryFit)
      setTimeout(retryFit, 100)
      setTimeout(retryFit, 300)
    }
  }, [geojson, getStyle, interactive, onFeatureClick, showLabels, readingMap, parentMap])

  // Update styles when highlight changes
  useEffect(() => {
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.setStyle(getStyle)
    }
  }, [getStyle])

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
    />
  )
}
