The global CSS is just the Tailwind import, so I'll keep keyframes in an inline `<style>` tag and respect reduced motion. Logos will be inline SVG wordmarks, with no network assets.

```tsx
"use client";

import { useState } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";

type Logo = { name: string; mark: React.ReactNode };

const logos: Logo[] = [
  {
    name: "Northwind",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2 22 20H2L12 2Zm0 7-4.5 8h9L12 9Z" />
      </svg>
    ),
  },
  {
    name: "Lumina",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Parallel",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M4 3h5l-5 18H-1L4 3Zm11 0h5l-5 18h-5l5-18Z" transform="translate(2 0)" />
      </svg>
    ),
  },
  {
    name: "Overbeam",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M8 12h8M12 8v8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Kestrel",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M2 6c6 0 9 3 10 8 1-5 4-8 10-8-1 8-5 12-10 12S3 14 2 6Z" />
      </svg>
    ),
  },
  {
    name: "Brightside",
    mark: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20V2Z" />
      </svg>
    ),
  },
];

const avatars = [
  { initials: "AM", bg: "bg-indigo-500" },
  { initials: "JR", bg: "bg-fuchsia-500" },
  { initials: "SK", bg: "bg-emerald-500" },
  { initials: "TL", bg: "bg-amber-500" },
];

export default function Page() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim().length > 0) setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes hero-float-a {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(40px,30px,0) scale(1.1); }
        }
        @keyframes hero-float-b {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-50px,20px,0) scale(1.15); }
        }
        @keyframes hero-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-gradient-text {
          background-image: linear-gradient(90deg, #a5b4fc, #e879f9, #38bdf8, #a5b4fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hero-shimmer 6s linear infinite;
        }
        .hero-blob-a { animation: hero-float-a 14s ease-in-out infinite; }
        .hero-blob-b { animation: hero-float-b 18s ease-in-out infinite; }
        .hero-marquee-track { animation: hero-marquee 32s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-text, .hero-blob-a, .hero-blob-b, .hero-marquee-track {
            animation: none;
          }
        }
      `}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hero-blob-a absolute -top-40 left-1/2 size-[36rem] -translate-x-[85%] rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="hero-blob-b absolute -top-24 left-1/2 size-[32rem] translate-x-[10%] rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a
          href="#top"
          className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
            <Zap className="size-4 text-white" aria-hidden="true" />
          </span>
          Flowpilot
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {["Product", "Pricing", "Customers", "Docs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="rounded-md transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
            >
              {item}
            </a>
          ))}
        </nav>
        <a
          href="#signin"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Sign in
        </a>
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-12 text-center sm:pt-20 lg:pt-24">
          <a
            href="#changelog"
            className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:text-sm"
          >
            <Sparkles className="size-4 shrink-0 text-fuchsia-300" aria-hidden="true" />
            <span className="truncate">New: AI-drafted release notes are live</span>
            <ArrowRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          </a>

          <h1 className="mt-8 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Ship product updates{" "}
            <span className="hero-gradient-text">your whole team</span> can
            actually follow
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Flowpilot turns pull requests, tickets and Slack threads into one
            living roadmap, so engineering, design and support always know what
            shipped, what&apos;s next and why it matters.
          </p>

          {/* CTA pair */}
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#start"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
            >
              Start free for 14 days
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-slate-100 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
            >
              <Play className="size-4" aria-hidden="true" />
              Watch 2-min demo
            </a>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
            No credit card required · SOC 2 Type II compliant
          </p>

          {/* Email capture with state */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            aria-label="Get the product tour by email"
          >
            <label htmlFor="hero-email" className="sr-only">
              Work email
            </label>
            <input
              id="hero-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubmitted(false);
              }}
              placeholder="you@company.com"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            />
            <button
              type="submit"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Email me the tour
            </button>
          </form>
          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-emerald-400">
            {submitted ? `Thanks! We sent the product tour to ${email}.` : ""}
          </p>
        </section>

        {/* Social proof */}
        <section aria-labelledby="proof-heading" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <ul className="flex -space-x-2" aria-label="Customer avatars">
                {avatars.map((a) => (
                  <li
                    key={a.initials}
                    className={`grid size-8 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-slate-950 ${a.bg}`}
                  >
                    {a.initials}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1" role="img" aria-label="Rated 4.9 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
                <span className="ml-1 text-sm font-medium text-slate-200">4.9</span>
              </div>
            </div>
            <h2 id="proof-heading" className="text-center text-sm text-slate-400">
              Trusted by 3,200+ product teams at fast-moving companies
            </h2>
          </div>

          <div
            className="relative mt-10 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="hero-marquee-track flex w-max">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="flex shrink-0 items-center gap-14 pr-14 text-slate-400"
                  aria-hidden={copy === 1 ? true : undefined}
                  aria-label={copy === 0 ? "Customer logos" : undefined}
                >
                  {logos.map((logo) => (
                    <li
                      key={logo.name}
                      className="flex items-center gap-2 whitespace-nowrap text-lg font-semibold tracking-tight transition-colors hover:text-slate-200"
                    >
                      {logo.mark}
                      {logo.name}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
```