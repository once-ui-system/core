I'll use the avatar group with initials fallbacks (no images) for a small social-proof strip alongside the logos.

```tsx
"use client";

import * as React from "react";
import {
  ArrowRight,
  Boxes,
  Check,
  Command,
  Layers,
  Orbit,
  Play,
  Sparkles,
  Star,
  Triangle,
  Waves,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Brand = {
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  weight: string;
};

const BRANDS: Brand[] = [
  { name: "Northwind", Icon: Orbit, weight: "font-semibold tracking-tight" },
  { name: "Lumen", Icon: Zap, weight: "font-bold tracking-wide" },
  { name: "Vertex", Icon: Triangle, weight: "font-semibold" },
  { name: "Stackline", Icon: Layers, weight: "font-medium tracking-tight" },
  { name: "Cascade", Icon: Waves, weight: "font-semibold tracking-tight" },
  { name: "Monolith", Icon: Boxes, weight: "font-bold tracking-tight" },
];

const AVATARS = ["AR", "JK", "MS", "LP", "TD"];

const HIGHLIGHTS = [
  "Free 14-day trial",
  "No credit card required",
  "SOC 2 Type II certified",
];

const heroStyles = `
@keyframes hero-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes hero-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(6%, 8%, 0) scale(1.12); }
}
@keyframes hero-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-8%, -6%, 0) scale(1.1); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translate3d(0, 14px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
.hero-shimmer-text {
  background-image: linear-gradient(
    100deg,
    oklch(0.55 0.22 275) 0%,
    oklch(0.62 0.24 320) 25%,
    oklch(0.68 0.19 30) 50%,
    oklch(0.62 0.24 320) 75%,
    oklch(0.55 0.22 275) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-shimmer 6s linear infinite;
}
.dark .hero-shimmer-text {
  background-image: linear-gradient(
    100deg,
    oklch(0.78 0.14 275) 0%,
    oklch(0.82 0.15 320) 25%,
    oklch(0.86 0.13 60) 50%,
    oklch(0.82 0.15 320) 75%,
    oklch(0.78 0.14 275) 100%
  );
  background-size: 200% 100%;
}
.hero-orb-a { animation: hero-drift-a 18s ease-in-out infinite; }
.hero-orb-b { animation: hero-drift-b 22s ease-in-out infinite; }
.hero-rise { animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .hero-shimmer-text,
  .hero-orb-a,
  .hero-orb-b,
  .hero-rise { animation: none !important; }
}
`;

function BackgroundEffect() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 100%)",
        }}
      />
      {/* Gradient orbs */}
      <div className="hero-orb-a absolute -top-32 left-[8%] size-[28rem] rounded-full bg-[oklch(0.75_0.15_275/0.35)] blur-3xl dark:bg-[oklch(0.5_0.2_275/0.35)] sm:size-[36rem]" />
      <div className="hero-orb-b absolute -top-24 right-[4%] size-[24rem] rounded-full bg-[oklch(0.8_0.14_330/0.3)] blur-3xl dark:bg-[oklch(0.5_0.22_330/0.3)] sm:size-[32rem]" />
      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

export default function Page() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />
      <BackgroundEffect />

      <section
        aria-labelledby="hero-heading"
        className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 lg:px-8 lg:pt-36"
      >
        <a
          href="#changelog"
          className="hero-rise group rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Badge
            variant="outline"
            className="gap-2 bg-background/70 px-3 py-1 text-xs backdrop-blur"
          >
            <Sparkles aria-hidden="true" className="text-primary" />
            <span>Introducing Beacon AI Insights</span>
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Badge>
        </a>

        <h1
          id="hero-heading"
          className="hero-rise mt-6 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-balance [animation-delay:80ms] sm:text-6xl lg:text-7xl"
        >
          Ship product decisions{" "}
          <span className="hero-shimmer-text">10x faster</span> with the
          analytics your whole team understands
        </h1>

        <p className="hero-rise mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground [animation-delay:160ms] sm:text-lg">
          Beacon connects your product, billing and support data into one live
          workspace. Ask questions in plain English, spot churn risks before
          they land, and share answers in seconds instead of sprints.
        </p>

        <div className="hero-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <a href="#signup">
              Start free trial
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
          >
            <a href="#demo">
              <Play aria-hidden="true" />
              Watch 2-min demo
            </a>
          </Button>
        </div>

        <ul
          aria-label="Trial highlights"
          className="hero-rise mt-6 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-muted-foreground [animation-delay:320ms] sm:flex-row"
        >
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check aria-hidden="true" className="size-4 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <div className="hero-rise mt-16 w-full [animation-delay:400ms] sm:mt-20">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <AvatarGroup aria-hidden="true">
              {AVATARS.map((initials) => (
                <Avatar key={initials}>
                  <AvatarFallback className="text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div
                role="img"
                aria-label="Rated 4.9 out of 5 stars"
                className="flex items-center gap-0.5"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="ml-2 text-sm font-medium">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by 3,200+ product teams worldwide
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p
              id="logos-heading"
              className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
            >
              Powering teams at fast-growing companies
            </p>
            <ul
              aria-labelledby="logos-heading"
              className="mx-auto mt-6 grid max-w-4xl grid-cols-2 items-center gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"
            >
              {BRANDS.map(({ name, Icon, weight }) => (
                <li
                  key={name}
                  className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  <span className={`text-lg ${weight}`}>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Anchor targets so the in-page links resolve */}
      <div className="sr-only">
        <span id="changelog" />
        <span id="signup" />
        <span id="demo" />
      </div>
      <Command className="sr-only" aria-hidden="true" />
    </main>
  );
}
```