'use client'

import { ArrowUpRight, CheckCircle2, Dumbbell, Flame, ShieldAlert } from 'lucide-react'
import { ExerciseConfig } from '@/lib/exercise-data'

interface ExerciseCardProps {
  exercise: ExerciseConfig
  isSelected?: boolean
  onSelect: (exerciseName: string) => void
}

export function ExerciseCard({ exercise, isSelected, onSelect }: ExerciseCardProps) {
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Foundational':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Intermediate':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'Advanced':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(exercise.name)}
      className={`group relative flex flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-xl shadow-primary/15 ring-1 ring-primary/30'
          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card/80'
      }`}
    >
      {/* Background glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getLevelBadgeColor(
              exercise.level,
            )}`}
          >
            {exercise.level === 'Foundational' && <CheckCircle2 className="size-3" />}
            {exercise.level === 'Intermediate' && <Flame className="size-3" />}
            {exercise.level === 'Advanced' && <ShieldAlert className="size-3" />}
            {exercise.level}
          </span>

          <span
            className={`grid size-9 place-items-center rounded-full border transition-all duration-300 ${
              isSelected
                ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30'
                : 'border-border bg-secondary/50 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary group-hover:scale-110'
            }`}
          >
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {exercise.name}
          {isSelected && <CheckCircle2 className="size-4 text-primary animate-pulse" />}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground font-medium">{exercise.focus}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <span className="text-xs font-semibold text-primary/90 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
          <Dumbbell className="size-3.5" />
          Start Coaching Mode
        </span>
        <span className="text-[11px] font-mono text-muted-foreground/80">
          {exercise.formChecks.length} AI Form Checks
        </span>
      </div>
    </button>
  )
}
