export interface Point2D {
  x: number
  y: number
  visibility?: number
}

export interface Point3D extends Point2D {
  z: number
}

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export type PoseStatus =
  | 'CAMERA OFF'
  | 'INITIALIZING'
  | 'SEARCHING FOR POSE'
  | 'POSE DETECTED'
  | 'TOO FAR AWAY'
  | 'TOO CLOSE'
  | 'MULTIPLE PEOPLE DETECTED'
  | 'LOW CONFIDENCE'

export type FormCheckStatus = 'GOOD' | 'WARNING' | 'IMPROVE' | 'DETECTING'

export type ExercisePhase =
  | 'STANDING'
  | 'DESCENDING'
  | 'BOTTOM'
  | 'ASCENDING'
  | 'RISING'
  | 'HOLDING'
  | 'EXECUTING'

export interface ExerciseMetrics {
  reps: number
  phase: ExercisePhase
  formScore: number
  scoreLabel: 'EXCELLENT FORM' | 'GOOD FORM' | 'NEEDS ATTENTION'
  feedback: string
  feedbackType: 'info' | 'warning' | 'success'
  kneeAngleLeft: number
  kneeAngleRight: number
  torsoAngle: number
  hipAngle: number
  depthPercentage: number
  hasWarning: boolean
  isValidRep?: boolean
  formCheckStatuses?: Record<string, FormCheckStatus>
}

export interface ExerciseDetector {
  id: string
  name: string
  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics
  reset(): void
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  blobUrl: string | null
  recordedBlob: Blob | null
}
