"use client";

import * as React from "react";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Cpu,
  Layers,
  PlayCircle,
  Radar,
  Sparkles,
  Star,
  Triangle,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

type Logo = { name: string; icon: LucideIcon };

const LOGOS: Logo[] = [
  { name: "Northwind", icon: Radar },
  { name: "Lumenly", icon: Sparkles },
  { name: "Vertex Labs", icon: Triangle },
  { name: "Stackwise", icon: Layers },
  { name: "Cloudform", icon: Cloud },
  { name: "Quanta", icon: Cpu },
];

const PEOPLE = ["AK", "JM", "SR", "TL", "PD"];

const STYLES = `
@keyframes hero-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hero-float-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(40px, 30px, 0) scale(1.1); }
}
@keyframes hero-float-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-50px, 20px, 0) scale(1.15); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hero-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.hero-text-effect {
  background-image: linear-gradient(
    100deg,
    oklch(0.62 0.24 265),
    oklch(0.68 0.23 305),
    oklch(0.7 0.22 350),
    oklch(0.72 0.19 45),
    oklch(0.62 0.24 265)
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-gradient-shift 8s ease-in-out infinite;
}
.hero-blob-a { animation: hero-float-a 18s ease-in-out infinite; }
.hero-blob-b { animation: hero-float-b 22s ease-in-out infinite; }
.hero-rise { animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.hero-marquee-track { animation: hero-marquee 32s linear infinite; }
.hero-marquee:hover .hero-marquee-track,
.hero-marquee:focus-within .hero-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .hero-text-effect,
  .hero-blob-a,
  .hero-blob-b,
  .hero-rise,
  .hero-marquee-track { animation: none !important; }
}
`;

function LogoItem({ logo }: { logo: Logo }) {
  const Icon = logo.icon;
  return (
    <span className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="text-base font-semibold tracking-tight whitespace-nowrap">
        {logo.name}
      </span>
    </span>
  );
}

export default function Page() {
  const heroRef = React.useRef<HTMLElement>(null);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    [],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{STYLES}</style>

      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        aria-labelledby="hero-heading"
        className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        style={
          {
            "--mx": "50%",
            "--my": "30%",
          } as React.CSSProperties
        }
      >
        {/* Background effects */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 100%)",
            }}
          />
          {/* Aurora blobs */}
          <div className="hero-blob-a absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-[oklch(0.7_0.2_265)] opacity-30 blur-3xl sm:h-96 sm:w-96 dark:opacity-25" />
          <div className="hero-blob-b absolute top-10 right-[6%] h-72 w-72 rounded-full bg-[oklch(0.75_0.2_330)] opacity-30 blur-3xl sm:h-[28rem] sm:w-[28rem] dark:opacity-20" />
          <div className="hero-blob-a absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-[oklch(0.8_0.15_70)] opacity-25 blur-3xl dark:opacity-15" />
          {/* Pointer spotlight */}
          <div
            className="absolute inset-0 opacity-70 dark:opacity-50"
            style={{
              background:
                "radial-gradient(420px circle at var(--mx) var(--my), oklch(0.7 0.2 285 / 0.18), transparent 70%)",
            }}
          />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="hero-rise" style={{ animationDelay: "0ms" }}>
            <Badge
              variant="outline"
              className="gap-2 bg-background/60 px-3 py-1 text-sm backdrop-blur"
              asChild
            >
              <a href="#changelog">
                <Sparkles aria-hidden="true" className="text-foreground" />
                <span>Introducing Beacon 2.0 — now with live replays</span>
                <ArrowRight aria-hidden="true" />
              </a>
            </Badge>
          </div>

          <h1
            id="hero-heading"
            className="hero-rise mt-6 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Ship product decisions{" "}
            <span className="hero-text-effect">10x faster</span> with
            analytics your whole team understands
          </h1>

          <p
            className="hero-rise mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Beacon turns raw events into clear answers. Track funnels, watch
            session replays and spot drop-offs in minutes, with no SQL, no
            tracking plan spreadsheets and no waiting on the data team.
          </p>

          <div
            className="hero-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="lg" className="h-11 px-7 text-base" asChild>
              <a href="#signup">
                Start free trial
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 bg-background/60 px-7 text-base backdrop-blur"
              asChild
            >
              <a href="#demo">
                <PlayCircle aria-hidden="true" />
                Watch 2-min demo
              </a>
            </Button>
          </div>

          <p
            className="hero-rise mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            <Zap className="size-4" aria-hidden="true" />
            14-day trial · No credit card required · Set up in 5 minutes
          </p>

          {/* Rating */}
          <div
            className="hero-rise mt-12 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
            style={{ animationDelay: "360ms" }}
          >
            <AvatarGroup>
              {PEOPLE.map((initials) => (
                <Avatar key={initials}>
                  <AvatarFallback className="text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label="Rated 4.9 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9/5</span>{" "}
                from 2,300+ product teams
              </p>
            </div>
          </div>

          {/* Logos */}
          <div
            className="hero-rise mt-14 w-full"
            style={{ animationDelay: "420ms" }}
          >
            <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              <Boxes className="size-4" aria-hidden="true" />
              Trusted by teams at fast-growing companies
            </p>

            {/* Static list for small screens' assistive tech and reduced motion */}
            <div
              className="hero-marquee relative mt-6 overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              }}
            >
              <ul
                aria-label="Companies that use Beacon"
                className="hero-marquee-track flex w-max items-center gap-12 pr-12"
              >
                {LOGOS.map((logo) => (
                  <li key={logo.name}>
                    <LogoItem logo={logo} />
                  </li>
                ))}
                {LOGOS.map((logo) => (
                  <li key={`${logo.name}-dup`} aria-hidden="true">
                    <LogoItem logo={logo} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
