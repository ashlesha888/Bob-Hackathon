import { AlertTriangle, HelpCircle, Lightbulb, Sparkles } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'
import { PoseSkeleton } from '@/components/align/pose-skeleton'

export function ExplainableAi() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/20 py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-violet/10 blur-[130px]"
      />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <SectionHeader
          align="left"
          eyebrow="Explainable AI"
          title={
            <>
              Don&apos;t just tell me I&apos;m wrong.
              <br />
              <span className="text-primary">Tell me why.</span>
            </>
          }
          description="Most tools flag a mistake and move on. ALIGN.AI explains the reasoning behind every correction, so you actually learn how to move better — not just what to fix."
        />

        {/* mock interface */}
        <div className="relative rounded-3xl border border-border bg-card/70 p-4 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-4 sm:grid-cols-[0.8fr_1fr]">
            {/* mini viewport */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(120%_100%_at_50%_0%,oklch(0.22_0.03_285)_0%,oklch(0.13_0.01_280)_65%)]">
              <div className="absolute inset-0 grid place-items-center p-4">
                <PoseSkeleton />
              </div>
              <span className="absolute left-2 top-2 rounded-full border border-warning/30 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                REVIEW
              </span>
            </div>

            {/* explanation stack */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5">
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <span className="text-sm font-semibold text-warning">Right Knee Alignment</span>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <HelpCircle className="size-3.5" />
                  Why?
                </span>
                <p className="mt-1.5 text-sm leading-snug text-foreground">
                  Your right knee is moving inward relative to your foot.
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary/10 p-3.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <Lightbulb className="size-3.5" />
                  Correction
                </span>
                <p className="mt-1.5 text-sm leading-snug text-foreground">
                  Try keeping your knee aligned with your foot during the movement.
                </p>
              </div>

              <button
                type="button"
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Sparkles className="size-3.5 text-primary" />
                Why is this correction?
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
