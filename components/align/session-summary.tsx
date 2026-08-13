'use client'

import { useState } from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  Dumbbell,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Video,
  X,
} from 'lucide-react'
import { TrainingSummaryData } from '@/lib/pose/use-pose-detection'
import { useAuth } from '@/lib/auth-context'

interface SessionSummaryProps {
  summary: TrainingSummaryData
  onTrainAgain: () => void
  onChooseAnother: () => void
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function SessionSummary({ summary, onTrainAgain, onChooseAnother }: SessionSummaryProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { openAuthModal, isAuthenticated } = useAuth()
  const isHold = summary.exerciseName === 'Plank Hold'

  const handleViewProgress = () => {
    if (!isAuthenticated) {
      openAuthModal('signin')
    } else {
      const progressElement = document.getElementById('progress')
      if (progressElement) {
        progressElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/40 bg-card/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      {/* Background glow overlay */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      {/* Header section */}
      <div className="text-center pb-6 border-b border-border">
        <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles className="size-3.5" />
          SESSION COMPLETE
        </div>

        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {summary.exerciseName}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Great job! ALIGN.AI successfully analyzed your movement performance.
        </p>
      </div>

      {/* Summary stats grid */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-center">
          <div className="mx-auto mb-1.5 grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
            <Clock className="size-4" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">
            {formatDuration(summary.duration)}
          </span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Duration
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-center">
          <div className="mx-auto mb-1.5 grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
            <Dumbbell className="size-4" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">
            {isHold ? formatDuration(summary.duration) : summary.reps}
          </span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {isHold ? 'Hold Time' : 'Repetitions'}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-center">
          <div className="mx-auto mb-1.5 grid size-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Award className="size-4" />
          </div>
          <span className="font-display text-2xl font-bold text-emerald-400">
            {summary.formScore}%
          </span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Form Score
          </span>
        </div>
      </div>

      {/* Form Breakdown section */}
      <div className="mt-6 border-t border-border pt-6">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" />
          Form Breakdown
        </h3>

        <div className="flex flex-col gap-3">
          {Object.entries(summary.formBreakdown).map(([checkName, score]) => (
            <div key={checkName} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{checkName}</span>
                <span className={score >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {score}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Recording buttons */}
      {summary.blobUrl && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="flex items-center gap-2">
            <Video className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Session Recording Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer"
            >
              <Play className="size-3.5" />
              Preview Recording
            </button>

            <a
              href={summary.blobUrl}
              download={`align-ai-${summary.exerciseName.toLowerCase().replace(/\s+/g, '-')}-session.webm`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Download className="size-3.5" />
              Download
            </a>
          </div>
        </div>
      )}

      {/* Bottom Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={onTrainAgain}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Train Again
        </button>

        <button
          type="button"
          onClick={onChooseAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer"
        >
          Choose Another Exercise
        </button>

        <button
          type="button"
          onClick={handleViewProgress}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <TrendingUp className="size-4 text-primary" />
          View Progress
        </button>
      </div>

      {/* Video Preview Modal */}
      {isPreviewOpen && summary.blobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Recorded Workout Session — {summary.exerciseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-black">
              <video
                src={summary.blobUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">
                Recorded: <strong className="text-foreground">{formatDuration(summary.duration)}</strong>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={summary.blobUrl}
                  download={`align-ai-${summary.exerciseName.toLowerCase().replace(/\s+/g, '-')}-session.webm`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
