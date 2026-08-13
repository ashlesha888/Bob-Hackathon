'use client'

import { Activity, AlertCircle, CheckCircle2, Info, Loader2, Scan } from 'lucide-react'
import { FormCheckStatus } from '@/lib/pose/types'

interface FormAnalysisProps {
  formChecks: string[]
  formCheckStatuses?: Record<string, FormCheckStatus>
  isCameraActive: boolean
  poseStatus: string
}

export function FormAnalysis({
  formChecks,
  formCheckStatuses,
  isCameraActive,
  poseStatus,
}: FormAnalysisProps) {
  const getBadgeConfig = (status: FormCheckStatus | undefined) => {
    switch (status) {
      case 'GOOD':
        return {
          color: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
          icon: <CheckCircle2 className="size-3.5 text-emerald-400" />,
          label: 'GOOD',
        }
      case 'WARNING':
        return {
          color: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
          icon: <AlertCircle className="size-3.5 text-amber-400" />,
          label: 'WARNING',
        }
      case 'IMPROVE':
        return {
          color: 'border-orange-500/30 bg-orange-500/15 text-orange-400',
          icon: <Info className="size-3.5 text-orange-400" />,
          label: 'IMPROVE',
        }
      case 'DETECTING':
      default:
        return {
          color: 'border-primary/30 bg-primary/10 text-primary animate-pulse',
          icon: <Loader2 className="size-3.5 animate-spin text-primary" />,
          label: 'DETECTING',
        }
    }
  }

  const isTrackingActive = isCameraActive && poseStatus === 'POSE DETECTED'

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-xl bg-primary/15 text-primary">
            <Scan className="size-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              AI Form Check
            </h3>
            <p className="text-[11px] text-muted-foreground">Real-time landmark alignment analysis</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
            isTrackingActive
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              : 'border-primary/30 bg-primary/10 text-primary'
          }`}
        >
          <Activity className="size-3 animate-pulse" />
          {isCameraActive
            ? isTrackingActive
              ? 'Pose Active'
              : 'Waiting for movement...'
            : 'AI Analysis: Ready'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {formChecks.map((checkName) => {
          const currentStatus = isCameraActive
            ? isTrackingActive
              ? formCheckStatuses?.[checkName] || 'GOOD'
              : 'DETECTING'
            : 'GOOD'

          const badge = getBadgeConfig(currentStatus)

          return (
            <div
              key={checkName}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-secondary/30 p-3 transition-colors hover:border-primary/30 hover:bg-secondary/50"
            >
              <span className="text-xs font-semibold text-foreground/90">{checkName}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-bold tracking-wider ${badge.color}`}
              >
                {badge.icon}
                {badge.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
