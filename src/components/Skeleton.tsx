export function Skeleton(props: { className?: string }) {
  return (
    <div
      className={['animate-pulse rounded-xl', props.className ?? 'h-4 w-full bg-slate-800/70'].join(' ')}
    />
  )
}

