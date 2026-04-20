import { MetricCard } from '../components/MetricCard'
import type { WeatherVM } from '../hooks/useWeather'
import { approxDewPointC, feelsLikeDescriptorCn, visibilityDescriptorCn, windDirectionCn, windLevelCn } from '../lib/weatherLocale'

function formatClock(unix: number) {
  const d = new Date(unix * 1000)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function DetailsPage(props: { vm: WeatherVM | null }) {
  const vm = props.vm

  const dew =
    vm?.dewPointC != null && Number.isFinite(vm.dewPointC)
      ? Math.round(vm.dewPointC)
      : vm
        ? Math.round(approxDewPointC(vm.nowTempC, vm.humidityPct))
        : null

  const visKm = vm?.visibilityM != null ? vm.visibilityM / 1000 : null

  return (
    <div className="min-h-[calc(100svh-8.5rem)] px-4 pb-28 pt-4">
      <h2 className="text-xl font-bold text-white drop-shadow-sm">详细数据</h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricCard label="紫外线" value="暂无" sub="当前接口未返回紫外线指数" />

        <MetricCard
          label="日落"
          value={vm ? formatClock(vm.sunsetUnix) : '—'}
          sub={vm ? `日出 ${formatClock(vm.sunriseUnix)}` : undefined}
        />

        <MetricCard
          label="风"
          value={vm ? windLevelCn(vm.windSpeedMps) : '—'}
          sub={vm ? windDirectionCn(vm.windDeg) : undefined}
        />

        <MetricCard
          label="湿度"
          value={vm ? `${Math.round(vm.humidityPct)}%` : '—'}
          sub={dew != null ? `露点 ${dew}°` : undefined}
        />

        <MetricCard
          label="能见度"
          value={visKm != null ? `${visKm < 1 ? visKm.toFixed(1) : Math.round(visKm)} 公里` : '—'}
          sub={visKm != null ? visibilityDescriptorCn(visKm) : undefined}
        />

        <MetricCard
          label="体感"
          value={vm ? `${Math.round(vm.feelsLikeC)}°` : '—'}
          sub={vm ? feelsLikeDescriptorCn(vm.nowTempC, vm.feelsLikeC) : undefined}
        />
      </div>
    </div>
  )
}
