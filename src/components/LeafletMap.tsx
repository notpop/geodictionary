'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LeafletMapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson: any
  onFeatureClick?: (name: string) => void
  highlightedName?: string | null
  wrongName?: string | null
  interactive?: boolean
  className?: string
}

export default function LeafletMap({
  geojson,
  onFeatureClick,
  highlightedName,
  wrongName,
  interactive = true,
  className = '',
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null)

  const getStyle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (feature: any) => {
      const name = feature?.properties?.name
      if (name === highlightedName) {
        return { fillColor: '#22c55e', fillOpacity: 0.6, color: '#16a34a', weight: 2 }
      }
      if (name === wrongName) {
        return { fillColor: '#ef4444', fillOpacity: 0.6, color: '#dc2626', weight: 2 }
      }
      return {
        fillColor: '#e2e8f0',
        fillOpacity: 0.4,
        color: '#64748b',
        weight: 1,
      }
    },
    [highlightedName, wrongName]
  )

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 18,
    }).addTo(map)

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
            onFeatureClick(feature.properties.name)
          })
        }
      },
    }).addTo(map)

    geojsonLayerRef.current = layer

    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [10, 10] })
    }
  }, [geojson, getStyle, interactive, onFeatureClick])

  // Update styles when highlight changes
  useEffect(() => {
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.setStyle(getStyle)
    }
  }, [getStyle])

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: 200 }}
    />
  )
}
