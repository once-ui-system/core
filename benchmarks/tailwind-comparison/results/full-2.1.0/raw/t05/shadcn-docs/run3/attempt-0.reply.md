I have what I need. Since I can't add keyframes to the global CSS, I'll use an inline `<style>` tag for the text-effect and background animations, with `prefers-reduced-motion` support. Social proof logos will be inline SVG wordmarks, so nothing loads from the network.

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Play, Sparkles, Star, Check } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Logo = { name: string; mark: ReactNode };

const LOGOS: Logo[] = [
  {
    name: "Northwind",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V6l8 8V4M12 14l8 6V4" />
      </svg>
    ),
  },
  {
    name: "Lumen Labs",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    ),
  },
  {
    name: "Parcel",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  {
    name: "Helix",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12" />
      </svg>
    ),
  },
  {
    name: "Orbit",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)" />
      </svg>
    ),
  },
  {
    name: "Basalt",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="currentColor">
        <path d="M3 20L9 6l4 8 3-5 5 11H3z" />
      </svg>
    ),
  },
];

const HIGHLIGHTS = ["Free 14-day trial", "No credit card required", "SOC 2 Type II"];

const STYLES = `
@keyframes hero-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes hero-float {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(2%, 4%, 0) scale(1.08); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-gradient-text {
  background-image: linear-gradient(
    90deg,
    oklch(0.55 0.22 265),
    oklch(0.65 0.24 320),
    oklch(0.7 0.19 40),
    oklch(0.55 0.22 265)
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-shimmer 6s linear infinite;
}
.dark .hero-gradient-text {
  background-image: linear-gradient(
    90deg,
    oklch(0.75 0.17 265),
    oklch(0.8 0.18 320),
    oklch(0.85 0.15 60),
    oklch(0.75 0.17 265)
  );
}
.hero-blob { animation: hero-float 14s ease-in-out infinite; }
.hero-blob-2 { animation-duration: 18s; animation-delay: -6s; }
.hero-rise { opacity: 0; animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.hero-grid {
  background-image:
    linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%);
}
@media (prefers-reduced-motion: reduce) {
  .hero-gradient-text, .hero-blob { animation: none; }
  .hero-rise { animation: none; opacity: 1; }
}
`;

export default function Page() {
  const [watching, setWatching] = useState(false);

  function handleDemo() {
    setWatching(true);
    toast("Demo coming up", {
      description: "We'll open the 2-minute product tour in a new view.",
    });
    window.setTimeout(() => setWatching(false), 1200);
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <style>{STYLES}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-blob absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-[85%] rounded-full bg-[oklch(0.65_0.2_265)] opacity-25 blur-3xl dark:opacity-30 sm:h-[36rem] sm:w-[36rem]" />
        <div className="hero-blob hero-blob-2 absolute -top-16 left-1/2 h-[24rem] w-[24rem] -translate-x-[10%] rounded-full bg-[oklch(0.72_0.2_330)] opacity-25 blur-3xl dark:opacity-25 sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <section
        aria-labelledby="hero-heading"
        className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28 lg:pt-36"
      >
        <div className="hero-rise" style={{ animationDelay: "0ms" }}>
          <Badge variant="outline" className="gap-1.5 bg-background/60 px-3 py-1 text-xs backdrop-blur">
            <Sparkles aria-hidden="true" className="text-[oklch(0.65_0.24_320)]" />
            New: Autopilot reports are live
          </Badge>
        </div>

        <h1
          id="hero-heading"
          className="hero-rise mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Ship product decisions{" "}
          <span className="hero-gradient-text">ten times faster</span>
        </h1>

        <p
          className="hero-rise mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Meridian pulls usage data, support threads, and sales calls into one
          workspace, then tells your team what to build next and why. Less
          dashboard digging, more shipping.
        </p>

        <div
          className="hero-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          style={{ animationDelay: "240ms" }}
        >
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <a href="#get-started">
              Start free trial
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 px-6 text-base"
            onClick={handleDemo}
            aria-busy={watching}
          >
            <Play aria-hidden="true" />
            Watch 2-min demo
          </Button>
        </div>

        <ul
          className="hero-rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          style={{ animationDelay: "300ms" }}
        >
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check aria-hidden="true" className="size-4 text-foreground" />
              {item}
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <div
          className="hero-rise mt-16 w-full sm:mt-20"
          style={{ animationDelay: "380ms" }}
        >
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <div className="flex items-center gap-0.5" role="img" aria-label="Rated 4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className="size-4 fill-[oklch(0.8_0.17_80)] text-[oklch(0.8_0.17_80)]"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Rated <span className="font-medium text-foreground">4.9/5</span> by
              product teams at 2,400+ companies
            </p>
          </div>

          <ul
            aria-label="Companies that use Meridian"
            className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
          >
            {LOGOS.map((logo) => (
              <li
                key={logo.name}
                className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo.mark}
                <span className="text-base font-semibold tracking-tight">{logo.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="get-started" className="sr-only" tabIndex={-1}>
          Get started with your free trial
        </div>
      </section>
    </main>
  );
}
```