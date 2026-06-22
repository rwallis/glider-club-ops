import { useEffect, useState } from 'react'
import { fetchFieldWeather, type FieldWeather } from '../services/openMeteo'

const REFRESH_MS = 10 * 60 * 1000

export function useFieldWeather() {
  const [weather, setWeather] = useState<FieldWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setError(null)
        const data = await fetchFieldWeather()
        if (!cancelled) setWeather(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Weather unavailable')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const timer = window.setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return { weather, loading, error }
}
