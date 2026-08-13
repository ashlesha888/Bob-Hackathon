import { ShieldCheck, HeartPulse, Info } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'

const points = [
  {
    icon: HeartPulse,
    title: 'Guidance, not diagnosis',
    desc: 'Feedback focuses on general movement quality and form — never medical assessment.',
  },
  {
    icon: Info,
    title: 'Clear about limits',
    desc: 'ALIGN.AI tells you what it can and cannot evaluate, so you always keep context.',
  },
  {
    icon: ShieldCheck,
    title: 'Your body, your data',
    desc: 'Designed with privacy and responsible AI principles at the core.',
  },
]

export function Safety() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card/60 to-card/20 p-8 sm:p-12">
        <SectionHeader
          eyebrow="Responsible AI"
          title="Built for guidance, not diagnosis."
          description="ALIGN.AI provides general fitness and movement guidance. It does not diagnose injuries or medical conditions, and does not replace a qualified physiotherapist, doctor, or other healthcare professional."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-background/40 p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl border border-success/25 bg-success/10 text-success">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
