import { TrendingUp, Sparkles } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'
import { ProgressChart } from '@/components/align/progress-chart'

const sessions = [
  { label: 'Session 01', value: 68 },
  { label: 'Session 02', value: 73 },
  { label: 'Session 03', value: 78 },
  { label: 'Session 04', value: 84 },
  { label: 'Session 05', value: 91 },
]

export function ProgressShowcase() {
  return (
    <section
      id="progress"
      className="relative border-y border-border bg-card/20 py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Progress" title="See yourself improve." />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Movement Score</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                <TrendingUp className="size-3.5" />
                Trending up
              </span>
            </div>
            <div className="mt-6">
              <ProgressChart sessions={sessions} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-1 flex-col justify-center rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-violet/10 p-7">
              <span className="text-sm font-medium text-muted-foreground">Overall improvement</span>
              <span className="mt-2 font-display text-6xl font-bold tracking-tight text-foreground">
                +23%
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                movement score across 5 sessions
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-3xl border border-border bg-card/60 p-6">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Insight
                </p>
                <p className="mt-1 text-pretty text-sm leading-relaxed text-foreground">
                  Your knee-alignment errors have decreased over your last 5 sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
