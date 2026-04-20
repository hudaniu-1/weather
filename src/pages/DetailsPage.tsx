import { MetricCard } from '../components/MetricCard'
import { SectionTitle } from '../components/SectionTitle'
import type { WeatherVM } from '../hooks/useWeather'

function formatTime(unix: number) {
  const d = new Date(unix * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function DetailsPage(props: { vm: WeatherVM | null }) {
  const vm = props.vm

  return (
    <div className="px-4 pb-24 pt-5">
      <SectionTitle>详细数据</SectionTitle>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard label="紫外线等级" value="暂无" sub="免费接口不提供（One Call 3.0 可用）" />
        <MetricCard
          label="体感温度"
          value={vm ? `${Math.round(vm.feelsLikeC)}°` : '—'}
          sub="Feels like"
        />
        <MetricCard label="日出" value={vm ? formatTime(vm.sunriseUnix) : '—'} />
        <MetricCard label="日落" value={vm ? formatTime(vm.sunsetUnix) : '—'} />
        <MetricCard
          label="风速"
          value={vm ? `${vm.windSpeedMps.toFixed(1)} m/s` : '—'}
          sub="Wind"
        />
        <MetricCard label="湿度" value={vm ? `${Math.round(vm.humidityPct)}%` : '—'} sub="Humidity" />
        <MetricCard
          label="能见度"
          value={vm?.visibilityM ? `${Math.round(vm.visibilityM / 100) / 10} km` : '—'}
          sub="Visibility"
        />
      </div>
    </div>
  )
}

