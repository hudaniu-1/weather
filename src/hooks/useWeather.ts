import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LatLon } from '../lib/owmClient'
import { geoReverse, getAirPollution, getCurrentWeather, getForecast } from '../lib/owmClient'
import type { OwmForecastItem } from '../lib/owmTypes'
import { readJson, writeJson } from '../lib/storage'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

export type City = {
  name: string
  lat: number
  lon: number
  country?: string
  state?: string
}

export type TwoHourPrecipApprox = {
  hour1Mm: number
  hour2Mm: number
  source: 'forecast_3h_split'
}

export type HourlyPoint = {
  dt: number
  label: string
  tempC: number
  icon?: string
  desc?: string
}

export type DailyRange = {
  dayLabel: string
  minC: number
  maxC: number
  icon?: string
  desc?: string
}

export type WeatherVM = {
  cityName: string
  pos: LatLon
  updatedAt: number

  // Home
  nowTempC: number
  nowDesc: string
  nowIcon?: string
  todayMinC: number
  todayMaxC: number
  aqi?: 1 | 2 | 3 | 4 | 5

  // Forecast
  twoHourPrecip?: TwoHourPrecipApprox
  nextHours: HourlyPoint[]
  next3Days: DailyRange[]

  // Details
  feelsLikeC: number
  windSpeedMps: number
  humidityPct: number
  visibilityM?: number
  sunriseUnix: number
  sunsetUnix: number
}

const LS_CITY_KEY = 'weather:last_city:v1'
const LS_CACHE_KEY = 'weather:last_vm:v1'
const LS_LOCATION_MODE_KEY = 'weather:location_mode:v1'

type LocationMode = 'auto' | 'manual'

function formatHourLabel(unix: number) {
  const d = new Date(unix * 1000)
  const h = d.getHours().toString().padStart(2, '0')
  return `${h}:00`
}

function formatDayLabel(unix: number) {
  const d = new Date(unix * 1000)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${m}/${day}`
}

function clampFinite(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback
}

function pickRepresentativeWeather(item: OwmForecastItem) {
  const w = item.weather?.[0]
  return { icon: w?.icon, desc: w?.description }
}

function buildDailyRanges(list: OwmForecastItem[]): DailyRange[] {
  const byDay = new Map<string, OwmForecastItem[]>()
  for (const it of list) {
    const dayKey = new Date(it.dt * 1000).toDateString()
    const arr = byDay.get(dayKey) ?? []
    arr.push(it)
    byDay.set(dayKey, arr)
  }

  const days = Array.from(byDay.values())
    .map((items) => items.sort((a, b) => a.dt - b.dt))
    .sort((a, b) => a[0]!.dt - b[0]!.dt)
    .slice(0, 3)

  return days.map((items) => {
    let minC = Number.POSITIVE_INFINITY
    let maxC = Number.NEGATIVE_INFINITY
    for (const it of items) {
      minC = Math.min(minC, it.main.temp_min)
      maxC = Math.max(maxC, it.main.temp_max)
    }

    const rep = items[Math.floor(items.length / 2)] ?? items[0]!
    const { icon, desc } = pickRepresentativeWeather(rep)
    return {
      dayLabel: formatDayLabel(items[0]!.dt),
      minC: clampFinite(minC),
      maxC: clampFinite(maxC),
      icon,
      desc,
    }
  })
}

function buildTwoHourPrecipApprox(firstForecast: OwmForecastItem | undefined): TwoHourPrecipApprox | undefined {
  if (!firstForecast) return undefined

  const rain3h = firstForecast.rain?.['3h'] ?? 0
  const snow3h = firstForecast.snow?.['3h'] ?? 0
  const total = clampFinite(rain3h + snow3h, 0)
  // Free forecast is 3-hour buckets. For UI only: split evenly into 3 hours, show first 2.
  const perHour = total / 3
  return { hour1Mm: perHour, hour2Mm: perHour, source: 'forecast_3h_split' }
}

function buildNextHours(list: OwmForecastItem[]): HourlyPoint[] {
  // 3-hour granularity: we still present as time points, not strict hourly.
  return list.slice(0, 5).map((it) => {
    const { icon, desc } = pickRepresentativeWeather(it)
    return {
      dt: it.dt,
      label: formatHourLabel(it.dt),
      tempC: clampFinite(it.main.temp),
      icon,
      desc,
    }
  })
}

export type UseWeatherResult = {
  status: LoadStatus
  vm: WeatherVM | null
  errorMessage: string | null
  city: City | null
  locationMode: LocationMode
  setCity: (city: City) => void
  useAutoLocation: () => void
  refresh: () => void
}

function readLocationMode(): LocationMode {
  const v = readJson<LocationMode>(LS_LOCATION_MODE_KEY)
  return v === 'manual' ? 'manual' : 'auto'
}

export function useWeather(pos: LatLon | null) {
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [vm, setVm] = useState<WeatherVM | null>(() => readJson<WeatherVM>(LS_CACHE_KEY))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [city, setCityState] = useState<City | null>(() => readJson<City>(LS_CITY_KEY))
  const [locationMode, setLocationMode] = useState<LocationMode>(() => readLocationMode())
  const lastPosKeyRef = useRef<string>('')

  /** After a successful weather fetch: cache coords/name only, do not switch to manual mode. */
  const syncCityCache = useCallback((c: City) => {
    setCityState(c)
    writeJson(LS_CITY_KEY, c)
  }, [])

  /** User picked a city in search: prefer that city over GPS until they choose "用定位". */
  const setCity = useCallback((c: City) => {
    setCityState(c)
    writeJson(LS_CITY_KEY, c)
    setLocationMode('manual')
    writeJson(LS_LOCATION_MODE_KEY, 'manual')
  }, [])

  const useAutoLocation = useCallback(() => {
    setLocationMode('auto')
    writeJson(LS_LOCATION_MODE_KEY, 'auto')
  }, [])

  const effectivePos: LatLon | null = useMemo(() => {
    if (locationMode === 'manual' && city) return { lat: city.lat, lon: city.lon }
    if (pos) return pos
    if (city) return { lat: city.lat, lon: city.lon }
    return null
  }, [locationMode, pos, city])

  const load = useCallback(async () => {
    if (!effectivePos) return
    const key = `${effectivePos.lat.toFixed(4)},${effectivePos.lon.toFixed(4)}`
    lastPosKeyRef.current = key

    setStatus('loading')
    setErrorMessage(null)

    try {
      // In parallel: current / forecast / AQI.
      const [current, forecast, air] = await Promise.all([
        getCurrentWeather(effectivePos),
        getForecast(effectivePos),
        getAirPollution(effectivePos),
      ])

      let apiCityLabel = current.name
      if (!apiCityLabel || apiCityLabel.trim().length === 0) {
        const rev = await geoReverse(effectivePos, 1)
        if (rev[0]?.name) apiCityLabel = rev[0].name
      }

      // Manual search uses Geo names (e.g. 宁波); OWM current weather often returns a finer
      // locality (e.g. Qiu'ai 邱隘). Prefer the label the user actually picked.
      const displayCityName =
        locationMode === 'manual' && city?.name?.trim()
          ? city.name.trim()
          : apiCityLabel || '当前位置'

      const firstForecast = forecast.list?.[0]
      const nextHours = buildNextHours(forecast.list ?? [])
      const next3Days = buildDailyRanges(forecast.list ?? [])

      const w0 = current.weather?.[0]
      const nextVm: WeatherVM = {
        cityName: displayCityName,
        pos: effectivePos,
        updatedAt: Date.now(),

        nowTempC: clampFinite(current.main.temp),
        nowDesc: w0?.description ?? '—',
        nowIcon: w0?.icon,
        todayMinC: clampFinite(current.main.temp_min),
        todayMaxC: clampFinite(current.main.temp_max),
        aqi: air.list?.[0]?.main?.aqi,

        twoHourPrecip: buildTwoHourPrecipApprox(firstForecast),
        nextHours,
        next3Days,

        feelsLikeC: clampFinite(current.main.feels_like),
        windSpeedMps: clampFinite(current.wind.speed),
        humidityPct: clampFinite(current.main.humidity),
        visibilityM: current.visibility,
        sunriseUnix: current.sys.sunrise,
        sunsetUnix: current.sys.sunset,
      }

      // If a newer request completed after this one, ignore this result.
      if (lastPosKeyRef.current !== key) return

      setVm(nextVm)
      writeJson(LS_CACHE_KEY, nextVm)
      setStatus('success')

      // Keep a usable city fallback for future loads even if geolocation becomes unavailable.
      syncCityCache({
        name: nextVm.cityName,
        lat: effectivePos.lat,
        lon: effectivePos.lon,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '请求失败'
      setErrorMessage(msg)
      setStatus('error')
    }
  }, [city, effectivePos, locationMode, syncCityCache])

  const refresh = useCallback(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!effectivePos) return
    void load()
  }, [effectivePos, load])

  return useMemo<UseWeatherResult>(
    () => ({
      status,
      vm,
      errorMessage,
      city,
      locationMode,
      setCity,
      useAutoLocation,
      refresh,
    }),
    [status, vm, errorMessage, city, locationMode, setCity, useAutoLocation, refresh],
  )
}

