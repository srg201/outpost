import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StartBuildingButton } from "./start-building-button";
import { Eyebrow } from "./section-heading";
import { HeroVideo } from "./hero-video";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex flex-col items-center overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div aria-hidden className="bg-topo absolute inset-0 -z-10 opacity-15 dark:opacity-20" />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Eyebrow className="fade-up mb-6">Early Access</Eyebrow>

        <h1
          id="hero-title"
          className="fade-up font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance [--fade-delay:100ms] sm:text-6xl md:text-7xl"
        >
          An <span className="text-primary">Outpost</span> for wherever you&apos;re building
        </h1>

        <p className="fade-up mt-6 max-w-xl text-base text-pretty text-muted-foreground [--fade-delay:200ms] sm:text-lg">
          Plan in docs, sketch on the canvas, and let an AI agent turn your ideas into diagrams, all in one
          workspace for you and your team.
        </p>

        <div className="fade-up mt-10 flex w-full flex-col gap-3 [--fade-delay:300ms] sm:w-auto sm:flex-row">
          <StartBuildingButton />
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#how-it-works" />}>
            See How It Works
          </Button>
        </div>
      </div>

      {/* Outer wrapper fades in; inner one owns the scroll tilt (two separate animations). */}
      <div className="fade-up mx-auto mt-16 w-full max-w-5xl [--fade-delay:450ms] [--fade-distance:40px] sm:mt-20">
        <div className="scroll-tilt survey-frame w-full">
          <HeroVideo />
        </div>
      </div>
    </section>
  );
}
