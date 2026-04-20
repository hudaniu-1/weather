import { useCallback, useEffect, useMemo, useState } from 'react'

type GeoStatus = 'idle' | 'loading' | 'success' | 'error' | 'denied' | 'unavailable'

export type GeoPosition = {
  lat: number
  lon: number
  accuracy?: number
}

export type UseGeolocationState = {
  status: GeoStatus
  position: GeoPosition | null
  errorMessage: string | null
  request: () => void
}

export function useGeolocation(opts: { enableHighAccuracy?: boolean; timeoutMs?: number } = {}) {
  const [status, setStatus] = useState<GeoStatus>('idle')
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      setErrorMessage('当前浏览器不支持定位')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setStatus('success')
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied')
          setErrorMessage('定位权限被拒绝，可手动搜索城市')
          return
        }
        setStatus('error')
        setErrorMessage(err.message || '定位失败')
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy ?? false,
        timeout: opts.timeoutMs ?? 8000,
      },
    )
  }, [opts.enableHighAccuracy, opts.timeoutMs])

  // Auto-request once on mount.
  useEffect(() => {
    request()
  }, [request])

  return useMemo<UseGeolocationState>(
    () => ({ status, position, errorMessage, request }),
    [status, position, errorMessage, request],
  )
}

