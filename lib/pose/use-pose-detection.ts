'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { checkIsSecureContext } from '@/lib/utils'
import { EXERCISE_DETECTORS } from './exercise-detector'
import { drawPoseSkeleton } from './draw-skeleton'
import { checkPoseConfidence, checkPoseDistance } from './geometry'
import type { PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision'
import {
  ExerciseDetector,
  ExerciseMetrics,
  NormalizedLandmark,
  PoseStatus,
  RecordingState,
} from './types'

export interface UsePoseDetectionOptions {
  exerciseName?: string
}

export interface TrainingSummaryData {
  exerciseName: string
  duration: number
  reps: number
  formScore: number
  scoreLabel: string
  formBreakdown: Record<string, number>
  blobUrl: string | null
  recordedBlob: Blob | null
}

const MEDIAPIPE_VERSION = '1.0.1'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

function makeInitialMetrics(exerciseName: string): ExerciseMetrics {
  return {
    reps: 0,
    phase: 'STANDING',
    formScore: 91,
    scoreLabel: 'GOOD FORM',
    feedback: `Ready for ${exerciseName}. Start camera to begin analysis.`,
    feedbackType: 'info',
    kneeAngleLeft: 180,
    kneeAngleRight: 180,
    torsoAngle: 0,
    hipAngle: 180,
    depthPercentage: 0,
    hasWarning: false,
    isValidRep: false,
  }
}

function getCameraErrorMessage(error: unknown): string {
  const err = error as DOMException & { message?: string; constraint?: string }
  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera permission was denied. Allow camera access for this site, then try again.'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera was found. Connect a camera and try again.'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The camera is already being used by another app or browser tab. Close it there and try again.'
    case 'OverconstrainedError':
      return `The selected camera does not support the requested settings${err.constraint ? ` (${err.constraint})` : ''}.`
    case 'SecurityError':
      return 'The browser blocked camera access for security reasons. Use HTTPS or localhost.'
    case 'AbortError':
      return 'The camera request was interrupted. Please try again.'
    case 'TypeError':
      return 'Camera access is unavailable. Open this page on HTTPS or localhost and use a supported browser.'
    default:
      return err?.message || 'Failed to access the camera.'
  }
}

export function usePoseDetection({ exerciseName = 'Bodyweight Squat' }: UsePoseDetectionOptions = {}) {
  const [isActive, setIsActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInsecureContext, setIsInsecureContext] = useState(false)
  const [poseStatus, setPoseStatus] = useState<PoseStatus>('CAMERA OFF')
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [micEnabled, setMicEnabled] = useState(true)
  const [trainingSummary, setTrainingSummary] = useState<TrainingSummaryData | null>(null)
  const [metrics, setMetrics] = useState<ExerciseMetrics>(() => makeInitialMetrics(exerciseName))
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    blobUrl: null,
    recordedBlob: null,
  })

  const detectorRef = useRef<ExerciseDetector | null>(null)
  const metricsRef = useRef<ExerciseMetrics>(metrics)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null)
  const poseLandmarkerPromiseRef = useRef<Promise<PoseLandmarker> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraRequestRef = useRef(0)
  const facingModeRef = useRef<'user' | 'environment'>('user')
  const lastDetectionTimestampRef = useRef(-1)

  useEffect(() => {
    metricsRef.current = metrics
  }, [metrics])

  useEffect(() => {
    facingModeRef.current = facingMode
  }, [facingMode])

  useEffect(() => {
    const factory = EXERCISE_DETECTORS[exerciseName] || EXERCISE_DETECTORS['Bodyweight Squat']
    detectorRef.current = factory()
    detectorRef.current.reset()
    const initial = makeInitialMetrics(exerciseName)
    metricsRef.current = initial
    setMetrics(initial)
  }, [exerciseName])

  const refreshCameraDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === 'videoinput')
      setAvailableCameras(cameras)
      if (cameras.length > 0) {
        const current = selectedCameraId && cameras.some((camera) => camera.deviceId === selectedCameraId)
        if (!current) setSelectedCameraId(cameras[0].deviceId || null)
      } else {
        setSelectedCameraId(null)
      }
    } catch (error) {
      console.warn('Could not enumerate media devices:', error)
    }
  }, [selectedCameraId])

  const stopDetectionLoop = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }, [])

  const initPoseLandmarker = useCallback(async (): Promise<PoseLandmarker> => {
    if (poseLandmarkerRef.current) return poseLandmarkerRef.current
    if (poseLandmarkerPromiseRef.current) return poseLandmarkerPromiseRef.current

    poseLandmarkerPromiseRef.current = (async () => {
      const { FilesetResolver, PoseLandmarker: PoseLandmarkerClass } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(WASM_URL)

      try {
        const landmarker = await PoseLandmarkerClass.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })
        poseLandmarkerRef.current = landmarker
        return landmarker
      } catch (gpuError) {
        console.warn('MediaPipe GPU initialization failed; falling back to CPU.', gpuError)
        const landmarker = await PoseLandmarkerClass.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })
        poseLandmarkerRef.current = landmarker
        return landmarker
      }
    })()

    try {
      return await poseLandmarkerPromiseRef.current
    } catch (error) {
      poseLandmarkerPromiseRef.current = null
      console.error('Failed to initialize MediaPipe Pose Landmarker:', error)
      throw new Error(
        'AI Pose Engine could not be loaded. Check your internet connection and make sure the MediaPipe model is reachable.',
      )
    }
  }, [])

  const stopMediaStream = useCallback(() => {
    const stream = mediaStreamRef.current
    mediaStreamRef.current = null
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // Track may already be stopped.
        }
      })
    }

    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
      video.removeAttribute('src')
    }
  }, [])

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1
    stopDetectionLoop()

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Recorder may already have stopped.
      }
    }
    mediaRecorderRef.current = null

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    stopMediaStream()
    lastDetectionTimestampRef.current = -1
    setIsActive(false)
    setIsInitializing(false)
    setPoseStatus('CAMERA OFF')
    setRecordingState((prev) => ({ ...prev, isRecording: false, isPaused: false }))
  }, [stopDetectionLoop, stopMediaStream])

  const waitForVideoReady = useCallback(async (video: HTMLVideoElement) => {
    video.muted = true
    video.autoplay = true
    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('autoplay', 'true')

    const isReady = () => video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0
    if (isReady()) {
      await video.play()
      return
    }

    await new Promise<void>((resolve, reject) => {
      let finished = false
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onReady)
        video.removeEventListener('canplay', onReady)
        video.removeEventListener('playing', onReady)
        window.clearTimeout(timeout)
      }
      const finish = () => {
        if (finished) return
        finished = true
        cleanup()
        resolve()
      }
      const fail = (error: Error) => {
        if (finished) return
        finished = true
        cleanup()
        reject(error)
      }
      const onReady = () => {
        void video.play().then(finish).catch(fail)
      }
      const timeout = window.setTimeout(() => {
        fail(new Error('Camera opened, but the video element did not receive frames within 8 seconds.'))
      }, 8000)

      video.addEventListener('loadedmetadata', onReady)
      video.addEventListener('canplay', onReady)
      video.addEventListener('playing', onReady)
      if (isReady()) onReady()
    })

    if (!isReady()) throw new Error('Camera opened, but no video frames are available.')
  }, [])

  const requestCameraStream = useCallback(async (deviceId?: string): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera access is not supported by this browser.')
    }

    const videoConstraints: MediaTrackConstraints = deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      : { facingMode: { ideal: facingModeRef.current }, width: { ideal: 1280 }, height: { ideal: 720 } }

    const tryVideo = async (withAudio: boolean) => {
      return navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: withAudio })
    }

    if (micEnabled) {
      try {
        return await tryVideo(true)
      } catch (error) {
        const name = (error as DOMException)?.name
        if (name !== 'NotAllowedError' && name !== 'NotFoundError' && name !== 'OverconstrainedError') {
          throw error
        }
        console.warn('Camera+microphone request failed; retrying camera-only:', error)
        setMicEnabled(false)
      }
    }

    try {
      return await tryVideo(false)
    } catch (error) {
      if ((error as DOMException)?.name === 'OverconstrainedError') {
        console.warn('Selected camera constraints failed; retrying with generic video constraints.')
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      throw error
    }
  }, [micEnabled])

  const startCamera = useCallback(async (deviceId?: string) => {
    const requestId = ++cameraRequestRef.current
    setErrorMessage(null)
    setIsInsecureContext(false)
    setIsInitializing(true)
    setPoseStatus('INITIALIZING')
    setIsActive(false)
    lastDetectionTimestampRef.current = -1

    const security = checkIsSecureContext()
    if (!security.isSecure) {
      setIsInsecureContext(true)
      setIsInitializing(false)
      setPoseStatus('CAMERA OFF')
      setErrorMessage(security.reason || 'Camera access requires HTTPS or localhost.')
      return
    }

    try {
      // Never keep an old camera stream alive while opening a new one.
      stopDetectionLoop()
      stopMediaStream()
      if (detectorRef.current) detectorRef.current.reset()

      const video = videoRef.current
      if (!video) throw new Error('Camera video element is not mounted yet. Please try again.')

      const stream = await requestCameraStream(deviceId)
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      mediaStreamRef.current = stream
      video.srcObject = stream
      await waitForVideoReady(video)

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const actualDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId
      if (actualDeviceId) setSelectedCameraId(actualDeviceId)

      await refreshCameraDevices()
      await initPoseLandmarker()

      if (requestId !== cameraRequestRef.current) return

      setIsActive(true)
      setIsInitializing(false)
      setPoseStatus('SEARCHING FOR POSE')
    } catch (error) {
      console.error('Camera initialization failed:', error)
      if (requestId !== cameraRequestRef.current) return
      stopMediaStream()
      stopDetectionLoop()
      setIsActive(false)
      setIsInitializing(false)
      setPoseStatus('CAMERA OFF')
      setErrorMessage(getCameraErrorMessage(error))
    }
  }, [initPoseLandmarker, refreshCameraDevices, requestCameraStream, stopDetectionLoop, stopMediaStream, waitForVideoReady])

  const toggleMic = useCallback(() => {
    const stream = mediaStreamRef.current
    const tracks = stream?.getAudioTracks() ?? []
    if (tracks.length === 0) {
      setMicEnabled((previous) => !previous)
      return
    }
    const next = !tracks[0].enabled
    tracks.forEach((track) => {
      track.enabled = next
    })
    setMicEnabled(next)
  }, [])

  const switchCamera = useCallback(async () => {
    if (isInitializing) return

    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex((camera) => camera.deviceId === selectedCameraId)
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % availableCameras.length : 0
      const nextCamera = availableCameras[nextIndex]
      if (nextCamera) {
        setSelectedCameraId(nextCamera.deviceId)
        await startCamera(nextCamera.deviceId)
        return
      }
    }

    const nextFacing = facingModeRef.current === 'user' ? 'environment' : 'user'
    facingModeRef.current = nextFacing
    setFacingMode(nextFacing)
    await startCamera()
  }, [availableCameras, isInitializing, selectedCameraId, startCamera])

  useEffect(() => {
    if (!isActive) return

    let cancelled = false
    let lastVideoTime = -1
    let frameThrottle = 0

    const processResult = (result: PoseLandmarkerResult, video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      if (cancelled) return

      if (result.landmarks.length > 0) {
        const poseLandmarks = result.landmarks[0] as NormalizedLandmark[]
        const confidence = checkPoseConfidence(poseLandmarks)
        const distance = checkPoseDistance(poseLandmarks)

        if (result.landmarks.length > 1) setPoseStatus('MULTIPLE PEOPLE DETECTED')
        else if (confidence < 0.45) setPoseStatus('LOW CONFIDENCE')
        else if (distance === 'too_far') setPoseStatus('TOO FAR AWAY')
        else if (distance === 'too_close') setPoseStatus('TOO CLOSE')
        else setPoseStatus('POSE DETECTED')

        const detector = detectorRef.current
        if (detector) {
          const currentMetrics = detector.analyze(poseLandmarks)
          frameThrottle += 1
          const previous = metricsRef.current
          if (
            currentMetrics.reps !== previous.reps ||
            currentMetrics.phase !== previous.phase ||
            currentMetrics.isValidRep ||
            frameThrottle % 3 === 0
          ) {
            metricsRef.current = currentMetrics
            setMetrics(currentMetrics)
          }

          drawPoseSkeleton({
            ctx,
            width: canvas.width,
            height: canvas.height,
            landmarks: poseLandmarks,
            isMirrored: facingModeRef.current === 'user',
            metrics: currentMetrics,
          })
        }
      } else {
        setPoseStatus('SEARCHING FOR POSE')
      }

      if (recordingState.isRecording && !recordingState.isPaused && recordCanvasRef.current) {
        const recordCanvas = recordCanvasRef.current
        if (recordCanvas.width !== canvas.width || recordCanvas.height !== canvas.height) {
          recordCanvas.width = canvas.width
          recordCanvas.height = canvas.height
        }
        const recordCtx = recordCanvas.getContext('2d')
        if (recordCtx) {
          recordCtx.clearRect(0, 0, recordCanvas.width, recordCanvas.height)
          if (facingModeRef.current === 'user') {
            recordCtx.save()
            recordCtx.translate(recordCanvas.width, 0)
            recordCtx.scale(-1, 1)
            recordCtx.drawImage(video, 0, 0, recordCanvas.width, recordCanvas.height)
            recordCtx.restore()
          } else {
            recordCtx.drawImage(video, 0, 0, recordCanvas.width, recordCanvas.height)
          }
          recordCtx.drawImage(canvas, 0, 0)
        }
      }
    }

    const renderLoop = () => {
      if (cancelled) return
      animationFrameIdRef.current = requestAnimationFrame(renderLoop)

      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = poseLandmarkerRef.current
      if (!video || !canvas || !landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
      if (video.videoWidth <= 0 || video.videoHeight <= 0) return

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime

      const timestamp = Math.max(Math.round(performance.now()), lastDetectionTimestampRef.current + 1)
      lastDetectionTimestampRef.current = timestamp

      try {
        // MediaPipe Tasks Vision 1.0.1 uses the callback form of detectForVideo.
        landmarker.detectForVideo(video, timestamp, (result) => {
          processResult(result, video, canvas, ctx)
        })
      } catch (error) {
        console.error('Pose detection error:', error)
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderLoop)

    return () => {
      cancelled = true
      stopDetectionLoop()
    }
  }, [isActive, recordingState.isPaused, recordingState.isRecording, stopDetectionLoop])

  const getSupportedMimeType = useCallback(() => {
    if (typeof MediaRecorder === 'undefined') return undefined
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
    return types.find((type) => MediaRecorder.isTypeSupported(type))
  }, [])

  const startRecording = useCallback(() => {
    if (!isActive || !videoRef.current || !canvasRef.current || typeof MediaRecorder === 'undefined') return
    try {
      detectorRef.current?.reset()
      const initial = makeInitialMetrics(exerciseName)
      metricsRef.current = initial
      setMetrics(initial)
      recordedChunksRef.current = []

      if (!recordCanvasRef.current) recordCanvasRef.current = document.createElement('canvas')
      const recordCanvas = recordCanvasRef.current
      recordCanvas.width = canvasRef.current.width || 640
      recordCanvas.height = canvasRef.current.height || 480

      const stream = recordCanvas.captureStream(30)
      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = mimeType?.split(';')[0] || 'video/webm'
        const blob = new Blob(recordedChunksRef.current, { type })
        const url = URL.createObjectURL(blob)
        setRecordingState((previous) => ({ ...previous, isRecording: false, isPaused: false, blobUrl: url, recordedBlob: blob }))
      }
      recorder.start(200)
      setRecordingState({ isRecording: true, isPaused: false, duration: 0, blobUrl: null, recordedBlob: null })
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = setInterval(() => {
        setRecordingState((previous) => previous.isPaused ? previous : { ...previous, duration: previous.duration + 1 })
      }, 1000)
    } catch (error) {
      console.error('Failed to start video recording:', error)
    }
  }, [exerciseName, getSupportedMimeType, isActive])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.pause()
    setRecordingState((previous) => ({ ...previous, isPaused: true }))
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') mediaRecorderRef.current.resume()
    setRecordingState((previous) => ({ ...previous, isPaused: false }))
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try { mediaRecorderRef.current?.stop() } catch { /* already stopped */ }
    }
    mediaRecorderRef.current = null
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const currentMetrics = metricsRef.current
    const formBreakdown: Record<string, number> = {}
    if (currentMetrics.formCheckStatuses) {
      Object.entries(currentMetrics.formCheckStatuses).forEach(([key, status]) => {
        formBreakdown[key] = status === 'GOOD' ? 92 : status === 'WARNING' ? 75 : status === 'IMPROVE' ? 65 : 0
      })
    } else {
      formBreakdown['Form Accuracy'] = currentMetrics.formScore
    }

    setTrainingSummary({
      exerciseName,
      duration: recordingState.duration,
      reps: currentMetrics.reps,
      formScore: currentMetrics.formScore,
      scoreLabel: currentMetrics.scoreLabel,
      formBreakdown,
      blobUrl: recordingState.blobUrl,
      recordedBlob: recordingState.recordedBlob,
    })
  }, [exerciseName, recordingState.blobUrl, recordingState.duration, recordingState.recordedBlob])

  const clearRecordedVideo = useCallback(() => {
    if (recordingState.blobUrl) URL.revokeObjectURL(recordingState.blobUrl)
    setRecordingState({ isRecording: false, isPaused: false, duration: 0, blobUrl: null, recordedBlob: null })
  }, [recordingState.blobUrl])

  const clearSummary = useCallback(() => setTrainingSummary(null), [])
  const clearError = useCallback(() => {
    setErrorMessage(null)
    setIsInsecureContext(false)
  }, [])

  useEffect(() => {
    void refreshCameraDevices()
    const handleDeviceChange = () => void refreshCameraDevices()
    navigator.mediaDevices?.addEventListener?.('devicechange', handleDeviceChange)
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', handleDeviceChange)
  }, [refreshCameraDevices])

  useEffect(() => {
    return () => {
      stopCamera()
      if (poseLandmarkerRef.current) {
        try { poseLandmarkerRef.current.close() } catch { /* already closed */ }
        poseLandmarkerRef.current = null
      }
      poseLandmarkerPromiseRef.current = null
    }
  }, [stopCamera])

  return {
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
    clearRecordedVideo,
  }
}
