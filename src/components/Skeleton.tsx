export function Skeleton(props: { className?: string }) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-slate-800/70',
        props.className ?? 'h-4 w-full',
      ].join(' ')}
    />
  )
}

