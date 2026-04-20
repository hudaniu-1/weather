import { MetricCard } from '../components/MetricCard'
import { SectionTitle } from '../components/SectionTitle'
import { WeatherIcon } from '../components/WeatherIcon'
import type { WeatherVM } from '../hooks/useWeather'

export function ForecastPage(props: { vm: WeatherVM | null }) {
  const vm = props.vm

  return (
    <div className="px-4 pb-24 pt-5">
      <SectionTitle>天气预报</SectionTitle>

      <div className="mt-4 space-y-3">
        <MetricCard
          label="未来两小时降水（近似）"
          value={
            vm?.twoHourPrecip ? (
              <span>
                {vm.twoHourPrecip.hour1Mm.toFixed(1)}mm + {vm.twoHourPrecip.hour2Mm.toFixed(1)}mm
              </span>
            ) : (
              '—'
            )
          }
          sub="基于 3 小时预报桶均分，仅用于展示"
        />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs text-slate-400">未来 5 小时（按预报时间点）</div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {(vm?.nextHours ?? []).map((h) => (
              <div
                key={h.dt}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-2 text-center"
              >
                <div className="text-xs text-slate-400">{h.label}</div>
                <div className="mx-auto mt-2 flex justify-center">
                  <WeatherIcon icon={h.icon} size={36} alt={h.desc} />
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-100">
                  {Math.round(h.tempC)}°
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs text-slate-400">未来三天（最低 → 最高）</div>
          <div className="mt-3 space-y-2">
            {(vm?.next3Days ?? []).map((d) => (
              <div
                key={d.dayLabel}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-3 py-2"
              >
                <div className="w-14 text-sm text-slate-200">{d.dayLabel}</div>
                <div className="flex items-center gap-2">
                  <WeatherIcon icon={d.icon} size={34} alt={d.desc} />
                  <div className="text-xs text-slate-400">{d.desc ?? '—'}</div>
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {Math.round(d.minC)}° → {Math.round(d.maxC)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

