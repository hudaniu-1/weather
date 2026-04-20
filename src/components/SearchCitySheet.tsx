import { useEffect, useMemo, useState } from 'react'
import type { City } from '../hooks/useWeather'
import { geoDirect } from '../lib/owmClient'

export function SearchCitySheet(props: {
  open: boolean
  onClose: () => void
  onSelect: (city: City) => void
}) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<City[]>([])

  useEffect(() => {
    if (!props.open) return
    setQuery('')
    setResults([])
    setError(null)
  }, [props.open])

  const canSearch = useMemo(() => query.trim().length >= 2, [query])

  useEffect(() => {
    if (!props.open) return
    if (!canSearch) {
      setResults([])
      setError(null)
      return
    }

    const controller = new AbortController()
    const t = setTimeout(() => {
      setLoading(true)
      setError(null)
      geoDirect(query.trim(), 5)
        .then((items) => {
          setResults(
            items.map((it) => ({
              name: it.local_names?.zh ?? it.name,
              lat: it.lat,
              lon: it.lon,
              country: it.country,
              state: it.state,
            })),
          )
        })
        .catch((e) => setError(e instanceof Error ? e.message : '搜索失败'))
        .finally(() => setLoading(false))
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [props.open, canSearch, query])

  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={props.onClose}
        aria-label="关闭"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[80svh] rounded-t-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700" />
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-100">搜索城市</div>
          <button className="text-sm text-slate-300" onClick={props.onClose}>
            关闭
          </button>
        </div>

        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入城市名（如 北京 / Shanghai）"
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-600"
          />
          <div className="mt-2 text-xs text-slate-400">至少输入 2 个字符</div>
        </div>

        <div className="mt-4 space-y-2 overflow-auto pb-2">
          {loading ? (
            <div className="text-sm text-slate-300">搜索中…</div>
          ) : error ? (
            <div className="text-sm text-rose-300">{error}</div>
          ) : results.length === 0 ? (
            <div className="text-sm text-slate-400">暂无结果</div>
          ) : (
            results.map((c) => (
              <button
                key={`${c.lat},${c.lon}`}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left"
                onClick={() => {
                  props.onSelect(c)
                  props.onClose()
                }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-100">{c.name}</div>
                  <div className="truncate text-xs text-slate-400">
                    {[c.state, c.country].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {c.lat.toFixed(2)},{c.lon.toFixed(2)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

