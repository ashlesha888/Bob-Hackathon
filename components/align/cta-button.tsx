import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.05em]'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-primary to-violet text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] hover:shadow-[0_14px_40px_-8px_var(--primary)] hover:-translate-y-0.5',
  ghost:
    'border border-border bg-secondary/40 text-foreground backdrop-blur hover:bg-secondary/70 hover:-translate-y-0.5',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[0.95rem]',
}

export function CtaButton({
  href = '#',
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
}: {
  href?: string
  children: React.ReactNode
  variant?: Variant
  size?: Size
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, variants[variant], sizes[size], 'cursor-pointer', className)}
      >
        {children}
      </button>
    )
  }

  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  )
}

