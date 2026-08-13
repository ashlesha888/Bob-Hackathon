import { cn } from '@/lib/utils'

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur',
        className,
      )}
    >
      {children}
    </span>
  )
}
