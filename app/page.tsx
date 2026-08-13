import { WorkoutDbTest } from "@/components/WorkoutDbTest";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { ExplainableAi } from "@/components/sections/explainable-ai";
import { MovementFingerprint } from "@/components/sections/movement-fingerprint";
import { ProgressShowcase } from "@/components/sections/progress-showcase";
import { Exercises } from "@/components/sections/exercises";
import { Safety } from "@/components/sections/safety";
import { FinalCta } from "@/components/sections/final-cta";
export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <ExplainableAi />
        <MovementFingerprint />
        <ProgressShowcase />
        <Exercises />
        <Safety />
        <FinalCta />
      </main>

      <Footer />

      <WorkoutDbTest />
    </div>
  );
}
