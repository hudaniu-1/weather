import { getIconUrl } from '../lib/owmClient'

export function WeatherIcon(props: { icon?: string; size?: number; alt?: string }) {
  const size = props.size ?? 56
  if (!props.icon) {
    return (
      <div
        className="rounded-xl border border-slate-800 bg-slate-900/60"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    )
  }

  return (
    <img
      src={getIconUrl(props.icon, size >= 64 ? '4x' : '2x')}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="select-none"
      alt={props.alt ?? ''}
    />
  )
}

