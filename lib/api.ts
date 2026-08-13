const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface WorkoutData {
  userId?: string;
  exercise: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  accuracy: number;
  duration?: number;
  feedback?: string[];
  metrics?: Record<string, number>;
  repHistory?: unknown[];
}

export async function sendWorkoutData(workout: WorkoutData) {
  try {
    const response = await fetch(`${API_BASE}/workouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: workout.userId || "default_user",
        exercise: workout.exercise,
        totalReps: workout.totalReps,
        correctReps: workout.correctReps,
        incorrectReps: workout.incorrectReps,
        accuracy: workout.accuracy,
        duration: workout.duration || 0,
        feedback: workout.feedback || [],
        metrics: workout.metrics || {},
        repHistory: workout.repHistory || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save workout");
    }

    console.log("✅ Workout saved:", data);

    return data;
  } catch (error) {
    console.error("❌ Failed to save workout:", error);
    throw error;
  }
}
export async function testWorkoutConnection() {
  return sendWorkoutData({
    userId: "test_user",
    exercise: "Test Squat",
    totalReps: 5,
    correctReps: 4,
    incorrectReps: 1,
    accuracy: 80,
    duration: 30,
    feedback: ["Test workout"],
  });
}
