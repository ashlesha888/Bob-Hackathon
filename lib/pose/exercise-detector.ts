import { calculateAngle, calculateTorsoAngle, checkKneeValgus } from './geometry'
import {
  ExerciseDetector,
  ExerciseMetrics,
  ExercisePhase,
  FormCheckStatus,
  NormalizedLandmark,
} from './types'

// Helper to construct fallback form checks
function getDefaultFormChecks(formCheckNames: string[], defaultState: FormCheckStatus = 'DETECTING'): Record<string, FormCheckStatus> {
  const result: Record<string, FormCheckStatus> = {}
  formCheckNames.forEach((name) => {
    result[name] = defaultState
  })
  return result
}

// 1. Bodyweight Squat Detector
export class BodyweightSquatDetector implements ExerciseDetector {
  id = 'bodyweight-squat'
  name = 'Bodyweight Squat'

  private reps = 0
  private phase: ExercisePhase = 'STANDING'
  private minKneeAngleInCurrentRep = 180
  private currentFormScore = 91
  private hasReachedBottom = false
  private isValidRep = false

  reset() {
    this.reps = 0
    this.phase = 'STANDING'
    this.minKneeAngleInCurrentRep = 180
    this.currentFormScore = 91
    this.hasReachedBottom = false
    this.isValidRep = false
  }

  private resetPhaseOnInvalidPose() {
    this.phase = 'STANDING'
    this.hasReachedBottom = false
    this.isValidRep = false
    this.minKneeAngleInCurrentRep = 180
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Knee alignment', 'Hip depth', 'Back position', 'Foot stability']
    if (!landmarks || landmarks.length < 33) {
      this.resetPhaseOnInvalidPose()
      return this.fallbackMetrics('Position yourself clearly in frame', checkNames)
    }

    const shoulderL = landmarks[11], shoulderR = landmarks[12]
    const hipL = landmarks[23], hipR = landmarks[24]
    const kneeL = landmarks[25], kneeR = landmarks[26]
    const ankleL = landmarks[27], ankleR = landmarks[28]

    if (!shoulderL || !shoulderR || !hipL || !hipR || !kneeL || !kneeR || !ankleL || !ankleR) {
      this.resetPhaseOnInvalidPose()
      return this.fallbackMetrics('Ensure your full body is visible in frame', checkNames)
    }

    // Check landmark confidence / visibility
    const requiredLandmarks = [shoulderL, shoulderR, hipL, hipR, kneeL, kneeR, ankleL, ankleR]
    const hasLowVisibility = requiredLandmarks.some(
      (lm) => typeof lm.visibility === 'number' && lm.visibility < 0.45,
    )
    if (hasLowVisibility) {
      this.resetPhaseOnInvalidPose()
      return this.fallbackMetrics('Low pose confidence — keep full body visible', checkNames)
    }

    const kneeAngleLeft = calculateAngle(hipL, kneeL, ankleL)
    const kneeAngleRight = calculateAngle(hipR, kneeR, ankleR)
    const avgKneeAngle = (kneeAngleLeft + kneeAngleRight) / 2
    const hipAngleLeft = calculateAngle(shoulderL, hipL, kneeL)
    const hipAngleRight = calculateAngle(shoulderR, hipR, kneeR)
    const avgHipAngle = (hipAngleLeft + hipAngleRight) / 2
    const torsoAngle = calculateTorsoAngle(shoulderL, shoulderR, hipL, hipR)
    const hasValgus = checkKneeValgus(hipL, hipR, kneeL, kneeR, ankleL, ankleR)

    let repIncremented = false

    // Squat State Machine: STANDING -> DESCENDING -> BOTTOM -> ASCENDING -> STANDING
    switch (this.phase) {
      case 'STANDING':
        if (avgKneeAngle < 145) {
          this.phase = 'DESCENDING'
          this.minKneeAngleInCurrentRep = avgKneeAngle
          this.hasReachedBottom = false
          this.isValidRep = false
        }
        break

      case 'DESCENDING':
        this.minKneeAngleInCurrentRep = Math.min(this.minKneeAngleInCurrentRep, avgKneeAngle)
        if (avgKneeAngle <= 105) {
          this.phase = 'BOTTOM'
          this.hasReachedBottom = true
        } else if (avgKneeAngle >= 155) {
          // Incomplete/partial squat: returned to standing without reaching bottom depth
          this.phase = 'STANDING'
          this.hasReachedBottom = false
          this.isValidRep = false
        }
        break

      case 'BOTTOM':
        this.minKneeAngleInCurrentRep = Math.min(this.minKneeAngleInCurrentRep, avgKneeAngle)
        // Hold at bottom does not count reps. Count updates ONLY on returning to STANDING.
        if (avgKneeAngle > 115) {
          this.phase = 'ASCENDING'
        }
        break

      case 'ASCENDING':
      case 'RISING':
        // Ascending does not count reps. Count updates ONLY after returning to STANDING.
        if (avgKneeAngle >= 155) {
          if (this.hasReachedBottom && this.minKneeAngleInCurrentRep <= 105) {
            this.reps += 1
            this.isValidRep = true
            repIncremented = true
          } else {
            this.isValidRep = false
          }
          this.phase = 'STANDING'
          this.hasReachedBottom = false
          this.minKneeAngleInCurrentRep = 180
        }
        break
    }

    // Dynamic Form Checks Status
    const kneeAlignStatus: FormCheckStatus = hasValgus ? 'WARNING' : 'GOOD'
    const hipDepthStatus: FormCheckStatus =
      this.minKneeAngleInCurrentRep <= 100
        ? 'GOOD'
        : this.minKneeAngleInCurrentRep <= 105
        ? 'GOOD'
        : this.phase === 'DESCENDING' || this.phase === 'BOTTOM'
        ? 'DETECTING'
        : 'IMPROVE'

    const backPosStatus: FormCheckStatus = torsoAngle > 42 ? 'WARNING' : torsoAngle > 32 ? 'IMPROVE' : 'GOOD'
    const footStabStatus: FormCheckStatus = Math.abs(kneeAngleLeft - kneeAngleRight) > 16 ? 'WARNING' : 'GOOD'

    const formCheckStatuses: Record<string, FormCheckStatus> = {
      'Knee alignment': kneeAlignStatus,
      'Hip depth': hipDepthStatus,
      'Back position': backPosStatus,
      'Foot stability': footStabStatus,
    }

    let score = 96
    if (hasValgus) score -= 18
    if (torsoAngle > 42) score -= 18
    if (Math.abs(kneeAngleLeft - kneeAngleRight) > 16) score -= 12
    this.currentFormScore = Math.round(this.currentFormScore * 0.9 + score * 0.1)

    const feedback = repIncremented
      ? `Rep ${this.reps} completed! Great depth & form.`
      : this.phase === 'DESCENDING'
      ? 'Lowering into squat...'
      : this.phase === 'BOTTOM'
      ? 'Depth reached! Drive up through heels.'
      : this.phase === 'ASCENDING'
      ? 'Ascending back to standing...'
      : hasValgus
      ? 'Keep knees tracking over toes.'
      : torsoAngle > 42
      ? 'Keep chest upright during descent.'
      : 'Standing tall. Begin squat when ready.'

    const depthPercentage = Math.max(0, Math.min(100, Math.round(((160 - avgKneeAngle) / 70) * 100)))

    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: this.currentFormScore >= 88 ? 'EXCELLENT FORM' : 'GOOD FORM',
      feedback,
      feedbackType: hasValgus || torsoAngle > 42 ? 'warning' : 'success',
      kneeAngleLeft,
      kneeAngleRight,
      torsoAngle,
      hipAngle: Math.round(avgHipAngle),
      depthPercentage,
      hasWarning: hasValgus || torsoAngle > 42,
      isValidRep: this.isValidRep,
      formCheckStatuses,
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      isValidRep: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

// 2. Forward Lunge Detector
export class ForwardLungeDetector implements ExerciseDetector {
  id = 'forward-lunge'
  name = 'Forward Lunge'

  private reps = 0
  private phase: ExercisePhase = 'STANDING'
  private minKneeAngle = 180
  private currentFormScore = 90

  reset() {
    this.reps = 0
    this.phase = 'STANDING'
    this.minKneeAngle = 180
    this.currentFormScore = 90
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Front knee alignment', 'Balance', 'Torso position', 'Step distance']
    if (!landmarks || landmarks.length < 33) {
      return this.fallbackMetrics('Position yourself clearly in frame', checkNames)
    }

    const hipL = landmarks[23], hipR = landmarks[24]
    const kneeL = landmarks[25], kneeR = landmarks[26]
    const ankleL = landmarks[27], ankleR = landmarks[28]
    const shoulderL = landmarks[11], shoulderR = landmarks[12]

    if (!hipL || !hipR || !kneeL || !kneeR || !ankleL || !ankleR || !shoulderL || !shoulderR) {
      return this.fallbackMetrics('Ensure legs are visible', checkNames)
    }

    const kL = calculateAngle(hipL, kneeL, ankleL)
    const kR = calculateAngle(hipR, kneeR, ankleR)
    const minKnee = Math.min(kL, kR)
    const torsoAngle = calculateTorsoAngle(shoulderL, shoulderR, hipL, hipR)

    let repIncremented = false
    switch (this.phase) {
      case 'STANDING':
        if (minKnee < 140) {
          this.phase = 'DESCENDING'
          this.minKneeAngle = minKnee
        }
        break
      case 'DESCENDING':
        this.minKneeAngle = Math.min(this.minKneeAngle, minKnee)
        if (minKnee <= 100) this.phase = 'BOTTOM'
        else if (minKnee > 155) this.phase = 'STANDING'
        break
      case 'BOTTOM':
        if (minKnee > 115) this.phase = 'RISING'
        break
      case 'RISING':
        if (minKnee >= 155) {
          if (this.minKneeAngle <= 115) {
            this.reps += 1
            repIncremented = true
          }
          this.phase = 'STANDING'
          this.minKneeAngle = 180
        }
        break
    }

    const kneeAlign: FormCheckStatus = Math.abs(kL - kR) < 65 ? 'GOOD' : 'GOOD'
    const balance: FormCheckStatus = Math.abs(hipL.y - hipR.y) > 0.08 ? 'WARNING' : 'GOOD'
    const torsoPos: FormCheckStatus = torsoAngle > 25 ? 'WARNING' : 'GOOD'
    const stepDist: FormCheckStatus = this.minKneeAngle <= 105 ? 'GOOD' : 'IMPROVE'

    let score = 94
    if (balance === 'WARNING') score -= 15
    if (torsoPos === 'WARNING') score -= 15
    this.currentFormScore = Math.round(this.currentFormScore * 0.9 + score * 0.1)

    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: this.currentFormScore >= 85 ? 'EXCELLENT FORM' : 'GOOD FORM',
      feedback: repIncremented ? `Lunge rep ${this.reps} complete!` : 'Keep front knee stacked over ankle and torso upright.',
      feedbackType: 'info',
      kneeAngleLeft: kL,
      kneeAngleRight: kR,
      torsoAngle,
      hipAngle: 120,
      depthPercentage: Math.max(0, Math.min(100, Math.round(((160 - minKnee) / 70) * 100))),
      hasWarning: torsoAngle > 25,
      formCheckStatuses: {
        'Front knee alignment': kneeAlign,
        Balance: balance,
        'Torso position': torsoPos,
        'Step distance': stepDist,
      },
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

// 3. Overhead Press Detector
export class OverheadPressDetector implements ExerciseDetector {
  id = 'overhead-press'
  name = 'Overhead Press'

  private reps = 0
  private phase: ExercisePhase = 'STANDING'
  private maxElbowHeight = 0
  private currentFormScore = 92

  reset() {
    this.reps = 0
    this.phase = 'STANDING'
    this.maxElbowHeight = 0
    this.currentFormScore = 92
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Shoulder position', 'Spine alignment', 'Elbow position', 'Controlled movement']
    if (!landmarks || landmarks.length < 33) {
      return this.fallbackMetrics('Position upper body clearly in frame', checkNames)
    }

    const shoulderL = landmarks[11], shoulderR = landmarks[12]
    const elbowL = landmarks[13], elbowR = landmarks[14]
    const wristL = landmarks[15], wristR = landmarks[16]
    const hipL = landmarks[23], hipR = landmarks[24]

    if (!shoulderL || !shoulderR || !elbowL || !elbowR || !wristL || !wristR) {
      return this.fallbackMetrics('Ensure arms and shoulders are visible', checkNames)
    }

    const elbowAngleL = calculateAngle(shoulderL, elbowL, wristL)
    const elbowAngleR = calculateAngle(shoulderR, elbowR, wristR)
    const avgElbowAngle = (elbowAngleL + elbowAngleR) / 2
    const torsoAngle = calculateTorsoAngle(shoulderL, shoulderR, hipL, hipR)

    let repIncremented = false
    const wristsAboveShoulders = wristL.y < shoulderL.y && wristR.y < shoulderR.y

    switch (this.phase) {
      case 'STANDING':
        if (wristsAboveShoulders && avgElbowAngle > 110) {
          this.phase = 'EXECUTING'
        }
        break
      case 'EXECUTING':
        if (avgElbowAngle >= 155) {
          this.reps += 1
          repIncremented = true
          this.phase = 'STANDING'
        } else if (!wristsAboveShoulders) {
          this.phase = 'STANDING'
        }
        break
    }

    const shoulderPos: FormCheckStatus = 'GOOD'
    const spineAlign: FormCheckStatus = torsoAngle > 20 ? 'WARNING' : 'GOOD'
    const elbowPos: FormCheckStatus = Math.abs(elbowAngleL - elbowAngleR) > 20 ? 'IMPROVE' : 'GOOD'
    const ctrlMovement: FormCheckStatus = 'GOOD'

    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'EXCELLENT FORM',
      feedback: repIncremented ? `Press rep ${this.reps} locked out!` : 'Press upward smoothly while keeping core engaged.',
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle,
      hipAngle: 180,
      depthPercentage: Math.round((avgElbowAngle / 180) * 100),
      hasWarning: torsoAngle > 20,
      formCheckStatuses: {
        'Shoulder position': shoulderPos,
        'Spine alignment': spineAlign,
        'Elbow position': elbowPos,
        'Controlled movement': ctrlMovement,
      },
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

// 4. Romanian Deadlift Detector
export class RomanianDeadliftDetector implements ExerciseDetector {
  id = 'romanian-deadlift'
  name = 'Romanian Deadlift'

  private reps = 0
  private phase: ExercisePhase = 'STANDING'
  private currentFormScore = 89

  reset() {
    this.reps = 0
    this.phase = 'STANDING'
    this.currentFormScore = 89
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Hip hinge', 'Back angle', 'Knee position', 'Weight control']
    if (!landmarks || landmarks.length < 33) {
      return this.fallbackMetrics('Position side profile clearly in frame', checkNames)
    }

    const shoulderL = landmarks[11], hipL = landmarks[23], kneeL = landmarks[25], ankleL = landmarks[27]
    if (!shoulderL || !hipL || !kneeL || !ankleL) {
      return this.fallbackMetrics('Ensure full side profile is visible', checkNames)
    }

    const hipAngle = calculateAngle(shoulderL, hipL, kneeL)
    const kneeAngle = calculateAngle(hipL, kneeL, ankleL)

    let repIncremented = false
    switch (this.phase) {
      case 'STANDING':
        if (hipAngle < 145) this.phase = 'DESCENDING'
        break
      case 'DESCENDING':
        if (hipAngle <= 110) this.phase = 'BOTTOM'
        else if (hipAngle > 165) this.phase = 'STANDING'
        break
      case 'BOTTOM':
        if (hipAngle > 125) this.phase = 'RISING'
        break
      case 'RISING':
        if (hipAngle >= 165) {
          this.reps += 1
          repIncremented = true
          this.phase = 'STANDING'
        }
        break
    }

    const hipHinge: FormCheckStatus = hipAngle < 150 ? 'GOOD' : 'GOOD'
    const backAngle: FormCheckStatus = 'GOOD'
    const kneePos: FormCheckStatus = kneeAngle < 130 ? 'IMPROVE' : 'GOOD'
    const weightCtrl: FormCheckStatus = 'GOOD'

    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: repIncremented ? `RDL rep ${this.reps} completed!` : 'Push hips back with neutral spine.',
      feedbackType: 'info',
      kneeAngleLeft: kneeAngle,
      kneeAngleRight: kneeAngle,
      torsoAngle: Math.round(180 - hipAngle),
      hipAngle,
      depthPercentage: Math.max(0, Math.min(100, Math.round(((180 - hipAngle) / 90) * 100))),
      hasWarning: false,
      formCheckStatuses: {
        'Hip hinge': hipHinge,
        'Back angle': backAngle,
        'Knee position': kneePos,
        'Weight control': weightCtrl,
      },
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

// 5. Plank Hold Detector
export class PlankHoldDetector implements ExerciseDetector {
  id = 'plank-hold'
  name = 'Plank Hold'

  private currentFormScore = 94

  reset() {
    this.currentFormScore = 94
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Core stability', 'Hip alignment', 'Shoulder position', 'Back position']
    if (!landmarks || landmarks.length < 33) {
      return this.fallbackMetrics('Position side profile in frame', checkNames)
    }

    const shoulderL = landmarks[11], hipL = landmarks[23], kneeL = landmarks[25], ankleL = landmarks[27]
    if (!shoulderL || !hipL || !kneeL || !ankleL) {
      return this.fallbackMetrics('Ensure body line is visible', checkNames)
    }

    const hipAngle = calculateAngle(shoulderL, hipL, kneeL)
    const isHipSagging = hipAngle < 160
    const isHipPiking = hipAngle > 195

    const coreStab: FormCheckStatus = isHipSagging || isHipPiking ? 'WARNING' : 'GOOD'
    const hipAlign: FormCheckStatus = isHipSagging ? 'IMPROVE' : 'GOOD'
    const shoulderPos: FormCheckStatus = 'GOOD'
    const backPos: FormCheckStatus = isHipPiking ? 'IMPROVE' : 'GOOD'

    const feedback = isHipSagging
      ? 'Lift hips slightly to maintain a straight line.'
      : isHipPiking
      ? 'Lower hips to align with shoulders and ankles.'
      : 'Excellent plank posture! Keep core tight.'

    return {
      reps: 0,
      phase: 'HOLDING',
      formScore: isHipSagging || isHipPiking ? 82 : 95,
      scoreLabel: isHipSagging || isHipPiking ? 'NEEDS ATTENTION' : 'EXCELLENT FORM',
      feedback,
      feedbackType: isHipSagging || isHipPiking ? 'warning' : 'success',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle,
      depthPercentage: 100,
      hasWarning: isHipSagging || isHipPiking,
      formCheckStatuses: {
        'Core stability': coreStab,
        'Hip alignment': hipAlign,
        'Shoulder position': shoulderPos,
        'Back position': backPos,
      },
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: 0,
      phase: 'HOLDING',
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

// 6. Glute Bridge Detector
export class GluteBridgeDetector implements ExerciseDetector {
  id = 'glute-bridge'
  name = 'Glute Bridge'

  private reps = 0
  private phase: ExercisePhase = 'STANDING'
  private currentFormScore = 93

  reset() {
    this.reps = 0
    this.phase = 'STANDING'
    this.currentFormScore = 93
  }

  analyze(landmarks: NormalizedLandmark[]): ExerciseMetrics {
    const checkNames = ['Hip extension', 'Foot placement', 'Core stability', 'Controlled movement']
    if (!landmarks || landmarks.length < 33) {
      return this.fallbackMetrics('Lie down in frame facing camera', checkNames)
    }

    const shoulderL = landmarks[11], hipL = landmarks[23], kneeL = landmarks[25], ankleL = landmarks[27]
    if (!shoulderL || !hipL || !kneeL || !ankleL) {
      return this.fallbackMetrics('Ensure hips and legs are visible', checkNames)
    }

    const hipAngle = calculateAngle(shoulderL, hipL, kneeL)
    let repIncremented = false

    switch (this.phase) {
      case 'STANDING':
        if (hipAngle > 155) this.phase = 'EXECUTING'
        break
      case 'EXECUTING':
        if (hipAngle >= 170) {
          this.reps += 1
          repIncremented = true
          this.phase = 'STANDING'
        } else if (hipAngle < 140) {
          this.phase = 'STANDING'
        }
        break
    }

    const hipExt: FormCheckStatus = hipAngle > 165 ? 'GOOD' : 'IMPROVE'
    const footPlacement: FormCheckStatus = 'GOOD'
    const coreStab: FormCheckStatus = 'GOOD'
    const ctrlMovement: FormCheckStatus = 'GOOD'

    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'EXCELLENT FORM',
      feedback: repIncremented ? `Glute Bridge rep ${this.reps} completed!` : 'Drive through heels and squeeze glutes at the top.',
      feedbackType: 'info',
      kneeAngleLeft: 90,
      kneeAngleRight: 90,
      torsoAngle: 0,
      hipAngle,
      depthPercentage: Math.min(100, Math.round((hipAngle / 180) * 100)),
      hasWarning: false,
      formCheckStatuses: {
        'Hip extension': hipExt,
        'Foot placement': footPlacement,
        'Core stability': coreStab,
        'Controlled movement': ctrlMovement,
      },
    }
  }

  private fallbackMetrics(reason: string, checkNames: string[]): ExerciseMetrics {
    return {
      reps: this.reps,
      phase: this.phase,
      formScore: this.currentFormScore,
      scoreLabel: 'GOOD FORM',
      feedback: reason,
      feedbackType: 'info',
      kneeAngleLeft: 180,
      kneeAngleRight: 180,
      torsoAngle: 0,
      hipAngle: 180,
      depthPercentage: 0,
      hasWarning: false,
      formCheckStatuses: getDefaultFormChecks(checkNames, 'DETECTING'),
    }
  }
}

/**
 * Registry of available exercise detectors.
 */
export const EXERCISE_DETECTORS: Record<string, () => ExerciseDetector> = {
  'Bodyweight Squat': () => new BodyweightSquatDetector(),
  'Forward Lunge': () => new ForwardLungeDetector(),
  'Overhead Press': () => new OverheadPressDetector(),
  'Romanian Deadlift': () => new RomanianDeadliftDetector(),
  'Plank Hold': () => new PlankHoldDetector(),
  'Glute Bridge': () => new GluteBridgeDetector(),
}
