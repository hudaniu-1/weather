import type { ReactNode } from 'react'

export function MetricCard(props: {
  label: string
  value: ReactNode
  sub?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-md',
        props.className ?? '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/70">{props.label}</div>
          <div className="mt-1 text-lg font-semibold text-white">{props.value}</div>
          {props.sub ? <div className="mt-1 text-xs text-white/60">{props.sub}</div> : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
    </div>
  )
}
