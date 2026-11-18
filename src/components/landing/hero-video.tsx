"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

/**
 * Looping product demo. Autoplays muted, except for users who prefer reduced
 * motion (they see the poster and can press play). Always has a visible
 * pause/play control, as required for auto-playing motion (WCAG 2.2.2).
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Autoplay can be refused by the browser; the button stays usable either way.
    video.play().catch(() => {});
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className="group/video relative overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-2xl shadow-black/20">
      <AspectRatio ratio={16 / 9}>
        <video
          ref={videoRef}
          className="size-full object-cover"
          poster="/videos/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Outpost product demo: an AI agent drawing an architecture diagram on the canvas"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </AspectRatio>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        onClick={toggle}
        aria-label={playing ? "Pause demo video" : "Play demo video"}
        className="absolute right-3 bottom-3 border border-white/15 bg-black/50 text-white opacity-70 backdrop-blur-sm hover:bg-black/70 hover:opacity-100 focus-visible:opacity-100 group-hover/video:opacity-100"
      >
        <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} aria-hidden />
      </Button>
    </div>
  );
}
