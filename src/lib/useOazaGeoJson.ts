'use client'

import { useState, useEffect } from 'react'

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
