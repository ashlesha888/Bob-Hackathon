import { NormalizedLandmark } from './types'

/**
 * Calculates 2D angle (in degrees) at joint B formed by segment AB and segment BC.
 * Returns angle between 0 and 180 degrees.
 */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark,
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }

  return Math.round(angle * 10) / 10
}

/**
 * Calculates 2D Euclidean distance between two landmarks.
 */
export function calculateDistance(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/**
 * Calculates torso inclination angle relative to vertical (0 deg = straight upright).
 */
export function calculateTorsoAngle(
  shoulderL: NormalizedLandmark,
  shoulderR: NormalizedLandmark,
  hipL: NormalizedLandmark,
  hipR: NormalizedLandmark,
): number {
  const midShoulderX = (shoulderL.x + shoulderR.x) / 2
  const midShoulderY = (shoulderL.y + shoulderR.y) / 2
  const midHipX = (hipL.x + hipR.x) / 2
  const midHipY = (hipL.y + hipR.y) / 2

  // Vector from hip to shoulder
  const dx = midShoulderX - midHipX
  const dy = midShoulderY - midHipY // note: canvas Y goes downward

  // Vertical reference vector is (0, -1) (straight up)
  // Angle with vertical: atan2(|dx|, |dy|)
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy))
  const angle = (radians * 180.0) / Math.PI

  return Math.round(angle * 10) / 10
}

/**
 * Checks for knee valgus (knees caving inward relative to feet/hips).
 * Returns true if knee width ratio relative to ankle width is abnormally low.
 */
export function checkKneeValgus(
  hipL: NormalizedLandmark,
  hipR: NormalizedLandmark,
  kneeL: NormalizedLandmark,
  kneeR: NormalizedLandmark,
  ankleL: NormalizedLandmark,
  ankleR: NormalizedLandmark,
): boolean {
  const hipWidth = Math.abs(hipR.x - hipL.x)
  const kneeWidth = Math.abs(kneeR.x - kneeL.x)
  const ankleWidth = Math.abs(ankleR.x - ankleL.x)

  if (ankleWidth < 0.05) return false

  // If knees are significantly narrower than ankles compared to hip ratio
  const kneeToAnkleRatio = kneeWidth / Math.max(ankleWidth, hipWidth * 0.9)
  return kneeToAnkleRatio < 0.72
}

/**
 * Checks if the user is too far or too close to the camera based on bounding height.
 */
export function checkPoseDistance(landmarks: NormalizedLandmark[]): 'too_far' | 'too_close' | 'ok' {
  if (!landmarks || landmarks.length < 33) return 'ok'

  const nose = landmarks[0]
  const ankleL = landmarks[27]
  const ankleR = landmarks[28]

  if (!nose || !ankleL || !ankleR) return 'ok'

  const midAnkleY = (ankleL.y + ankleR.y) / 2
  const heightRatio = Math.abs(midAnkleY - nose.y)

  if (heightRatio < 0.35) return 'too_far'
  if (heightRatio > 0.92) return 'too_close'
  return 'ok'
}

/**
 * Calculates average confidence/visibility score for essential keypoints.
 */
export function checkPoseConfidence(landmarks: NormalizedLandmark[]): number {
  const keyIndices = [11, 12, 23, 24, 25, 26, 27, 28] // shoulders, hips, knees, ankles
  let totalVis = 0
  let count = 0

  for (const idx of keyIndices) {
    if (landmarks[idx] && typeof landmarks[idx].visibility === 'number') {
      totalVis += landmarks[idx].visibility!
      count++
    }
  }

  return count > 0 ? totalVis / count : 1.0
}
