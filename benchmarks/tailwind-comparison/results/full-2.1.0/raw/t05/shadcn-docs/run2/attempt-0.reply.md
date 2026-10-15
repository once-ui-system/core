I have everything I need. Writing the page now.

```tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

const ROTATING_WORDS = ["ship faster", "stay in sync", "close the loop", "scale calmly"] as const;

const AVATARS = [
  { initials: "AK", tone: "bg-chart-1/25 text-chart-1" },
  { initials: "MR", tone: "bg-chart-2/25 text-chart-2" },
  { initials: "JL", tone: "bg-chart-4/30 text-chart-5" },
  { initials: "SO", tone: "bg-chart-3/25 text-chart-3" },
  { initials: "TP", tone: "bg-chart-5/25 text-chart-5" },
] as const;

type LogoProps = { className?: string };

function LogoNorthwind({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 150 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 26V6l9 20V6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
      <text x="24" y="23" fontSize="17" fontWeight="700" letterSpacing="-0.4" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Northwind
      </text>
    </svg>
  );
}

function LogoLumen({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="14" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="14" cy="16" r="3.5" />
      <text x="31" y="23" fontSize="18" fontWeight="600" letterSpacing="-0.3" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Lumen
      </text>
    </svg>
  );
}

function LogoParcel({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 130 32" className={className} fill="currentColor" aria-hidden="true">
      <rect x="4" y="7" width="18" height="18" rx="4" />
      <path d="M8.5 16h9M13 11.5v9" stroke="var(--background)" strokeWidth="2.4" strokeLinecap="round" />
      <text x="30" y="23" fontSize="18" fontWeight="700" letterSpacing="-0.3" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Parcel
      </text>
    </svg>
  );
}

function LogoHalcyon({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 140 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 25 14 6l10 19z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <text x="31" y="23" fontSize="18" fontWeight="500" letterSpacing="0.2" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Halcyon
      </text>
    </svg>
  );
}

function LogoOrbital({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 140 32" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="14" cy="16" rx="11" ry="6" fill="none" stroke="currentColor" strokeWidth="2.6" transform="rotate(-25 14 16)" />
      <circle cx="14" cy="16" r="3.2" />
      <text x="31" y="23" fontSize="18" fontWeight="700" letterSpacing="-0.4" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Orbital
      </text>
    </svg>
  );
}

function LogoKestrel({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 140 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 9h7l6 14 6-14h7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <text x="38" y="23" fontSize="18" fontWeight="600" letterSpacing="-0.3" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Kestrel
      </text>
    </svg>
  );
}

const LOGOS = [
  { name: "Northwind", Logo: LogoNorthwind },
  { name: "Lumen", Logo: LogoLumen },
  { name: "Parcel", Logo: LogoParcel },
  { name: "Halcyon", Logo: LogoHalcyon },
  { name: "Orbital", Logo: LogoOrbital },
  { name: "Kestrel", Logo: LogoKestrel },
] as const;

function useRotatingIndex(length: number, intervalMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [length, intervalMs]);

  return index;
}

function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Grid with radial mask */}
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
        }}
      />

      {/* Drifting blurred orbs */}
      <div className="hero-orb-a absolute -top-32 left-1/2 size-[34rem] -translate-x-[85%] rounded-full bg-chart-1/25 blur-3xl dark:bg-chart-1/20" />
      <div className="hero-orb-b absolute -top-24 left-1/2 size-[30rem] -translate-x-[10%] rounded-full bg-chart-2/25 blur-3xl dark:bg-chart-2/15" />
      <div className="hero-orb-c absolute top-40 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-chart-4/20 blur-3xl dark:bg-chart-4/15" />

      {/* Bottom fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export default function Page() {
  const wordIndex = useRotatingIndex(ROTATING_WORDS.length, 2800);

  return (
    <main className="relative isolate flex min-h-screen flex-col bg-background text-foreground">
      <style>{`
        @keyframes hero-sheen {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes hero-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, 30px, 0) scale(1.08); }
        }
        @keyframes hero-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-50px, 20px, 0) scale(1.1); }
        }
        @keyframes hero-drift-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, -30px, 0) scale(0.94); }
        }
        @keyframes hero-word-in {
          0% { opacity: 0; transform: translateY(0.35em); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-sheen-text {
          background-image: linear-gradient(
            90deg,
            var(--foreground) 0%,
            var(--chart-1) 25%,
            var(--chart-2) 50%,
            var(--chart-4) 75%,
            var(--foreground) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: hero-sheen 8s linear infinite;
        }
        .hero-orb-a { animation: hero-drift-a 18s ease-in-out infinite; }
        .hero-orb-b { animation: hero-drift-b 22s ease-in-out infinite; }
        .hero-orb-c { animation: hero-drift-c 26s ease-in-out infinite; }
        .hero-word { animation: hero-word-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .hero-marquee-track { animation: hero-marquee 40s linear infinite; }
        .hero-marquee:hover .hero-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hero-sheen-text,
          .hero-orb-a,
          .hero-orb-b,
          .hero-orb-c,
          .hero-word,
          .hero-marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      <section
        aria-labelledby="hero-heading"
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 lg:px-8 lg:pt-32"
      >
        <HeroBackground />

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Badge
            variant="outline"
            className="h-7 gap-1.5 bg-background/70 px-3 text-xs backdrop-blur"
          >
            <Sparkles aria-hidden="true" className="text-chart-1" />
            <span>Meet Relay 2.0 — now with AI triage</span>
          </Badge>
        </div>

        <h1
          id="hero-heading"
          className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 sm:text-6xl lg:text-7xl"
        >
          <span className="block">The project hub where</span>
          <span className="block">
            teams <span className="hero-sheen-text">{ROTATING_WORDS[wordIndex]}</span>
          </span>
        </h1>

        {/* Screen readers get a stable, complete sentence; the rotating word is visual only */}
        <p className="sr-only">
          The project hub where teams ship faster, stay in sync, close the loop and scale calmly.
        </p>

        <p className="mt-6 max-w-2xl text-base text-pretty text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 sm:text-lg">
          Relay brings roadmaps, tickets and release notes into one calm workspace, so your
          team spends less time chasing updates and more time shipping work customers notice.
        </p>

        <div className="mt-9 flex w-full flex-col items-stretch gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 sm:w-auto sm:flex-row sm:items-center">
          <Button size="lg" className="h-11 px-6 text-base shadow-lg shadow-primary/20" asChild>
            <a href="#get-started">
              Start free trial
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 bg-background/70 px-6 text-base backdrop-blur"
            asChild
          >
            <a href="#demo">
              <PlayCircle aria-hidden="true" data-icon="inline-start" />
              Watch 2-min demo
            </a>
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
          14-day free trial · No credit card required · Cancel anytime
        </p>

        {/* Social proof */}
        <div className="mt-14 flex w-full flex-col items-center gap-10 animate-in fade-in duration-1000 delay-500 sm:mt-20">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            <AvatarGroup aria-hidden="true">
              {AVATARS.map(({ initials, tone }) => (
                <Avatar key={initials} size="lg">
                  <AvatarFallback className={`${tone} text-xs font-semibold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>

            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-1">
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-chart-4 text-chart-4"
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm font-semibold">4.9</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="sr-only">Rated 4.9 out of 5 stars by </span>
                Loved by <strong className="font-semibold text-foreground">12,000+</strong> product
                teams
              </p>
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Trusted by teams at
            </h2>

            {/* Static grid for small / reduced-motion-agnostic readers */}
            <ul
              className="mx-auto mt-6 grid max-w-3xl grid-cols-2 items-center justify-items-center gap-x-8 gap-y-6 text-muted-foreground sm:grid-cols-3 lg:hidden"
              aria-label="Customer logos"
            >
              {LOGOS.map(({ name, Logo }) => (
                <li key={name} className="flex items-center">
                  <Logo className="h-6 w-auto opacity-70 transition-opacity hover:opacity-100" />
                  <span className="sr-only">{name}</span>
                </li>
              ))}
            </ul>

            {/* Marquee on large screens */}
            <div
              className="hero-marquee mt-6 hidden overflow-hidden text-muted-foreground lg:block"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
              }}
            >
              <div className="hero-marquee-track flex w-max items-center gap-16 pr-16">
                {[...LOGOS, ...LOGOS].map(({ name, Logo }, i) => (
                  <Logo
                    key={`${name}-${i}`}
                    className="h-7 w-auto shrink-0 opacity-70 transition-opacity hover:opacity-100"
                  />
                ))}
              </div>
              <span className="sr-only">
                Customers include {LOGOS.map((l) => l.name).join(", ")}.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```