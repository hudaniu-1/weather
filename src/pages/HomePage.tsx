import { MetricCard } from '../components/MetricCard'
import { SectionTitle } from '../components/SectionTitle'
import { Skeleton } from '../components/Skeleton'
import { WeatherIcon } from '../components/WeatherIcon'
import type { WeatherVM } from '../hooks/useWeather'

function aqiText(aqi: 1 | 2 | 3 | 4 | 5) {
  switch (aqi) {
    case 1:
      return '优'
    case 2:
      return '良'
    case 3:
      return '轻度污染'
    case 4:
      return '中度污染'
    case 5:
      return '重度污染'
  }
}

export function HomePage(props: { status: 'loading' | 'success' | 'error' | 'idle'; vm: WeatherVM | null }) {
  const vm = props.vm

  return (
    <div className="px-4 pb-24 pt-5">
      <SectionTitle right={vm ? new Date(vm.updatedAt).toLocaleTimeString() : null}>
        天气概况
      </SectionTitle>

      <div className="mt-3 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/70 to-slate-950 p-5">
        {props.status === 'loading' && !vm ? (
          <div>
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <Skeleton className="h-10 w-28" />
                <Skeleton className="mt-2 h-4 w-44" />
              </div>
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </div>
        ) : vm ? (
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm text-slate-300">{vm.cityName}</div>
              <div className="mt-1 text-5xl font-semibold tracking-tight text-white">
                {Math.round(vm.nowTempC)}°
              </div>
              <div className="mt-2 text-sm text-slate-300">
                {vm.nowDesc} · {Math.round(vm.todayMinC)}° ~ {Math.round(vm.todayMaxC)}°
              </div>
            </div>
            <WeatherIcon icon={vm.nowIcon} size={72} alt={vm.nowDesc} />
          </div>
        ) : (
          <div className="text-sm text-slate-300">暂无数据</div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricCard
          label="最高 / 最低"
          value={
            vm ? (
              <span>
                {Math.round(vm.todayMaxC)}° / {Math.round(vm.todayMinC)}°
              </span>
            ) : (
              '—'
            )
          }
        />
        <MetricCard
          label="空气质量"
          value={vm?.aqi ? `${vm.aqi} · ${aqiText(vm.aqi)}` : '—'}
          sub={vm?.aqi ? 'AQI(1-5)' : '暂无'}
        />
      </div>
    </div>
  )
}

