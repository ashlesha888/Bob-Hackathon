'use client'

import { ArrowRight, Play } from 'lucide-react'
import { CtaButton } from '@/components/align/cta-button'
import { Pill } from '@/components/align/pill'
import { TrainingStudio } from '@/components/align/training-studio'
import { useAuth } from '@/lib/auth-context'

export function Hero() {
  const { setSelectedExercise } = useAuth()

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedExercise('Bodyweight Squat')
    const exercisesSection = document.getElementById('exercises')
    if (exercisesSection) {
      exercisesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="top" className="relative overflow-hidden">
      {/* ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/12 blur-[130px]" />
        <div className="absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-violet/12 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="animate-fade-up flex flex-col items-start gap-6">
          <Pill className="uppercase">
            <span className="size-1.5 rounded-full bg-success" />
            AI Movement Coach • Real-Time Analysis
          </Pill>

          <h1 className="text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Move better.
            <br />
            <span className="bg-gradient-to-r from-primary via-violet to-primary bg-clip-text text-transparent text-glow-primary">
              Train smarter.
            </span>
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            ALIGN.AI turns your camera into a real-time movement coach — helping you understand your
            form, correct mistakes, and track how you improve.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaButton onClick={handleStart} size="lg">
              Start Training
              <ArrowRight className="size-4" />
            </CtaButton>
            <CtaButton href="#how-it-works" size="lg" variant="ghost">
              <Play className="size-4" />
              See How It Works
            </CtaButton>
          </div>

          <dl className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-6">
            {[
              { k: 'Real-time', v: 'Form analysis' },
              { k: 'Explainable', v: 'AI feedback' },
              { k: 'Session', v: 'Progress tracking' },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-lg font-semibold text-foreground">{s.k}</dt>
                <dd className="text-sm text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up flex justify-center lg:justify-end [animation-delay:150ms]">
          <TrainingStudio />
        </div>
      </div>
    </section>
  )
}
