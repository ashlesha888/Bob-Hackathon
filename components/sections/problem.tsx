import { Check, Eye, HelpCircle, Repeat, TrendingUp, Sparkles } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'

const traditional = [
  { icon: Eye, label: 'Watch' },
  { icon: Repeat, label: 'Copy' },
  { icon: HelpCircle, label: 'Guess' },
]

const align = [
  { icon: Eye, label: 'Observe' },
  { icon: Sparkles, label: 'Understand' },
  { icon: Check, label: 'Correct' },
  { icon: TrendingUp, label: 'Improve' },
]

export function Problem() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeader
        eyebrow="The Problem"
        title="Watching an exercise isn't the same as understanding your movement."
        description="Online exercise videos can demonstrate what a movement should look like — but they can't tell you whether your own posture, alignment, range of motion, or movement consistency is actually correct."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {/* Traditional */}
        <div className="flex flex-col rounded-3xl border border-border bg-card/40 p-7">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Traditional Exercise Video
          </span>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            One-way. No idea if you&apos;re doing it right.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {traditional.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ALIGN.AI */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card/60 p-7 shadow-[0_0_60px_-30px_var(--primary)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl"
          />
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            ALIGN.AI
          </span>
          <p className="mt-2 text-lg font-medium text-foreground">
            A feedback loop that adapts to your body in real time.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {align.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet text-primary-foreground">
                  <item.icon className="size-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
