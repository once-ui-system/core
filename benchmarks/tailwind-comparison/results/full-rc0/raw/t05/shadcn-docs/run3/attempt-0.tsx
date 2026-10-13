"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Logo = {
  name: string;
  mark: React.ReactNode;
};

const logos: Logo[] = [
  {
    name: "Northwind Labs",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
        <path
          d="M4 19V5l16 14V5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Helix Robotics",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.5" />
        <path d="M7 12h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Plainview",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="4" />
        <rect x="3" y="13" width="8" height="8" rx="4" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    name: "Corvid Systems",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2 22 12 12 22 2 12z" />
      </svg>
    ),
  },
  {
    name: "Brightside",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Tidewater",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
        <path
          d="M2 9c3-3 5-3 8 0s5 3 8 0M2 16c3-3 5-3 8 0s5 3 8 0"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const heroStyles = `
@keyframes hero-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hero-orb-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(6%, 8%, 0) scale(1.12); }
}
@keyframes hero-orb-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(-8%, 6%, 0) scale(1.1); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translate3d(0, 14px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.hero-text-effect {
  background-image: linear-gradient(
    90deg,
    oklch(0.62 0.22 265),
    oklch(0.66 0.24 305),
    oklch(0.7 0.2 350),
    oklch(0.72 0.17 40),
    oklch(0.62 0.22 265)
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: hero-gradient-shift 8s ease-in-out infinite;
}
.hero-orb-a { animation: hero-orb-a 18s ease-in-out infinite; }
.hero-orb-b { animation: hero-orb-b 22s ease-in-out infinite; }
.hero-rise  { animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.hero-grid {
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%);
}
@media (prefers-reduced-motion: reduce) {
  .hero-text-effect, .hero-orb-a, .hero-orb-b, .hero-rise {
    animation: none !important;
  }
}
`;

export default function Page() {
  const handleDemo = React.useCallback(() => {
    toast("Demo requested", {
      description: "We'll email you a 3-minute product tour shortly.",
    });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <style>{heroStyles}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <div className="hero-grid absolute inset-0 opacity-70" />
        <div
          className="hero-orb-a absolute -top-32 left-[8%] size-[28rem] rounded-full opacity-30 blur-3xl dark:opacity-25"
          style={{ background: "oklch(0.7 0.19 275)" }}
        />
        <div
          className="hero-orb-b absolute top-10 right-[6%] size-[24rem] rounded-full opacity-25 blur-3xl dark:opacity-20"
          style={{ background: "oklch(0.74 0.18 340)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <a
            href="#"
            className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Lumen
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#signin">Sign in</a>
            </Button>
          </nav>
        </header>

        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-24"
        >
          <div className="hero-rise" style={{ animationDelay: "0ms" }}>
            <Badge variant="outline" className="gap-1.5 bg-background/60 px-3 py-1 text-sm backdrop-blur">
              <Sparkles aria-hidden="true" />
              New: AI release notes are here
            </Badge>
          </div>

          <h1
            id="hero-heading"
            className="hero-rise mt-6 max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Ship product updates{" "}
            <span className="hero-text-effect">your customers actually read</span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Lumen turns your commits and tickets into beautiful changelogs, in-app announcements and
            email digests, so every release lands with the people who care about it.
          </p>

          <div
            className="hero-rise mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a href="#start">
                Start for free
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full bg-background/60 backdrop-blur sm:w-auto"
              onClick={handleDemo}
            >
              <PlayCircle aria-hidden="true" />
              Watch the demo
            </Button>
          </div>

          <p
            className="hero-rise mt-4 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            Free for up to 3 projects. No credit card required.
          </p>

          {/* Social proof */}
          <div
            className="hero-rise mt-16 w-full max-w-4xl sm:mt-20"
            style={{ animationDelay: "380ms" }}
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <div className="flex items-center gap-0.5" role="img" aria-label="Rated 4.9 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Rated 4.9/5 by <span className="font-medium text-foreground">2,400+</span> product teams
              </p>
            </div>

            <ul
              aria-label="Companies that use Lumen"
              className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"
            >
              {logos.map((logo) => (
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
        </section>
      </div>
    </main>
  );
}
