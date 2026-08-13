'use client'

import { Activity, ArrowLeft, CheckCircle2, Dumbbell, ShieldCheck } from 'lucide-react'
import { ExerciseConfig } from '@/lib/exercise-data'

interface ExerciseTutorialProps {
  exercise: ExerciseConfig
  onBack: () => void
}

export function ExerciseTutorial({ exercise, onBack }: ExerciseTutorialProps) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-xl">
      {/* Header section */}
      <div className="flex items-start justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              Exercises
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Dumbbell className="size-3" />
              {exercise.level}
            </span>
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {exercise.name.toUpperCase()}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{exercise.focus}</p>
        </div>

        <button
          type="button"
          onClick={onBack}
          aria-label="Back to exercises"
          className="grid size-9 place-items-center rounded-2xl border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* How to perform section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-4 text-primary" />
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
            How to perform
          </h3>
        </div>

        <ol className="flex flex-col gap-2.5">
          {exercise.instructions.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3 text-xs leading-relaxed text-muted-foreground transition-colors hover:border-border hover:bg-secondary/40"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-primary/15 text-[11px] font-bold text-primary">
                {idx + 1}
              </span>
              <span className="text-foreground/90 font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Key Form Checks section */}
      <div className="border-t border-border pt-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
            Key Form Checks
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {exercise.formChecks.map((check, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-2xl border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30"
            >
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span className="text-xs font-semibold text-foreground leading-tight">{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
