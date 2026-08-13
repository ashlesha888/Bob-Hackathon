'use client'

import { ArrowRight } from 'lucide-react'
import { CtaButton } from '@/components/align/cta-button'
import { Pill } from '@/components/align/pill'
import { useAuth } from '@/lib/auth-context'

export function FinalCta() {
  const { isAuthenticated, openAuthModal } = useAuth()

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal('signin')
    } else {
      const section = document.getElementById('exercises') || document.getElementById('top')
      if (section) section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="start" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-4xl border border-primary/25 bg-gradient-to-b from-primary/12 to-card/40 px-6 py-16 text-center sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <Pill className="uppercase">
            <span className="size-1.5 rounded-full bg-primary" />
            Your camera. Your movement. Your AI coach.
          </Pill>
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Ready to understand your movement?
          </h2>
          <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Start your first AI-guided movement session.
          </p>
          <CtaButton onClick={handleStart} size="lg" className="mt-2">
            Start Training
            <ArrowRight className="size-4" />
          </CtaButton>
        </div>
      </div>
    </section>
  )
}
