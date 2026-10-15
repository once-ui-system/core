Now I'll write the page.

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Cpu,
  Hexagon,
  Layers,
  Orbit,
  PlayCircle,
  Sparkles,
  Star,
  Triangle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const ROTATING_WORDS = ["ship faster", "stay in sync", "cut busywork", "launch with confidence"] as const;

const LOGOS: { name: string; icon: IconType }[] = [
  { name: "Northwind", icon: Orbit },
  { name: "Lumina", icon: Sparkles },
  { name: "Vertex Labs", icon: Triangle },
  { name: "Cloudline", icon: Cloud },
  { name: "Hexagon", icon: Hexagon },
  { name: "Stackwise", icon: Layers },
  { name: "Boxcar", icon: Boxes },
  { name: "Quanta", icon: Cpu },
];

const REVIEWERS = [
  { initials: "AM", label: "Amara Mensah" },
  { initials: "JK", label: "Jonas Keller" },
  { initials: "PR", label: "Priya Raman" },
  { initials: "LT", label: "Lucas Tavares" },
  { initials: "SO", label: "Sofia Ortega" },
];

function LogoItem({ name, icon: Icon }: { name: string; icon: IconType }) {
  return (
    <li className="flex shrink-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
      <Icon className="size-5" aria-hidden="true" />
      <span className="text-base font-semibold tracking-tight whitespace-nowrap">{name}</span>
    </li>
  );
}

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      key={index}
      aria-hidden="true"
      className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-500 bg-gradient-to-r from-chart-1 via-chart-4 to-chart-2 bg-clip-text pb-1 text-transparent dark:from-chart-1 dark:via-chart-5 dark:to-chart-2"
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Grid pattern, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Drifting color blobs */}
      <div className="absolute -top-24 left-1/2 size-[34rem] -translate-x-[85%] rounded-full bg-chart-1/25 blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite] dark:bg-chart-1/20" />
      <div className="absolute top-8 left-1/2 size-[30rem] -translate-x-[10%] rounded-full bg-chart-2/25 blur-3xl motion-safe:animate-[pulse_11s_ease-in-out_infinite] dark:bg-chart-2/20" />
      <div className="absolute top-56 left-1/2 size-[24rem] -translate-x-1/2 rounded-full bg-chart-4/20 blur-3xl motion-safe:animate-[pulse_13s_ease-in-out_infinite] dark:bg-chart-4/15" />
      {/* Bottom fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        aria-labelledby="hero-heading"
        className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden"
      >
        <HeroBackground />

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 lg:pt-32">
          <Badge
            variant="outline"
            asChild
            className="h-7 gap-1.5 bg-background/70 px-3 text-xs backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-700"
          >
            <a href="#changelog">
              <Zap className="size-3.5 text-chart-4" aria-hidden="true" />
              <span>New: Automations 2.0 is live</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </a>
          </Badge>

          <h1
            id="hero-heading"
            className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700"
          >
            <span className="sr-only">Plan work your team loves, so you can ship faster.</span>
            <span aria-hidden="true">
              Plan work your team loves, so you can{" "}
              <span className="block sm:inline">
                <RotatingWord />
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000">
            Meridian brings roadmaps, sprints and release notes into one calm workspace. Teams of 5 to 500 use it to
            cut status meetings in half and keep every launch on schedule.
          </p>

          <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-1000">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <a href="#signup">
                Start free trial
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
              <a href="#demo">
                <PlayCircle data-icon="inline-start" aria-hidden="true" />
                Watch 2-min demo
              </a>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <AvatarGroup>
              {REVIEWERS.map((person) => (
                <Avatar key={person.initials} size="default" title={person.label}>
                  <AvatarFallback className="text-xs font-medium">{person.initials}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-0.5" role="img" aria-label="Rated 4.9 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-chart-4 text-chart-4" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9/5</span> from 2,300+ team reviews
              </p>
            </div>
          </div>
        </div>

        <div className="w-full border-t bg-background/60 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm font-medium text-muted-foreground">
              Trusted by product teams at fast-growing companies
            </p>

            <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max motion-safe:animate-[marquee_38s_linear_infinite] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
                <ul className="flex shrink-0 items-center gap-12 pr-12 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-10 motion-reduce:gap-y-4 motion-reduce:pr-0" aria-label="Customer logos">
                  {LOGOS.map((logo) => (
                    <LogoItem key={logo.name} {...logo} />
                  ))}
                </ul>
                <ul
                  aria-hidden="true"
                  className="flex shrink-0 items-center gap-12 pr-12 motion-reduce:hidden"
                >
                  {LOGOS.map((logo) => (
                    <LogoItem key={logo.name} {...logo} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee keyframes defined via Tailwind arbitrary animation name below */}
      <MarqueeKeyframes />
    </main>
  );
}

/**
 * Tailwind v4 arbitrary `animate-[marquee_...]` needs a matching @keyframes rule.
 * Global CSS can't be edited, so the keyframes are injected here.
 */
function MarqueeKeyframes() {
  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`,
      }}
    />
  );
}
```