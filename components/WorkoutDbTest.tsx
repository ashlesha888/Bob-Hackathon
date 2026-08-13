"use client";

import { sendWorkoutData } from "@/lib/api";

export function WorkoutDbTest() {
  const handleTest = async () => {
    try {
      const result = await sendWorkoutData({
        userId: "test_user",
        exercise: "Test Squat",
        totalReps: 5,
        correctReps: 4,
        incorrectReps: 1,
        accuracy: 80,
        duration: 30,
        feedback: ["Test workout"],
      });

      console.log("MongoDB test result:", result);

      alert("✅ Workout saved successfully!");
    } catch (error) {
      console.error(error);

      alert("❌ Failed to save workout. Check the browser console.");
    }
  };

  return (
    <button
      onClick={handleTest}
      className="fixed bottom-5 right-5 z-50 rounded-lg bg-black px-5 py-3 text-white"
    >
      Test MongoDB
    </button>
  );
}
