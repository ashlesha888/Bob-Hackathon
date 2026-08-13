'use client'

import { useState } from 'react'
import {
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Pause,
  Play,
  RefreshCw,
  Square,
  Video,
  X,
} from 'lucide-react'

interface CameraControlsProps {
  isCameraActive: boolean
  isRecording: boolean
  isPaused: boolean
  micEnabled: boolean
  availableCamerasCount: number
  onStartCamera: () => void
  onStopCamera: () => void
  onStartTraining: () => void
  onPauseTraining: () => void
  onResumeTraining: () => void
  onStopTraining: () => void
  onSwitchCamera: () => void
  onToggleMic: () => void
  onToggleFullscreen?: () => void
  onClose: () => void
}

export function CameraControls({
  isCameraActive,
  isRecording,
  isPaused,
  micEnabled,
  availableCamerasCount,
  onStartCamera,
  onStopCamera,
  onStartTraining,
  onPauseTraining,
  onResumeTraining,
  onStopTraining,
  onSwitchCamera,
  onToggleMic,
  onToggleFullscreen,
  onClose,
}: CameraControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreenClick = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen()
      setIsFullscreen((prev) => !prev)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-xl backdrop-blur-xl">
      {/* Left side utility controls */}
      <div className="flex items-center gap-2">
        {isCameraActive && (
          <>
            <button
              type="button"
              onClick={onToggleMic}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              className={`grid size-10 place-items-center rounded-xl border transition-all cursor-pointer ${
                micEnabled
                  ? 'border-border bg-secondary/50 text-foreground hover:bg-secondary'
                  : 'border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25'
              }`}
            >
              {micEnabled ? <Mic className="size-4.5" /> : <MicOff className="size-4.5" />}
            </button>

            {availableCamerasCount > 1 && (
              <button
                type="button"
                onClick={onSwitchCamera}
                title="Switch Camera"
                className="grid size-10 place-items-center rounded-xl border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                <RefreshCw className="size-4.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onStopCamera}
              title="Turn Off Camera"
              className="grid size-10 place-items-center rounded-xl border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
            >
              <CameraOff className="size-4.5" />
            </button>
          </>
        )}
      </div>

      {/* Main Center Action Button */}
      <div className="flex items-center gap-2">
        {!isCameraActive ? (
          <button
            type="button"
            onClick={onStartCamera}
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Camera className="size-4.5" />
            Start Camera
          </button>
        ) : !isRecording ? (
          <button
            type="button"
            onClick={onStartTraining}
            className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-pulse"
          >
            <Video className="size-4.5" />
            Start Training
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                type="button"
                onClick={onResumeTraining}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:bg-primary/90 cursor-pointer"
              >
                <Play className="size-4" />
                Resume
              </button>
            ) : (
              <button
                type="button"
                onClick={onPauseTraining}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer"
              >
                <Pause className="size-4" />
                Pause
              </button>
            )}

            <button
              type="button"
              onClick={onStopTraining}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-destructive-foreground shadow-md transition-all hover:bg-destructive/90 cursor-pointer"
            >
              <Square className="size-4" />
              Stop Training
            </button>
          </>
        )}
      </div>

      {/* Right side utility controls */}
      <div className="flex items-center gap-2">
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={handleFullscreenClick}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="grid size-10 place-items-center rounded-xl border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="size-4.5" /> : <Maximize2 className="size-4.5" />}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          title="Exit Coaching Mode"
          className="grid size-10 place-items-center rounded-xl border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
        >
          <X className="size-4.5" />
        </button>
      </div>
    </div>
  )
}
