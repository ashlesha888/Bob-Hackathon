'use client'

import { useEffect, useRef } from 'react'
import { EXERCISES_DATA } from '@/lib/exercise-data'
import { usePoseDetection } from '@/lib/pose/use-pose-detection'
import { ExerciseTutorial } from './exercise-tutorial'
import { FormAnalysis } from './form-analysis'
import { CameraView } from './camera-view'
import { CameraControls } from './camera-controls'
import { SessionSummary } from './session-summary'

interface ExerciseCoachingProps {
  exerciseName: string
  onClose: () => void
}

export function ExerciseCoaching({ exerciseName, onClose }: ExerciseCoachingProps) {
  const exercise = EXERCISES_DATA[exerciseName] || EXERCISES_DATA['Bodyweight Squat']
  const cameraContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    isActive,
    isInitializing,
    errorMessage,
    isInsecureContext,
    poseStatus,
    metrics,
    recordingState,
    availableCameras,
    micEnabled,
    trainingSummary,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    toggleMic,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearSummary,
    clearError,
  } = usePoseDetection({ exerciseName: exercise.name })

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = () => {
      stopCamera()
      onClose()
    }

    // Push history state if not already pushed
    if (typeof window !== 'undefined') {
      window.history.pushState(
        { coaching: true, exercise: exercise.name },
        '',
        `#coaching?exercise=${encodeURIComponent(exercise.id)}`,
      )
      window.addEventListener('popstate', handlePopState)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [exercise.id, exercise.name, onClose, stopCamera])

  const handleToggleFullscreen = () => {
    if (cameraContainerRef.current) {
      if (!document.fullscreenElement) {
        cameraContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Error enabling fullscreen:', err)
        })
      } else {
        document.exitFullscreen().catch((err) => {
          console.warn('Error exiting fullscreen:', err)
        })
      }
    }
  }

  const handleTrainAgain = () => {
    clearSummary()
    if (!isActive) {
      startCamera()
    }
  }

  return (
    <div id="coaching-studio" className="w-full animate-fade-up scroll-mt-24">
      {/* 2-Column Responsive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT 1/3: Exercise Tutorial & AI Form Check Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ExerciseTutorial exercise={exercise} onBack={onClose} />
          <FormAnalysis
            formChecks={exercise.formChecks}
            formCheckStatuses={metrics.formCheckStatuses}
            isCameraActive={isActive}
            poseStatus={poseStatus}
          />
        </div>

        {/* Vertical Divider for desktop */}
        <div className="hidden lg:block lg:col-span-8 flex flex-col gap-6 pl-0 lg:pl-2 border-l border-border/60">
          {trainingSummary ? (
            <div className="flex justify-center py-4">
              <SessionSummary
                summary={trainingSummary}
                onTrainAgain={handleTrainAgain}
                onChooseAnother={onClose}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <CameraView
                containerRef={cameraContainerRef}
                exerciseName={exercise.name}
                isHold={exercise.isHold}
                isActive={isActive}
                isInitializing={isInitializing}
                errorMessage={errorMessage}
                isInsecureContext={isInsecureContext}
                poseStatus={poseStatus}
                metrics={metrics}
                recordingState={recordingState}
                videoRef={videoRef}
                canvasRef={canvasRef}
                onStartCamera={startCamera}
                onClearError={clearError}
              />

              <CameraControls
                isCameraActive={isActive}
                isRecording={recordingState.isRecording}
                isPaused={recordingState.isPaused}
                micEnabled={micEnabled}
                availableCamerasCount={availableCameras.length}
                onStartCamera={startCamera}
                onStopCamera={stopCamera}
                onStartTraining={startRecording}
                onPauseTraining={pauseRecording}
                onResumeTraining={resumeRecording}
                onStopTraining={stopRecording}
                onSwitchCamera={switchCamera}
                onToggleMic={toggleMic}
                onToggleFullscreen={handleToggleFullscreen}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        {/* Mobile View layout wrapper */}
        <div className="block lg:hidden flex flex-col gap-6">
          {trainingSummary ? (
            <SessionSummary
              summary={trainingSummary}
              onTrainAgain={handleTrainAgain}
              onChooseAnother={onClose}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <CameraView
                containerRef={cameraContainerRef}
                exerciseName={exercise.name}
                isHold={exercise.isHold}
                isActive={isActive}
                isInitializing={isInitializing}
                errorMessage={errorMessage}
                isInsecureContext={isInsecureContext}
                poseStatus={poseStatus}
                metrics={metrics}
                recordingState={recordingState}
                videoRef={videoRef}
                canvasRef={canvasRef}
                onStartCamera={startCamera}
                onClearError={clearError}
              />

              <CameraControls
                isCameraActive={isActive}
                isRecording={recordingState.isRecording}
                isPaused={recordingState.isPaused}
                micEnabled={micEnabled}
                availableCamerasCount={availableCameras.length}
                onStartCamera={startCamera}
                onStopCamera={stopCamera}
                onStartTraining={startRecording}
                onPauseTraining={pauseRecording}
                onResumeTraining={resumeRecording}
                onStopTraining={stopRecording}
                onSwitchCamera={switchCamera}
                onToggleMic={toggleMic}
                onToggleFullscreen={handleToggleFullscreen}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
