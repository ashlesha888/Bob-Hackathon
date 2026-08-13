import {
  Activity,
  MessagesSquare,
  GitCompareArrows,
  ListChecks,
  Fingerprint,
  BrainCircuit,
} from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'

const features = [
  {
    icon: Activity,
    title: 'Real-Time Form Analysis',
    desc: "Understand your movement while you're performing it.",
  },
  {
    icon: MessagesSquare,
    title: 'Explainable Feedback',
    desc: "Don't just see a warning. Understand why the movement needs correction.",
  },
  {
    icon: GitCompareArrows,
    title: 'Reference Comparison',
    desc: 'Compare your movement against an exercise-specific reference.',
  },
  {
    icon: ListChecks,
    title: 'Rep-by-Rep Analysis',
    desc: 'See which repetitions were strong and which need improvement.',
  },
  {
    icon: Fingerprint,
    title: 'Movement Fingerprint',
    desc: 'Discover recurring movement patterns unique to you.',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive Coaching',
    desc: 'Your next session is shaped by what you learned in previous sessions.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeader
        eyebrow="Core Features"
        title="More than posture detection."
        description="Every part of ALIGN.AI is built to help you understand movement — not just measure it."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card/70"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="grid size-11 place-items-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary/20 to-violet/10 text-primary">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
