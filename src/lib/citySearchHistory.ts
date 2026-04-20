import type { City } from '../hooks/useWeather'
import { readJson, writeJson } from './storage'

const LS_KEY = 'weather:search_city_history:v1'
const MAX_ITEMS = 15

function posKey(c: City) {
  return `${c.lat.toFixed(4)},${c.lon.toFixed(4)}`
}

export function readCitySearchHistory(): City[] {
  const raw = readJson<City[]>(LS_KEY)
  return Array.isArray(raw) ? raw : []
}

/** Most recent first; dedupe by rounded lat/lon. */
export function addCitySearchHistory(c: City) {
  const prev = readCitySearchHistory()
  const k = posKey(c)
  const filtered = prev.filter((x) => posKey(x) !== k)
  const entry: City = {
    name: c.name,
    lat: c.lat,
    lon: c.lon,
    country: c.country,
    state: c.state,
  }
  writeJson(LS_KEY, [entry, ...filtered].slice(0, MAX_ITEMS))
}

export function clearCitySearchHistory() {
  writeJson(LS_KEY, [])
}
