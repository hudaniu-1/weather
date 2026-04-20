import { Skeleton } from '../components/Skeleton'
import { WeatherIcon } from '../components/WeatherIcon'
import type { WeatherVM } from '../hooks/useWeather'
import { aqiAdviceCn, aqiLevelCn } from '../lib/weatherLocale'

export function HomePage(props: { status: 'loading' | 'success' | 'error' | 'idle'; vm: WeatherVM | null }) {
  const vm = props.vm

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col px-4 pb-28 pt-2">
      {props.status === 'loading' && !vm ? (
        <div className="flex flex-1 flex-col items-center pt-8">
          <Skeleton className="h-8 w-32 bg-white/20" />
          <Skeleton className="mt-3 h-5 w-20 bg-white/20" />
          <Skeleton className="mt-10 h-16 w-28 bg-white/20" />
          <Skeleton className="mt-4 h-4 w-40 bg-white/20" />
          <Skeleton className="mt-10 h-14 w-full max-w-sm rounded-full bg-white/15" />
        </div>
      ) : vm ? (
        <>
          <div className="flex flex-1 flex-col items-center text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">{vm.cityName}</h1>
            <p className="mt-1 text-base text-white/90">{vm.nowDesc}</p>
            <div className="mt-8 text-7xl font-light leading-none tracking-tighter text-white drop-shadow-md">
              {Math.round(vm.nowTempC)}°
            </div>
            <p className="mt-4 text-sm text-white/85">
              最高 {Math.round(vm.todayMaxC)}° · 最低 {Math.round(vm.todayMinC)}°
            </p>
            <div className="mt-10">
              <WeatherIcon icon={vm.nowIcon} size={88} alt={vm.nowDesc} />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-sm text-white shadow-lg backdrop-blur-md">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-white/90">空气质量</span>
              {vm.aqi ? (
                <>
                  <span className="font-semibold">等级 {vm.aqi}</span>
                  <span
                    className={[
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      vm.aqi === 1
                        ? 'bg-emerald-500/90 text-white'
                        : vm.aqi === 2
                          ? 'bg-lime-500/90 text-slate-900'
                          : vm.aqi === 3
                            ? 'bg-amber-400/95 text-slate-900'
                            : vm.aqi === 4
                              ? 'bg-orange-500/95 text-white'
                              : 'bg-rose-600/95 text-white',
                    ].join(' ')}
                  >
                    {aqiLevelCn(vm.aqi)}
                  </span>
                </>
              ) : (
                <span className="text-white/70">暂无数据</span>
              )}
            </div>
            <p className="max-w-[52%] text-right text-xs leading-snug text-white/85">
              {vm.aqi ? aqiAdviceCn(vm.aqi) : '刷新后可查看空气质量'}
            </p>
          </div>
          {props.status === 'error' ? (
            <p className="mt-3 text-center text-xs text-amber-100/95">上次请求失败，数据可能不是最新，请点击「刷新」重试。</p>
          ) : null}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-white/80">
          <p className="text-sm">暂无天气数据</p>
          <p className="mt-2 text-xs text-white/60">请允许定位或搜索城市</p>
        </div>
      )}
    </div>
  )
}
