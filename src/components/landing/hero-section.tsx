import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StartBuildingButton } from "./start-building-button";
import { Eyebrow } from "./section-heading";
import { HeroVideo } from "./hero-video";
import { getDictionary } from "@/i18n/get-dictionary";

export async function HeroSection() {
  const { hero } = await getDictionary();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex flex-col items-center overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div aria-hidden className="bg-topo absolute inset-0 -z-10 opacity-15 dark:opacity-20" />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Eyebrow className="fade-up mb-6">{hero.eyebrow}</Eyebrow>

        <h1
          id="hero-title"
          className="fade-up font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance [--fade-delay:100ms] sm:text-6xl md:text-7xl"
        >
          {hero.titleBefore} <span className="text-primary">Outpost</span> {hero.titleAfter}
        </h1>

        <p className="fade-up mt-6 max-w-xl text-base text-pretty text-muted-foreground [--fade-delay:200ms] sm:text-lg">
          {hero.description}
        </p>

        <div className="fade-up mt-10 flex w-full flex-col gap-3 [--fade-delay:300ms] sm:w-auto sm:flex-row">
          <StartBuildingButton />
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#how-it-works" />}>
            {hero.howItWorks}
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
