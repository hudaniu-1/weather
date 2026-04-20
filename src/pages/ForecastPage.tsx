import { WeatherIcon } from '../components/WeatherIcon'
import type { WeatherVM } from '../hooks/useWeather'
import { twoHourRainSummaryCn } from '../lib/weatherLocale'

function TempRangeBar() {
  return (
    <div className="mx-2 h-2.5 min-w-[4.5rem] flex-1 rounded-full bg-gradient-to-r from-sky-200 via-amber-200 to-orange-400 opacity-90 shadow-inner" />
  )
}

export function ForecastPage(props: { vm: WeatherVM | null }) {
  const vm = props.vm

  const rainText = vm?.twoHourPrecip
    ? twoHourRainSummaryCn(vm.twoHourPrecip.hour1Mm, vm.twoHourPrecip.hour2Mm)
    : '暂无两小时降水预报。'

  return (
    <div className="min-h-[calc(100svh-8.5rem)] space-y-4 px-4 pb-28 pt-4">
      <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden>
            🌧️
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">降雨预报</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{rainText}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🕐
          </span>
          <h2 className="text-sm font-semibold text-white">每小时预报</h2>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 pt-1">
          {(vm?.nextHours ?? []).map((h) => (
            <div
              key={h.dt}
              className="flex w-[4.25rem] shrink-0 flex-col items-center rounded-2xl border border-white/15 bg-white/5 px-2 py-3"
            >
              <div className="text-xs text-white/75">{h.label}</div>
              <div className="mt-2 flex justify-center">
                <WeatherIcon icon={h.icon} size={40} alt={h.desc} />
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{Math.round(h.tempC)}°</div>
            </div>
          ))}
          {!vm?.nextHours?.length ? (
            <div className="py-6 text-center text-sm text-white/60">暂无逐时预报</div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            📅
          </span>
          <h2 className="text-sm font-semibold text-white">多日预报</h2>
        </div>
        <div className="space-y-3">
          {(vm?.next3Days ?? []).map((d) => (
            <div key={d.dayLabel} className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-2.5">
              <div className="w-14 shrink-0 text-sm font-medium text-white">{d.dayTitle ?? d.dayLabel}</div>
              <div className="flex shrink-0 items-center gap-1.5">
                <WeatherIcon icon={d.icon} size={36} alt={d.desc} />
              </div>
              <TempRangeBar />
              <div className="w-[4.5rem] shrink-0 text-right text-sm font-semibold tabular-nums text-white">
                {Math.round(d.minC)}–{Math.round(d.maxC)}°
              </div>
            </div>
          ))}
          {!vm?.next3Days?.length ? (
            <div className="py-4 text-center text-sm text-white/60">暂无预报数据</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
