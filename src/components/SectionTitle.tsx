import type { ReactNode } from 'react'

export function SectionTitle(props: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-wide text-slate-200">{props.children}</h2>
      {props.right ? <div className="text-sm text-slate-300">{props.right}</div> : null}
    </div>
  )
}

