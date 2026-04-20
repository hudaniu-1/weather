import { useCallback, useEffect, useMemo, useState } from 'react'
import type { City } from '../hooks/useWeather'
import { addCitySearchHistory, clearCitySearchHistory, readCitySearchHistory } from '../lib/citySearchHistory'
import { geoDirect } from '../lib/owmClient'

function CityPickRow(props: { city: City; onPick: (c: City) => void }) {
  const { city: c } = props
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white/15"
      onClick={() => props.onPick(c)}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-white">{c.name}</div>
        <div className="truncate text-xs text-white/65">
          {[c.state, c.country].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className="text-xs text-white/50">
        {c.lat.toFixed(2)},{c.lon.toFixed(2)}
      </div>
    </button>
  )
}

export function SearchCitySheet(props: {
  open: boolean
  onClose: () => void
  onSelect: (city: City) => void
}) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<City[]>([])
  const [history, setHistory] = useState<City[]>([])

  const refreshHistory = useCallback(() => {
    setHistory(readCitySearchHistory())
  }, [])

  useEffect(() => {
    if (!props.open) return
    setQuery('')
    setResults([])
    setError(null)
    refreshHistory()
  }, [props.open, refreshHistory])

  const pickCity = useCallback(
    (c: City) => {
      addCitySearchHistory(c)
      refreshHistory()
      props.onSelect(c)
      props.onClose()
    },
    [props, refreshHistory],
  )

  const canSearch = useMemo(() => query.trim().length >= 2, [query])

  useEffect(() => {
    if (!props.open) return
    if (!canSearch) {
      setResults([])
      setError(null)
      return
    }

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
      clearTimeout(t)
    }
  }, [props.open, canSearch, query])

  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={props.onClose}
        aria-label="关闭"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[80svh] flex-col rounded-t-3xl border border-white/20 bg-gradient-to-b from-sky-700/95 to-blue-900/98 p-4 text-white shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full bg-white/35" />
        <div className="flex shrink-0 items-center justify-between">
          <div className="text-sm font-semibold">搜索城市</div>
          <button type="button" className="text-sm text-white/80 hover:text-white" onClick={props.onClose}>
            关闭
          </button>
        </div>

        <div className="mt-3 shrink-0">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入城市名（如 北京、上海）"
            className="w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/40"
          />
          <div className="mt-2 text-xs text-white/60">至少输入 2 个字符</div>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
          {history.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-medium tracking-wide text-white/70">最近搜索</div>
                <button
                  type="button"
                  className="text-xs text-white/55 hover:text-white/90"
                  onClick={() => {
                    clearCitySearchHistory()
                    refreshHistory()
                  }}
                >
                  清除记录
                </button>
              </div>
              <div className="space-y-2">
                {history.map((c) => (
                  <CityPickRow key={`h-${c.lat},${c.lon}`} city={c} onPick={pickCity} />
                ))}
              </div>
            </div>
          ) : null}

          {canSearch ? (
            <div>
              <div className="mb-2 text-xs font-medium tracking-wide text-white/70">搜索结果</div>
              {loading ? (
                <div className="text-sm text-white/80">搜索中…</div>
              ) : error ? (
                <div className="text-sm text-rose-200">{error}</div>
              ) : results.length === 0 ? (
                <div className="text-sm text-white/55">暂无结果</div>
              ) : (
                <div className="space-y-2">
                  {results.map((c) => (
                    <CityPickRow key={`${c.lat},${c.lon}`} city={c} onPick={pickCity} />
                  ))}
                </div>
              )}
            </div>
          ) : query.trim().length === 1 ? (
            <div className="text-xs text-white/55">再输入 1 个字符可搜索</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
