I can't edit globals.css, so keyframes need to go in an inline `<style>` tag. I'll keep the page a server component with pure CSS animation and a `prefers-reduced-motion` guard.

```tsx
import type { ReactNode } from "react";
import { ArrowRight, Play, Star, Sparkles, ShieldCheck } from "lucide-react";

type Logo = { name: string; mark: ReactNode };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const logos: Logo[] = [
  {
    name: "Northwind",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <path d="M4 20V6l8 8V4l8 16" />
      </svg>
    ),
  },
  {
    name: "Lumina",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    ),
  },
  {
    name: "Corvex",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  {
    name: "Paperplane",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <path d="M21 3L3 10l7 3 3 7z" />
        <path d="M10 13l11-10" />
      </svg>
    ),
  },
  {
    name: "Helix Labs",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <path d="M7 3c0 6 10 6 10 12s-10 6-10 6" />
        <path d="M17 3c0 6-10 6-10 12" />
      </svg>
    ),
  },
  {
    name: "Octave",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" {...stroke}>
        <path d="M3 12h2l2-6 3 12 3-9 2 3h6" />
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes hero-float-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(4%, 6%, 0) scale(1.08); }
        }
        @keyframes hero-float-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-5%, -4%, 0) scale(1.1); }
        }
        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-gradient-text {
          background-image: linear-gradient(90deg, #67e8f9, #a78bfa, #f0abfc, #67e8f9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hero-shimmer 6s linear infinite;
        }
        .hero-orb-a { animation: hero-float-a 14s ease-in-out infinite; }
        .hero-orb-b { animation: hero-float-b 18s ease-in-out infinite; }
        .hero-rise { animation: hero-rise 0.7s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-text, .hero-orb-a, .hero-orb-b, .hero-rise { animation: none; }
        }
      `}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
          }}
        />
        <div className="hero-orb-a absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-[85%] rounded-full bg-violet-600/30 blur-3xl sm:h-[36rem] sm:w-[36rem]" />
        <div className="hero-orb-b absolute -top-20 left-1/2 h-[24rem] w-[24rem] translate-x-[0%] rounded-full bg-cyan-500/25 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <a
            href="#"
            className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Relay
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {["Product", "Pricing", "Customers", "Docs"].map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-md transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Sign in
          </a>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-24">
          <a
            href="#"
            className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-slate-200 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:text-sm"
          >
            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-cyan-200">
              New
            </span>
            Relay 3.0 adds automated sprint recaps
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>

          <h1
            className="hero-rise mt-8 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Ship product updates{" "}
            <span className="hero-gradient-text">your whole team</span> actually reads
          </h1>

          <p
            className="hero-rise mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Relay turns commits, tickets and design changes into clear weekly
            updates, then delivers them to Slack, email and your changelog.
            Spend less time writing status reports and more time building.
          </p>

          <div
            className="hero-rise mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              Start free for 14 days
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              <Play className="size-4" aria-hidden="true" />
              Watch 2-min demo
            </a>
          </div>

          <p
            className="hero-rise mt-5 flex items-center gap-2 text-sm text-slate-400"
            style={{ animationDelay: "320ms" }}
          >
            <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
            No credit card required · SOC 2 Type II certified
          </p>
        </section>

        <section
          aria-labelledby="social-proof-heading"
          className="hero-rise pb-16 sm:pb-20"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
            <div className="flex items-center gap-1" role="img" aria-label="Rated 4.9 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <h2 id="social-proof-heading" className="text-sm text-slate-400">
              Rated 4.9/5 by 3,200+ teams at fast-moving companies
            </h2>
          </div>

          <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <li
                key={logo.name}
                className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
              >
                {logo.mark}
                <span className="text-base font-semibold tracking-tight">{logo.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
```