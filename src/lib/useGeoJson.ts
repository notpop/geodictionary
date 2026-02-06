'use client'

import { useState, useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoJsonData = any

const cache = new Map<string, GeoJsonData>()

export function useGeoJson(prefCode: string | null) {
  const [data, setData] = useState<GeoJsonData | null>(
    prefCode ? cache.get(prefCode) ?? null : null
  )
  const [loading, setLoading] = useState(!data && !!prefCode)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prefCode) {
      setData(null)
      setLoading(false)
      return
    }

    const cached = cache.get(prefCode)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/data/geojson/${prefCode}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        cache.set(prefCode, json)
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [prefCode])

  return { data, loading, error }
}
