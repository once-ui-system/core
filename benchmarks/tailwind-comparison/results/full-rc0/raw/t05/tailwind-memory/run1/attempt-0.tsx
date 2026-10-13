"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Star,
  Check,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Diamond,
  Pentagon,
} from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

interface Logo {
  name: string;
  Icon: IconType;
}

const LOGOS: Logo[] = [
  { name: "Northwind", Icon: Hexagon },
  { name: "Lumina", Icon: Triangle },
  { name: "Orbital", Icon: Circle },
  { name: "Brightside", Icon: Square },
  { name: "Kestrel", Icon: Diamond },
  { name: "Foundry", Icon: Pentagon },
];

const HIGHLIGHTS = ["14-day free trial", "No credit card required", "SOC 2 Type II"];

const AVATAR_STYLES = [
  "from-indigo-400 to-violet-500",
  "from-sky-400 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
  "from-emerald-400 to-teal-500",
];
const AVATAR_INITIALS = ["MR", "JK", "AL", "TS"];

export default function Page() {
  const [playing, setPlaying] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes hero-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -24px, 0) scale(1.06); }
        }
        @keyframes hero-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-text-effect {
          background-image: linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #38bdf8, #818cf8);
          background-size: 200% 100%;
          animation: hero-shimmer 6s linear infinite;
        }
        .hero-orb { animation: hero-float 12s ease-in-out infinite; }
        .hero-orb-slow { animation: hero-float 18s ease-in-out infinite reverse; }
        .hero-marquee-track { animation: hero-marquee 32s linear infinite; }
        .hero-marquee:hover .hero-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hero-text-effect, .hero-orb, .hero-orb-slow, .hero-marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
        <div className="hero-orb absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-[85%] rounded-full bg-indigo-600/30 blur-3xl sm:h-[36rem] sm:w-[36rem]" />
        <div className="hero-orb-slow absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-[5%] rounded-full bg-fuchsia-600/25 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <a
            href="#top"
            className="flex items-center gap-2 rounded-md text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            Prismly
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {["Product", "Pricing", "Customers", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
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

        {/* Hero */}
        <section
          id="top"
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20"
        >
          <a
            href="#changelog"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:text-sm"
          >
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
              New
            </span>
            Forecasting 2.0 is now live
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>

          <h1
            id="hero-heading"
            className="mt-8 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Turn scattered data into{" "}
            <span className="hero-text-effect bg-clip-text text-transparent">
              decisions your team trusts
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 text-pretty sm:text-lg">
            Prismly connects your warehouse, CRM and billing tools into one live workspace, so
            finance, product and sales stop arguing about whose numbers are right and start
            shipping.
          </p>

          {/* CTA pair */}
          <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href="#start"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
            >
              Start free trial
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:text-base"
            >
              <Play className="h-4 w-4" aria-hidden="true" fill="currentColor" />
              {playing ? "Playing demo…" : "Watch 2-min demo"}
            </button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {playing ? "Product demo is playing" : ""}
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof */}
        <section aria-labelledby="proof-heading" className="pb-14 sm:pb-20">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <div className="flex -space-x-2" aria-hidden="true">
              {AVATAR_STYLES.map((style, i) => (
                <span
                  key={style}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br ${style} text-[11px] font-semibold text-white`}
                >
                  {AVATAR_INITIALS[i]}
                </span>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-1">
                <span className="flex" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} className="h-4 w-4 text-amber-400" fill="currentColor" />
                  ))}
                </span>
                <span className="text-sm font-medium text-slate-200">4.9 / 5</span>
                <span className="sr-only">average rating out of 5 stars</span>
              </div>
              <p id="proof-heading" className="text-sm text-slate-400">
                Trusted by 2,400+ data teams at fast-growing companies
              </p>
            </div>
          </div>

          <div
            className="hero-marquee relative mt-8 overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <ul className="hero-marquee-track flex w-max items-center gap-12 py-2 sm:gap-16">
              {[...LOGOS, ...LOGOS].map(({ name, Icon }, i) => {
                const duplicate = i >= LOGOS.length;
                return (
                  <li
                    key={`${name}-${i}`}
                    aria-hidden={duplicate ? true : undefined}
                    className="flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-200"
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span className="text-lg font-semibold tracking-tight">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
