'use client'

import { useState, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoJsonData = any

const cache = new Map<string, GeoJsonData>()

export function useOazaGeoJson(muniCode: string | null) {
  const [data, setData] = useState<GeoJsonData | null>(
    muniCode ? cache.get(muniCode) ?? null : null
  )
  const [loading, setLoading] = useState(!data && !!muniCode)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!muniCode) {
      setData(null)
      setLoading(false)
      return
    }

    const cached = cache.get(muniCode)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/data/oaza/${muniCode}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        cache.set(muniCode, json)
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
  }, [muniCode])

  return { data, loading, error }
}

// meta.json: { muniCode: oazaCount }
type OazaMeta = Record<string, number>

let metaCache: OazaMeta | null = null

export function useOazaMeta() {
  const [data, setData] = useState<OazaMeta | null>(metaCache)
  const [loading, setLoading] = useState(!metaCache)

  useEffect(() => {
    if (metaCache) {
      setData(metaCache)
      setLoading(false)
      return
    }

    let cancelled = false
    fetch('/data/oaza/meta.json')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        metaCache = json
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}

// 県単位で全市区町村の大字GeoJSONをバッチ取得・マージ
const prefOazaCache = new Map<string, GeoJsonData>()

export function usePrefectureOaza(
  prefCode: string | null,
  muniCodes: string[]
) {
  const [data, setData] = useState<GeoJsonData | null>(
    prefCode ? prefOazaCache.get(prefCode) ?? null : null
  )
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!prefCode || muniCodes.length === 0) {
      setData(null)
      setLoading(false)
      return
    }

    const cached = prefOazaCache.get(prefCode)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    cancelledRef.current = false
    setLoading(true)
    setProgress({ loaded: 0, total: muniCodes.length })

    // Fetch all oaza files in parallel
    let loaded = 0
    Promise.all(
      muniCodes.map((code) => {
        // Use individual cache first
        const ind = cache.get(code)
        if (ind) {
          loaded++
          if (!cancelledRef.current) setProgress({ loaded, total: muniCodes.length })
          return Promise.resolve(ind)
        }
        return fetch(`/data/oaza/${code}.json`)
          .then((res) => {
            if (!res.ok) return null
            return res.json()
          })
          .then((json) => {
            if (json) cache.set(code, json)
            loaded++
            if (!cancelledRef.current) setProgress({ loaded, total: muniCodes.length })
            return json
          })
          .catch(() => {
            loaded++
            if (!cancelledRef.current) setProgress({ loaded, total: muniCodes.length })
            return null
          })
      })
    ).then((results) => {
      if (cancelledRef.current) return
      // Merge all features into one FeatureCollection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allFeatures: any[] = []
      for (const result of results) {
        if (result?.features) {
          allFeatures.push(...result.features)
        }
      }
      const merged = { type: 'FeatureCollection', features: allFeatures }
      prefOazaCache.set(prefCode, merged)
      setData(merged)
      setLoading(false)
    })

    return () => {
      cancelledRef.current = true
    }
  }, [prefCode, muniCodes.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, progress }
}
