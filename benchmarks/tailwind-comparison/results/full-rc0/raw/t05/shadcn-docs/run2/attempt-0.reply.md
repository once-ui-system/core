The page has no state or event handlers, so it can stay a server component.

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  PlayCircle,
  Sparkles,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";

/* ------------------------------------------------------------------ */
/* Inline content                                                      */
/* ------------------------------------------------------------------ */

const HIGHLIGHTS = [
  "14-day free trial",
  "No credit card required",
  "SOC 2 Type II",
];

const REVIEWERS = ["AM", "JK", "SR", "TL", "NP"];

type Brand = { name: string; mark: ReactNode };

const iconProps = {
  viewBox: "0 0 24 24",
  className: "size-6 shrink-0",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

const BRANDS: Brand[] = [
  {
    name: "Northwind",
    mark: (
      <svg {...iconProps}>
        <path d="M12 2 2 20h6l4-8 4 8h6L12 2Z" />
      </svg>
    ),
  },
  {
    name: "Lumina",
    mark: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="5" />
        <path
          d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Basalt",
    mark: (
      <svg {...iconProps}>
        <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Zm0 5-4.5 2.5v5L12 17l4.5-2.5v-5L12 7Z" fillRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Quanta",
    mark: (
      <svg {...iconProps}>
        <rect x="2" y="2" width="9" height="9" rx="2" />
        <rect x="13" y="2" width="9" height="9" rx="4.5" />
        <rect x="2" y="13" width="9" height="9" rx="4.5" />
        <rect x="13" y="13" width="9" height="9" rx="2" />
      </svg>
    ),
  },
  {
    name: "Helix Labs",
    mark: (
      <svg {...iconProps}>
        <path
          d="M6 3c0 6 12 6 12 12s-12 6-12 6M18 3c0 6-12 6-12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Overland",
    mark: (
      <svg {...iconProps}>
        <path d="M2 18 9 6l4 7 3-5 6 10H2Z" />
      </svg>
    ),
  },
  {
    name: "Pinecrest",
    mark: (
      <svg {...iconProps}>
        <path d="M12 2 6 10h3l-4 6h5v6h4v-6h5l-4-6h3L12 2Z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Page-scoped CSS (keyframes + effects)                               */
/* ------------------------------------------------------------------ */

const css = `
@keyframes hero-shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes hero-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(6%, 8%, 0) scale(1.12); }
}
@keyframes hero-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(-8%, 5%, 0) scale(1.08); }
}
@keyframes hero-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-gradient-text {
  background-image: linear-gradient(
    100deg,
    oklch(0.62 0.22 265),
    oklch(0.68 0.21 310),
    oklch(0.7 0.19 20),
    oklch(0.75 0.16 70),
    oklch(0.62 0.22 265)
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-shimmer 8s linear infinite;
}
.dark .hero-gradient-text {
  background-image: linear-gradient(
    100deg,
    oklch(0.78 0.15 265),
    oklch(0.8 0.16 310),
    oklch(0.82 0.14 20),
    oklch(0.88 0.13 80),
    oklch(0.78 0.15 265)
  );
}
.hero-blob-a { animation: hero-drift-a 18s ease-in-out infinite; }
.hero-blob-b { animation: hero-drift-b 22s ease-in-out infinite; }
.hero-marquee-track { animation: hero-marquee 40s linear infinite; }
.hero-marquee:hover .hero-marquee-track,
.hero-marquee:focus-within .hero-marquee-track { animation-play-state: paused; }
.hero-rise { opacity: 0; animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.hero-grid-mask {
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
}
.hero-marquee-mask {
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .hero-gradient-text,
  .hero-blob-a,
  .hero-blob-b,
  .hero-marquee-track { animation: none; }
  .hero-rise { animation: none; opacity: 1; }
}
`;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <style>{css}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <div className="hero-blob-a absolute -top-40 left-1/2 size-[36rem] -translate-x-[85%] rounded-full bg-[oklch(0.7_0.2_265/0.28)] blur-3xl dark:bg-[oklch(0.55_0.22_265/0.35)]" />
        <div className="hero-blob-b absolute -top-24 left-1/2 size-[32rem] -translate-x-[10%] rounded-full bg-[oklch(0.75_0.18_330/0.24)] blur-3xl dark:bg-[oklch(0.55_0.22_320/0.3)]" />
        <div
          className="hero-grid-mask absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between py-5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Relay
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="#pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="#signin">Sign in</Link>
            </Button>
          </nav>
        </header>

        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20 lg:py-24"
        >
          <div className="hero-rise" style={{ animationDelay: "0ms" }}>
            <Badge
              variant="outline"
              asChild
              className="gap-2 bg-background/60 py-1 pr-3 pl-1.5 text-sm backdrop-blur"
            >
              <Link href="#changelog">
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  New
                </span>
                Relay 3.0 adds AI triage for every inbox
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Badge>
          </div>

          <h1
            id="hero-heading"
            className="hero-rise mt-6 max-w-4xl text-balance text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Ship customer replies{" "}
            <span className="hero-gradient-text">ten times faster</span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Relay unifies email, chat and social into one shared workspace, then
            drafts, routes and resolves the routine tickets for you, so your
            team can focus on the conversations that actually need a human.
          </p>

          {/* CTA pair */}
          <div
            className="hero-rise mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg" className="h-11 px-7 text-base">
              <Link href="#signup">
                Start free trial
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 bg-background/60 px-7 text-base backdrop-blur"
            >
              <Link href="#demo">
                <PlayCircle aria-hidden="true" />
                Watch 2-min demo
              </Link>
            </Button>
          </div>

          <ul
            className="hero-rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-foreground" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {/* Rating */}
          <div
            className="hero-rise mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
            style={{ animationDelay: "360ms" }}
          >
            <AvatarGroup aria-hidden="true">
              {REVIEWERS.map((initials) => (
                <Avatar key={initials}>
                  <AvatarFallback className="text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <div className="flex items-center gap-1">
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9 out of 5</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rated by 3,200+ support leads on G2 and Capterra
              </p>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section
          aria-labelledby="trusted-heading"
          className="hero-rise pb-12 sm:pb-16"
          style={{ animationDelay: "440ms" }}
        >
          <h2
            id="trusted-heading"
            className="text-center text-sm font-medium text-muted-foreground"
          >
            Trusted by support teams at 1,800+ fast-growing companies
          </h2>

          <div className="hero-marquee hero-marquee-mask mt-6 overflow-hidden">
            <div className="hero-marquee-track flex w-max">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {BRANDS.map((brand) => (
                    <li
                      key={brand.name}
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {brand.mark}
                      <span className="text-lg font-semibold tracking-tight whitespace-nowrap">
                        {brand.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
```