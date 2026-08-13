'use client'

import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Camera,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Scan,
  ShieldAlert,
} from 'lucide-react'
import { ExerciseMetrics, PoseStatus, RecordingState } from '@/lib/pose/types'
import { NetworkDiagnosticModal } from './network-diagnostic-modal'
import { cn } from '@/lib/utils'

interface CameraViewProps {
  exerciseName: string
  isHold?: boolean
  isActive: boolean
  isInitializing: boolean
  errorMessage: string | null
  isInsecureContext?: boolean
  poseStatus: PoseStatus
  metrics: ExerciseMetrics
  recordingState: RecordingState
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onStartCamera: () => void
  onClearError: () => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function CameraView({
  exerciseName,
  isHold,
  isActive,
  isInitializing,
  errorMessage,
  isInsecureContext,
  poseStatus,
  metrics,
  recordingState,
  videoRef,
  canvasRef,
  onStartCamera,
  onClearError,
  containerRef,
}: CameraViewProps) {
  const [diagModalOpen, setDiagModalOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const getStatusBadgeStyle = () => {
    switch (poseStatus) {
      case 'POSE DETECTED':
        return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
      case 'TOO FAR AWAY':
      case 'TOO CLOSE':
      case 'MULTIPLE PEOPLE DETECTED':
      case 'LOW CONFIDENCE':
        return 'border-amber-500/30 bg-amber-500/15 text-amber-400'
      case 'SEARCHING FOR POSE':
      case 'INITIALIZING':
        return 'border-primary/30 bg-primary/15 text-primary'
      default:
        return 'border-border bg-background/60 text-muted-foreground'
    }
  }

  const handleCopyHttpsLink = () => {
    if (typeof window !== 'undefined') {
      const httpsUrl = `https://${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}${window.location.pathname}`
      navigator.clipboard.writeText(httpsUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-3xl border border-primary/30 bg-card/80 shadow-[0_0_35px_rgba(168,85,247,0.15)] backdrop-blur-xl"
      >
        {/* Ambient Background Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Live Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'scale-x-[-1]', // Mirror selfie feed
          )}
        />

        {/* AI Pose Skeleton Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-300',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Scanning Beam Overlay Effect */}
        {isActive && (
          <div
            aria-hidden="true"
            className="animate-align-scan pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent z-10"
          />
        )}

        {/* 1. INACTIVE STATE: Scanner Preview CTA */}
        {!isActive && !isInitializing && !errorMessage && !isInsecureContext && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 p-6 text-center backdrop-blur-xs z-20">
            <div className="mb-4 grid size-16 place-items-center rounded-3xl border border-primary/40 bg-primary/10 text-primary shadow-xl shadow-primary/20 animate-pulse">
              <Camera className="size-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Live AI Camera Feed
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
              Click Start Camera to request browser camera access for live movement coaching and pose tracking.
            </p>
            <button
              type="button"
              onClick={onStartCamera}
              className="mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <Camera className="size-4" />
              Start Camera
            </button>
          </div>
        )}

        {/* 2. INITIALIZING LOADING STATE */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 p-6 text-center backdrop-blur-md z-30">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="mt-4 font-display text-base font-bold text-foreground">
              Initializing AI Computer Vision Engine...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Loading MediaPipe Pose Landmarker models in your browser.
            </p>
          </div>
        )}

        {/* 3. INSECURE CONTEXT UI OVERLAY (Insecure HTTP over Network) */}
        {isInsecureContext && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-6 text-center backdrop-blur-md z-40">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl border border-purple-500/40 bg-purple-500/15 text-purple-400 shadow-lg shadow-purple-500/20">
              <Lock className="size-7" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              Camera Access Requires a Secure HTTPS Connection
            </h4>
            <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
              Browsers disable camera access on HTTP network URLs ({typeof window !== 'undefined' ? window.location.host : 'network'}). Please open the HTTPS version of the website or access via localhost.
            </p>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClearError()
                  onStartCamera()
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Retry Camera
              </button>

              <button
                type="button"
                onClick={handleCopyHttpsLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                <Copy className="size-3.5" />
                {copiedUrl ? 'HTTPS URL Copied!' : 'Copy HTTPS Link'}
              </button>

              <button
                type="button"
                onClick={() => setDiagModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                <Globe className="size-3.5 text-primary" />
                Run Network Diagnostics
              </button>
            </div>
          </div>
        )}

        {/* 4. GENERIC ERROR OVERLAY */}
        {errorMessage && !isInsecureContext && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-6 text-center backdrop-blur-md z-40">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/15 text-destructive shadow-lg">
              <AlertTriangle className="size-7" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">Camera Access Notice</h4>
            <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
              Camera access is required for live AI coaching. Please check browser permissions.
            </p>
            <p className="mt-1 text-[11px] text-destructive/90 font-mono bg-destructive/10 px-3 py-1 rounded-lg">
              {errorMessage}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClearError()
                  onStartCamera()
                }}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                Retry Camera
              </button>
              <button
                type="button"
                onClick={() => setDiagModalOpen(true)}
                className="rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                System Diagnostics
              </button>
            </div>
          </div>
        )}

        {/* Top Header Badges Overlay */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between z-20 pointer-events-none">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur shadow-md transition-all pointer-events-auto',
              getStatusBadgeStyle(),
            )}
          >
            <Scan className="size-3.5" />
            {isActive ? poseStatus : 'AI Analysis: Ready'}
          </span>

          <div className="flex items-center gap-2 pointer-events-auto">
            {recordingState.isRecording ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur shadow-md',
                  recordingState.isPaused
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-400'
                    : 'border-destructive/40 bg-destructive/20 text-destructive animate-pulse',
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    recordingState.isPaused ? 'bg-amber-400' : 'bg-destructive',
                  )}
                />
                {recordingState.isPaused ? '⏸ PAUSED' : '🔴 REC'}{' '}
                {formatTimer(recordingState.duration)}
              </span>
            ) : (
              isActive && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur shadow-md">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )
            )}
          </div>
        </div>

        {/* Bottom Floating Stats Bar Overlay */}
        {isActive && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 z-20 pointer-events-none">
            {/* Form Score Badge */}
            <div className="rounded-2xl border border-border bg-background/80 px-4 py-2.5 backdrop-blur-md shadow-xl pointer-events-auto flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <Activity className="size-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold leading-none text-foreground">
                    {metrics.formScore}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">%</span>
                </div>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  FORM SCORE
                </span>
              </div>
            </div>

            {/* Reps or Hold Time Display */}
            <div className="rounded-2xl border border-border bg-background/80 px-4 py-2.5 backdrop-blur-md shadow-xl pointer-events-auto text-right">
              <span className="font-display text-2xl font-bold leading-none text-foreground">
                {isHold ? formatTimer(recordingState.duration) : metrics.reps}
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-primary">
                {isHold ? 'HOLD TIME' : metrics.reps === 1 ? 'REP' : 'REPS'}
              </span>
            </div>
          </div>
        )}

        {/* Development Debug Information Overlay */}
        {process.env.NODE_ENV !== 'production' && isActive && (
          <div className="absolute top-16 left-4 z-30 rounded-xl border border-primary/40 bg-black/85 p-2.5 font-mono text-[11px] text-emerald-400 backdrop-blur-md shadow-lg pointer-events-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 pb-1 border-b border-white/10">
              DEV POSE DEBUG
            </div>
            <div>Rep Count: <span className="font-bold text-white">{metrics.reps}</span></div>
            <div>Phase: <span className="font-bold text-white">{metrics.phase}</span></div>
            <div>Knee Angle: <span className="font-bold text-white">{Math.round((metrics.kneeAngleLeft + metrics.kneeAngleRight) / 2)}°</span></div>
            <div>Depth: <span className="font-bold text-white">{metrics.depthPercentage}</span></div>
            <div>Valid Rep: <span className={metrics.isValidRep ? 'font-bold text-emerald-400' : 'text-slate-400'}>{metrics.isValidRep ? 'true' : 'false'}</span></div>
          </div>
        )}
      </div>

      {/* Network Diagnostic Modal */}
      <NetworkDiagnosticModal isOpen={diagModalOpen} onClose={() => setDiagModalOpen(false)} />
    </>
  )
}
