import type { ReactNode } from 'react'

export function MetricCard(props: {
  label: string
  value: ReactNode
  sub?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-400">{props.label}</div>
          <div className="mt-1 text-lg font-semibold text-slate-50">{props.value}</div>
          {props.sub ? <div className="mt-1 text-xs text-slate-400">{props.sub}</div> : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
    </div>
  )
}

