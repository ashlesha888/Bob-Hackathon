export interface ExerciseConfig {
  id: string
  name: string
  level: 'Foundational' | 'Intermediate' | 'Advanced'
  focus: string
  isHold?: boolean
  instructions: string[]
  formChecks: string[]
}

export const EXERCISES_DATA: Record<string, ExerciseConfig> = {
  'Bodyweight Squat': {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    level: 'Foundational',
    focus: 'Knees • Hips • Depth',
    instructions: [
      'Stand with feet approximately shoulder-width apart.',
      'Keep your chest lifted.',
      'Bend your knees and push your hips back.',
      'Lower yourself with control.',
      'Return to the starting position.',
    ],
    formChecks: [
      'Knee alignment',
      'Hip depth',
      'Back position',
      'Foot stability',
    ],
  },
  'Forward Lunge': {
    id: 'forward-lunge',
    name: 'Forward Lunge',
    level: 'Intermediate',
    focus: 'Balance • Alignment',
    instructions: [
      'Stand tall with your feet hip-width apart.',
      'Step forward with one leg, lowering your hips until both knees are bent at 90 degrees.',
      'Keep your front knee directly above your ankle.',
      'Push off your front foot to return to the starting position.',
      'Repeat on the alternate leg.',
    ],
    formChecks: [
      'Front knee alignment',
      'Balance',
      'Torso position',
      'Step distance',
    ],
  },
  'Overhead Press': {
    id: 'overhead-press',
    name: 'Overhead Press',
    level: 'Intermediate',
    focus: 'Shoulders • Spine',
    instructions: [
      'Stand with feet shoulder-width apart, holding hands/weights at shoulder height.',
      'Engage your core and keep your chest up.',
      'Press straight up overhead until arms are fully extended.',
      'Pause briefly at the top of the movement.',
      'Lower back down to shoulder level with control.',
    ],
    formChecks: [
      'Shoulder position',
      'Spine alignment',
      'Elbow position',
      'Controlled movement',
    ],
  },
  'Romanian Deadlift': {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    level: 'Advanced',
    focus: 'Hinge • Back angle',
    instructions: [
      'Stand upright with feet hip-width apart and a soft bend in your knees.',
      'Hinge at your hips, pushing them back while keeping your spine neutral.',
      'Lower your torso until you feel a stretch in your hamstrings.',
      'Keep the movement close to your legs.',
      'Drive your hips forward to return to standing.',
    ],
    formChecks: [
      'Hip hinge',
      'Back angle',
      'Knee position',
      'Weight control',
    ],
  },
  'Plank Hold': {
    id: 'plank-hold',
    name: 'Plank Hold',
    level: 'Foundational',
    focus: 'Core • Stability',
    isHold: true,
    instructions: [
      'Place forearms or hands on the floor, shoulders directly above wrists/elbows.',
      'Extend your legs back, resting on the balls of your feet.',
      'Form a straight line from your head to your heels.',
      'Engage your core, glutes, and quads to prevent sagging.',
      'Hold the position steadily while breathing continuously.',
    ],
    formChecks: [
      'Core stability',
      'Hip alignment',
      'Shoulder position',
      'Back position',
    ],
  },
  'Glute Bridge': {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    level: 'Foundational',
    focus: 'Hips • Activation',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Arms rest flat at your sides.',
      'Squeeze your glutes and push through your heels to lift your hips.',
      'Form a straight line from knees to shoulders at the top.',
      'Lower your hips back to the floor with control.',
    ],
    formChecks: [
      'Hip extension',
      'Foot placement',
      'Core stability',
      'Controlled movement',
    ],
  },
}

export const EXERCISES_LIST = Object.values(EXERCISES_DATA)
