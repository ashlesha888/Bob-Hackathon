import { Camera, ScanLine, Ruler, MessageSquareText, LineChart } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'

const steps = [
  { n: '01', icon: Camera, title: 'Camera', desc: 'Capture your movement' },
  { n: '02', icon: ScanLine, title: 'Pose Detection', desc: 'Identify body landmarks' },
  { n: '03', icon: Ruler, title: 'Movement Analysis', desc: 'Measure angles and alignment' },
  {
    n: '04',
    icon: MessageSquareText,
    title: 'Real-Time Feedback',
    desc: 'Understand what needs correction',
  },
  { n: '05', icon: LineChart, title: 'Progress Intelligence', desc: 'Track improvement over time' },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-border bg-card/20 py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How It Works"
          title="From camera to coaching in seconds."
        />

        <div className="relative mt-14">
          {/* connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {steps.map((step) => (
              <li
                key={step.n}
                className="group relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-background/60 p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="relative z-10 grid size-12 place-items-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-violet/10 text-primary transition-transform duration-300 group-hover:scale-105">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-bold tracking-widest text-muted-foreground/60">
                    {step.n}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
