import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet shadow-[0_0_20px_-4px_var(--primary)]"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-foreground"
        >
          {/* stylized aligned motion / body-axis mark */}
          <circle cx="12" cy="4.5" r="2.2" fill="currentColor" />
          <path
            d="M12 7v6m0 0-4 4.5M12 13l4 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6.5 9.5 12 11l5.5-1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        ALIGN<span className="text-primary">.AI</span>
      </span>
    </span>
  )
}
