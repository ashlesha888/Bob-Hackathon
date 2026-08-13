'use client'

import { useEffect, useState } from 'react'
import { SectionHeader } from '@/components/align/section-header'
import { ExerciseCard } from '@/components/align/exercise-card'
import { ExerciseCoaching } from '@/components/align/exercise-coaching'
import { EXERCISES_LIST } from '@/lib/exercise-data'
import { useAuth } from '@/lib/auth-context'

export function Exercises() {
  const { selectedExercise, setSelectedExercise } = useAuth()
  const [coachingExercise, setCoachingExercise] = useState<string | null>(null)

  // Sync with global selectedExercise context state
  useEffect(() => {
    if (selectedExercise) {
      setCoachingExercise(selectedExercise)
    }
  }, [selectedExercise])

  const handleSelectExercise = (name: string) => {
    setSelectedExercise(name)
    setCoachingExercise(name)
    const section = document.getElementById('exercises')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCloseCoaching = () => {
    setCoachingExercise(null)
    setSelectedExercise(null)
    const section = document.getElementById('exercises')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="exercises" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 scroll-mt-16">
      <SectionHeader
        eyebrow="Exercises"
        title="Pick a movement. Start coaching."
        description="ALIGN.AI analyzes each exercise against its own reference model — so feedback stays specific to what you're actually doing."
      />

      <div className="mt-12">
        {coachingExercise ? (
          <ExerciseCoaching exerciseName={coachingExercise} onClose={handleCloseCoaching} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXERCISES_LIST.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isSelected={selectedExercise === exercise.name}
                onSelect={handleSelectExercise}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
