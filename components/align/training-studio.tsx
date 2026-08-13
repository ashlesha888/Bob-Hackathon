'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Download,
  Loader2,
  Play,
  RefreshCw,
  Scan,
  Square,
  UserCheck,
  Video,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PoseSkeleton } from '@/components/align/pose-skeleton'
import { useAuth } from '@/lib/auth-context'
import { usePoseDetection } from '@/lib/pose/use-pose-detection'

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function TrainingStudio({ className }: { className?: string }) {
  const { user, selectedExercise, setSelectedExercise, openAuthModal } = useAuth()
  const currentExercise = selectedExercise || 'Bodyweight Squat'

  const {
    isActive,
    isInitializing,
    errorMessage,
    poseStatus,
    metrics,
    recordingState,
    availableCameras,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    startRecording,
    stopRecording,
    clearError,
    clearRecordedVideo,
  } = usePoseDetection({ exerciseName: currentExercise })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (recordingState.blobUrl) {
      setIsPreviewOpen(true)
    }
  }, [recordingState.blobUrl])

  // Badge styling depending on poseStatus
  const getStatusBadgeStyle = () => {
    switch (poseStatus) {
      case 'POSE DETECTED':
        return 'border-success/30 bg-success/15 text-success'
      case 'TOO FAR AWAY':
      case 'TOO CLOSE':
      case 'MULTIPLE PEOPLE DETECTED':
      case 'LOW CONFIDENCE':
        return 'border-warning/30 bg-warning/15 text-warning'
      case 'SEARCHING FOR POSE':
      case 'INITIALIZING':
        return 'border-primary/30 bg-primary/15 text-primary'
      default:
        return 'border-border bg-background/60 text-muted-foreground'
    }
  }

  return (
    <div
      id="scanner-card"
      className={cn(
        'relative w-full max-w-md rounded-3xl border border-border bg-card/70 p-3 shadow-2xl backdrop-blur-xl',
        className,
      )}
    >
      {/* Active exercise banner */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Activity className="size-3.5 text-primary" />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {currentExercise}
          </span>
        </div>

        {user ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <UserCheck className="size-3" />
            {user.name.split(' ')[0]}'s Session
          </span>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="text-[11px] font-medium text-primary hover:underline transition-colors"
          >
            Sign in to save
          </button>
        )}
      </div>

      {/* Camera Viewport Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-[radial-gradient(120%_100%_at_50%_0%,oklch(0.22_0.03_285)_0%,oklch(0.13_0.01_280)_60%)]">
        {/* Ambient Grid Pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Live Video Feed Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'scale-x-[-1]', // Mirror selfie camera
          )}
        />

        {/* AI Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-300',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Scanning beam animation */}
        <div
          aria-hidden="true"
          className="animate-align-scan pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/25 to-transparent z-10"
        />

        {/* 1. INACTIVE STATE: Aesthetic Scanner Preview with CTA Button */}
        {!isActive && !isInitializing && (
          <>
            <div className="absolute inset-0 grid place-items-center px-10 py-6">
              <PoseSkeleton className="animate-align-float opacity-80" />
            </div>

            {/* Start Camera CTA Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 p-6 text-center backdrop-blur-xs z-20">
              <div className="mb-3 grid size-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/15 animate-pulse">
                <Camera className="size-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                AI Movement Scanner
              </h3>
              <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                Enable camera for real-time pose tracking, depth scoring, and form feedback.
              </p>
              <button
                type="button"
                onClick={() => startCamera()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera className="size-4" />
                Start Camera
              </button>
            </div>
          </>
        )}

        {/* 2. INITIALIZING LOADING STATE */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-6 text-center backdrop-blur-md z-30">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="mt-4 font-display text-sm font-semibold text-foreground">
              Initializing AI Pose Engine...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Loading local computer vision models in your browser.
            </p>
          </div>
        )}

        {/* 3. ERROR OVERLAY */}
        {errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-6 text-center backdrop-blur-md z-40">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <h4 className="font-display text-sm font-bold text-foreground">Camera Access Issue</h4>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearError()
                  startCamera()
                }}
                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={clearError}
                className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Top Status Badges & Controls Toolbar */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between z-20">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur transition-all',
              getStatusBadgeStyle(),
            )}
          >
            <Scan className="size-3" />
            {isActive ? poseStatus : 'POSE DETECTED'}
          </span>

          <div className="flex items-center gap-1.5">
            {recordingState.isRecording ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/20 px-2.5 py-1 text-[11px] font-bold text-destructive backdrop-blur animate-pulse">
                <span className="size-2 rounded-full bg-destructive" />
                REC {formatTimer(recordingState.duration)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                LIVE
              </span>
            )}

            {isActive && (
              <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded-full border border-border backdrop-blur">
                {availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    title="Switch Camera"
                    className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <RefreshCw className="size-3" />
                  </button>
                )}

                {recordingState.isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    title="Stop Recording"
                    className="grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Square className="size-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    title="Start Recording Session"
                    className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Video className="size-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={stopCamera}
                  title="Stop Camera"
                  className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <CameraOff className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Score & Reps Overlay Cards */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between z-20">
          {/* Form Score Card */}
          <div className="rounded-xl border border-border bg-background/75 px-3 py-2 backdrop-blur-md shadow-lg">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold leading-none text-foreground">
                {metrics.formScore}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">/100</span>
            </div>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 text-[11px] font-semibold',
                metrics.scoreLabel === 'EXCELLENT FORM' || metrics.scoreLabel === 'GOOD FORM'
                  ? 'text-success'
                  : 'text-warning',
              )}
            >
              <CheckCircle2 className="size-3" />
              {metrics.scoreLabel}
            </span>
          </div>

          {/* Reps Count Card */}
          <div className="rounded-xl border border-border bg-background/75 px-3 py-2 text-right backdrop-blur-md shadow-lg">
            <span className="font-display text-3xl font-bold leading-none text-foreground">
              {metrics.reps}
            </span>
            <span className="mt-1 block text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              {metrics.reps === 1 ? 'REP' : 'REPS'}
            </span>
          </div>
        </div>

        {/* Development Debug Information Overlay */}
        {process.env.NODE_ENV !== 'production' && isActive && (
          <div className="absolute top-16 left-3 z-30 rounded-xl border border-primary/40 bg-black/85 p-2.5 font-mono text-[11px] text-emerald-400 backdrop-blur-md shadow-lg pointer-events-auto">
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

      {/* Live Feedback Card */}
      <div
        className={cn(
          'mt-3 flex items-start gap-3 rounded-2xl border p-3.5 transition-colors duration-300',
          metrics.feedbackType === 'warning'
            ? 'border-warning/30 bg-warning/10 text-warning'
            : metrics.feedbackType === 'success'
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-primary/30 bg-primary/10 text-primary',
        )}
      >
        <span
          className={cn(
            'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
            metrics.feedbackType === 'warning'
              ? 'bg-warning/20 text-warning'
              : metrics.feedbackType === 'success'
              ? 'bg-success/20 text-success'
              : 'bg-primary/20 text-primary',
          )}
        >
          <Activity className="size-4 animate-pulse" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide">
              Live AI Feedback
            </p>
            {metrics.phase !== 'STANDING' && (
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Phase: {metrics.phase}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-pretty text-sm font-medium leading-snug text-foreground">
            {metrics.feedback}
          </p>
        </div>
      </div>

      {/* Recorded Video Preview Modal */}
      {isPreviewOpen && recordingState.blobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Recorded Workout Session
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black">
              <video
                src={recordingState.blobUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Exercise: <strong className="text-foreground">{currentExercise}</strong> • Reps:{' '}
                <strong className="text-foreground">{metrics.reps}</strong>
              </div>
              <div className="flex gap-2">
                <a
                  href={recordingState.blobUrl}
                  download={`align-ai-${currentExercise.toLowerCase().replace(/\s+/g, '-')}-session.webm`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clearRecordedVideo()
                    setIsPreviewOpen(false)
                  }}
                  className="rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary"
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
