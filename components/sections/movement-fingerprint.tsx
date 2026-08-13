import { Fingerprint } from 'lucide-react'
import { SectionHeader } from '@/components/align/section-header'
import { MovementRadar } from '@/components/align/movement-radar'

const metrics = [
  { label: 'Knee Alignment', status: 'Needs Focus', tone: 'warn', value: 0.42 },
  { label: 'Forward Lean', status: 'Improving', tone: 'info', value: 0.62 },
  { label: 'Stability', status: 'Good', tone: 'ok', value: 0.78 },
  { label: 'Range of Motion', status: 'Excellent', tone: 'ok', value: 0.94 },
] as const

const toneClasses: Record<string, string> = {
  warn: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-primary/30 bg-primary/10 text-primary',
  ok: 'border-success/30 bg-success/10 text-success',
}

export function MovementFingerprint() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeader
        eyebrow="Movement Fingerprint"
        title="Your movement has a pattern."
        description="ALIGN.AI doesn't only evaluate one session. It identifies recurring movement patterns across sessions — a fingerprint of how you move."
      />

      <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-card/50">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* radar side */}
          <div className="relative flex flex-col items-center justify-center gap-6 border-b border-border bg-gradient-to-b from-primary/8 to-transparent p-8 lg:border-b-0 lg:border-r">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Fingerprint className="size-4 text-primary" />
              Your Movement Fingerprint
            </span>
            <div className="w-full max-w-xs">
              <MovementRadar
                axes={metrics.map((m) => ({ label: m.label, value: m.value }))}
              />
            </div>
          </div>

          {/* metrics side */}
          <div className="flex flex-col justify-center gap-3 p-8">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 px-5 py-4"
              >
                <div>
                  <p className="font-display text-base font-semibold text-foreground">{m.label}</p>
                  <div className="mt-2 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                      style={{ width: `${Math.round(m.value * 100)}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[m.tone]}`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
