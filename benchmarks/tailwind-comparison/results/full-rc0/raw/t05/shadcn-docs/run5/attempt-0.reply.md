```tsx
"use client";

import * as React from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Logo = {
  name: string;
  render: () => React.ReactNode;
};

/* Inline SVG wordmarks: no network requests. Decorative marks are aria-hidden;
   the company name is exposed via the list item's text for screen readers. */
const logos: Logo[] = [
  {
    name: "Northwind",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <path
          d="M4 22V6l10 12V6M14 22l10-16v16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Lumina",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="4" fill="currentColor" />
        <path
          d="M14 2v5M14 21v5M2 14h5M21 14h5M5.5 5.5l3.5 3.5M19 19l3.5 3.5M22.5 5.5L19 9M9 19l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Parallax",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <rect x="11" y="11" width="14" height="14" rx="3" fill="currentColor" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: "Quillbase",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <path
          d="M14 3 25 9v10l-11 6L3 19V9z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M14 11v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Helio",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <path
          d="M3 20c4-12 8-12 11-4s7 8 11-4"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Brightline",
    render: () => (
      <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden="true">
        <path d="M5 24 14 4l9 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 17h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const stats = [
  { icon: Zap, label: "Deploys in under 40 seconds" },
  { icon: ShieldCheck, label: "SOC 2 Type II certified" },
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
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-8%, -6%, 0) scale(0.95); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-text-effect {
  background-image: linear-gradient(
    90deg,
    oklch(0.62 0.22 265),
    oklch(0.68 0.22 320),
    oklch(0.74 0.17 40),
    oklch(0.62 0.22 265)
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: hero-shimmer 6s linear infinite;
}
.dark .hero-text-effect {
  background-image: linear-gradient(
    90deg,
    oklch(0.78 0.15 265),
    oklch(0.8 0.17 320),
    oklch(0.85 0.13 60),
    oklch(0.78 0.15 265)
  );
}
.hero-orb-a { animation: hero-drift-a 18s ease-in-out infinite; }
.hero-orb-b { animation: hero-drift-b 22s ease-in-out infinite; }
.hero-rise { opacity: 0; animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .hero-text-effect, .hero-orb-a, .hero-orb-b { animation: none; }
  .hero-rise { animation: none; opacity: 1; }
}
`;

export default function Page() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="bg-background text-foreground relative isolate min-h-dvh overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60 dark:opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 35%, #000 30%, transparent 75%)",
          }}
        />
        <div className="hero-orb-a absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-[85%] rounded-full bg-[oklch(0.7_0.2_265)] opacity-25 blur-3xl sm:h-[36rem] sm:w-[36rem] dark:opacity-30" />
        <div className="hero-orb-b absolute top-10 left-1/2 h-[24rem] w-[24rem] translate-x-[5%] rounded-full bg-[oklch(0.75_0.2_330)] opacity-25 blur-3xl sm:h-[32rem] sm:w-[32rem] dark:opacity-25" />
        <div className="to-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent" />
      </div>

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-5">
          <a
            href="#top"
            className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px]"
          >
            <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Meridian
          </a>
          <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#pricing">Pricing</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="#signin">Sign in</a>
            </Button>
          </nav>
        </header>

        {/* Hero */}
        <section
          id="top"
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20 lg:py-24"
        >
          <div className={mounted ? "hero-rise" : "opacity-0"} style={{ animationDelay: "0ms" }}>
            <Badge
              variant="outline"
              className="bg-background/60 gap-2 px-3 py-1 text-xs backdrop-blur"
            >
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Meridian 3.0 is live: now with branch previews
            </Badge>
          </div>

          <h1
            id="hero-heading"
            className={`mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl ${
              mounted ? "hero-rise" : "opacity-0"
            }`}
            style={{ animationDelay: "80ms" }}
          >
            Ship product updates{" "}
            <span className="hero-text-effect whitespace-nowrap">10x faster</span>
            <br className="hidden sm:block" /> without the release anxiety
          </h1>

          <p
            className={`text-muted-foreground mt-6 max-w-2xl text-base text-pretty sm:text-lg ${
              mounted ? "hero-rise" : "opacity-0"
            }`}
            style={{ animationDelay: "160ms" }}
          >
            Meridian turns every pull request into a shareable preview, runs your checks
            in parallel, and rolls back automatically when something looks off. Your team
            stays focused on building, not babysitting deploys.
          </p>

          <div
            className={`mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center ${
              mounted ? "hero-rise" : "opacity-0"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg" className="h-11 px-6 text-base shadow-lg shadow-primary/20">
              <a href="#start">
                Start building free
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
              <a href="#demo">
                <Play aria-hidden="true" />
                Watch 2-min demo
              </a>
            </Button>
          </div>

          <ul
            className={`text-muted-foreground mt-6 flex flex-col items-center gap-x-6 gap-y-2 text-sm sm:flex-row ${
              mounted ? "hero-rise" : "opacity-0"
            }`}
            style={{ animationDelay: "300ms" }}
          >
            {stats.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof */}
        <section
          aria-labelledby="proof-heading"
          className={`pb-12 sm:pb-16 ${mounted ? "hero-rise" : "opacity-0"}`}
          style={{ animationDelay: "380ms" }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className="flex items-center gap-0.5 text-amber-500"
              role="img"
              aria-label="Rated 4.9 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden="true" />
              ))}
            </div>
            <h2 id="proof-heading" className="text-muted-foreground text-sm">
              Rated 4.9/5 by 3,200+ engineering teams, including
            </h2>
          </div>

          <ul className="text-muted-foreground mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <li
                key={logo.name}
                className="hover:text-foreground flex items-center justify-center gap-2 text-base font-semibold tracking-tight transition-colors"
              >
                {logo.render()}
                <span>{logo.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
```