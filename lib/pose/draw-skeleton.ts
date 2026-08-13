import { ExerciseMetrics, NormalizedLandmark } from './types'

export interface DrawSkeletonOptions {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  landmarks: NormalizedLandmark[]
  isMirrored?: boolean
  metrics?: ExerciseMetrics | null
}

const POSE_CONNECTIONS: [number, number, string?][] = [
  // Torso & shoulders
  [11, 12, 'torso'],
  [11, 23, 'torso'],
  [12, 24, 'torso'],
  [23, 24, 'torso'],
  // Left arm
  [11, 13, 'arm'],
  [13, 15, 'arm'],
  // Right arm
  [12, 14, 'arm'],
  [14, 16, 'arm'],
  // Left leg
  [23, 25, 'legL'],
  [25, 27, 'legL'],
  [27, 29, 'foot'],
  [27, 31, 'foot'],
  // Right leg
  [24, 26, 'legR'],
  [26, 28, 'legR'],
  [28, 30, 'foot'],
  [28, 32, 'foot'],
]

const KEYPOINTS_TO_DRAW = [
  0, // nose
  11, 12, // shoulders
  13, 14, // elbows
  15, 16, // wrists
  23, 24, // hips
  25, 26, // knees
  27, 28, // ankles
]

export function drawPoseSkeleton({
  ctx,
  width,
  height,
  landmarks,
  isMirrored = true,
  metrics,
}: DrawSkeletonOptions) {
  if (!landmarks || landmarks.length < 33) return

  ctx.save()

  // Handle camera mirroring if needed
  if (isMirrored) {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }

  const hasWarning = metrics?.hasWarning ?? false

  // Draw bone connection lines with glowing drop-shadow
  POSE_CONNECTIONS.forEach(([i, j, type]) => {
    const p1 = landmarks[i]
    const p2 = landmarks[j]

    if (!p1 || !p2 || (p1.visibility && p1.visibility < 0.4) || (p2.visibility && p2.visibility < 0.4)) {
      return
    }

    const x1 = p1.x * width
    const y1 = p1.y * height
    const x2 = p2.x * width
    const y2 = p2.y * height

    let strokeColor = 'rgba(168, 85, 247, 0.9)' // neon purple (#a855f7)
    let shadowColor = 'rgba(168, 85, 247, 0.8)'
    let lineWidth = 3.5

    // Highlight leg bones if warning (e.g. knee valgus)
    if (hasWarning && (type === 'legL' || type === 'legR')) {
      strokeColor = 'rgba(245, 158, 11, 0.95)' // warning yellow/orange
      shadowColor = 'rgba(245, 158, 11, 0.8)'
      lineWidth = 4.5
    } else if (type === 'torso') {
      strokeColor = 'rgba(129, 140, 248, 0.95)' // primary indigo/violet
      shadowColor = 'rgba(129, 140, 248, 0.8)'
    }

    ctx.shadowColor = shadowColor
    ctx.shadowBlur = 10
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  })

  // Draw glowing joint nodes
  KEYPOINTS_TO_DRAW.forEach((idx) => {
    const p = landmarks[idx]
    if (!p || (p.visibility && p.visibility < 0.4)) return

    const x = p.x * width
    const y = p.y * height

    let pointColor = 'rgba(56, 189, 248, 1)' // cyan (#38bdf8)
    let outerGlow = 'rgba(56, 189, 248, 0.4)'
    let radius = 5

    // Knees highlight
    if (idx === 25 || idx === 26) {
      radius = 6.5
      if (hasWarning) {
        pointColor = 'rgba(245, 158, 11, 1)'
        outerGlow = 'rgba(245, 158, 11, 0.6)'
      } else {
        pointColor = 'rgba(168, 85, 247, 1)'
        outerGlow = 'rgba(168, 85, 247, 0.5)'
      }
    }

    // Outer glow halo
    ctx.shadowColor = pointColor
    ctx.shadowBlur = 12
    ctx.fillStyle = outerGlow
    ctx.beginPath()
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2)
    ctx.fill()

    // Inner bright point
    ctx.fillStyle = pointColor
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.restore()
}
