import type {
  OwmAirPollutionResponse,
  OwmCurrentWeatherResponse,
  OwmForecastResponse,
  OwmGeoDirectItem,
  OwmGeoReverseItem,
} from './owmTypes'

export type LatLon = { lat: number; lon: number }

export class OwmError extends Error {
  readonly status?: number
  readonly url: string

  constructor(message: string, opts: { url: string; status?: number }) {
    super(message)
    this.name = 'OwmError'
    this.status = opts.status
    this.url = opts.url
  }
}

const OWM_BASE = 'https://api.openweathermap.org'

function getApiKey(): string {
  const key = import.meta.env.VITE_OWM_API_KEY as string | undefined
  if (!key) {
    throw new OwmError('Missing VITE_OWM_API_KEY in env', { url: '(env)' })
  }
  return key
}

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(path, OWM_BASE)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length > 0) url.searchParams.set(k, String(v))
  })
  url.searchParams.set('appid', getApiKey())
  return url
}

async function fetchJson<T>(url: URL): Promise<T> {
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new OwmError(
      `OpenWeatherMap request failed (${res.status})${text ? `: ${text}` : ''}`,
      { url: url.toString(), status: res.status },
    )
  }
  return (await res.json()) as T
}

export function getIconUrl(icon: string, size: '2x' | '4x' = '4x') {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`
}

export async function geoDirect(query: string, limit = 5): Promise<OwmGeoDirectItem[]> {
  const url = buildUrl('/geo/1.0/direct', { q: query, limit })
  return await fetchJson<OwmGeoDirectItem[]>(url)
}

export async function geoReverse(pos: LatLon, limit = 1): Promise<OwmGeoReverseItem[]> {
  const url = buildUrl('/geo/1.0/reverse', { lat: pos.lat, lon: pos.lon, limit })
  return await fetchJson<OwmGeoReverseItem[]>(url)
}

export async function getCurrentWeather(
  pos: LatLon,
  opts: { units?: 'metric'; lang?: string } = {},
): Promise<OwmCurrentWeatherResponse> {
  const url = buildUrl('/data/2.5/weather', {
    lat: pos.lat,
    lon: pos.lon,
    units: opts.units ?? 'metric',
    lang: opts.lang ?? 'zh_cn',
  })
  return await fetchJson<OwmCurrentWeatherResponse>(url)
}

export async function getForecast(
  pos: LatLon,
  opts: { units?: 'metric'; lang?: string } = {},
): Promise<OwmForecastResponse> {
  const url = buildUrl('/data/2.5/forecast', {
    lat: pos.lat,
    lon: pos.lon,
    units: opts.units ?? 'metric',
    lang: opts.lang ?? 'zh_cn',
  })
  return await fetchJson<OwmForecastResponse>(url)
}

export async function getAirPollution(pos: LatLon): Promise<OwmAirPollutionResponse> {
  const url = buildUrl('/data/2.5/air_pollution', { lat: pos.lat, lon: pos.lon })
  return await fetchJson<OwmAirPollutionResponse>(url)
}

