"use client";

import { useState } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Star,
  Check,
  Zap,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Command,
  Layers,
} from "lucide-react";

type Brand = {
  name: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const brands: Brand[] = [
  { name: "Northwind", Icon: Hexagon },
  { name: "Lumen Labs", Icon: Circle },
  { name: "Vertex", Icon: Triangle },
  { name: "Blockwise", Icon: Square },
  { name: "Cmd+K", Icon: Command },
  { name: "Stackline", Icon: Layers },
];

const highlights = [
  "14-day free trial",
  "No credit card required",
  "SOC 2 Type II compliant",
];

export default function Page() {
  const [watching, setWatching] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
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
          50% { transform: translate3d(-50px, -20px, 0) scale(1.15); }
        }
        @keyframes hero-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-gradient-text {
          background-image: linear-gradient(90deg, #67e8f9, #a78bfa, #f0abfc, #67e8f9);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hero-gradient-shift 8s ease-in-out infinite;
        }
        .hero-blob-a { animation: hero-float-a 18s ease-in-out infinite; }
        .hero-blob-b { animation: hero-float-b 22s ease-in-out infinite; }
        .hero-marquee-track { animation: hero-marquee 32s linear infinite; }
        .hero-marquee:hover .hero-marquee-track { animation-play-state: paused; }
        .hero-fade-up { animation: hero-fade-up 0.7s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-text,
          .hero-blob-a,
          .hero-blob-b,
          .hero-marquee-track,
          .hero-fade-up { animation: none !important; }
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
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
        <div className="hero-blob-a absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-[90%] rounded-full bg-violet-600/30 blur-3xl sm:h-[36rem] sm:w-[36rem]" />
        <div className="hero-blob-b absolute -top-20 left-1/2 h-[24rem] w-[24rem] translate-x-[10%] rounded-full bg-cyan-500/25 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <a
            href="#top"
            className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
              <Zap className="h-4 w-4" aria-hidden="true" />
            </span>
            Relaywise
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="rounded transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Features</a>
            <a href="#pricing" className="rounded transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Pricing</a>
            <a href="#customers" className="rounded transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Customers</a>
            <a href="#docs" className="rounded transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Docs</a>
          </nav>
          <a
            href="#signin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Sign in
          </a>
        </header>

        {/* Hero */}
        <section
          id="top"
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-20"
        >
          <a
            href="#changelog"
            className="hero-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span>New: AI-assisted incident summaries</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <h1
            id="hero-heading"
            className="hero-fade-up mt-8 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight [animation-delay:80ms] sm:text-6xl lg:text-7xl"
          >
            Ship reliable software, <span className="hero-gradient-text">without the on-call dread</span>
          </h1>

          <p className="hero-fade-up mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 [animation-delay:160ms] sm:text-lg">
            Relaywise unifies monitoring, alert routing and incident response in one workspace, so
            your team resolves outages 63% faster and sleeps through the noise that doesn&apos;t matter.
          </p>

          <div className="hero-fade-up mt-10 flex w-full flex-col items-stretch justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:items-center">
            <a
              href="#start"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-violet-500/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Start free trial
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <button
              type="button"
              onClick={() => setWatching((v) => !v)}
              aria-pressed={watching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {watching ? "Playing demo…" : "Watch 2-min demo"}
            </button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {watching ? "Demo video started" : ""}
          </p>

          <ul className="hero-fade-up mt-8 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-slate-400 [animation-delay:320ms] sm:flex-row sm:flex-wrap sm:justify-center">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof */}
        <section
          id="customers"
          aria-labelledby="proof-heading"
          className="pb-14 sm:pb-20"
        >
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-4">
            <div className="flex items-center gap-0.5" role="img" aria-label="Rated 4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>
            <h2 id="proof-heading" className="text-sm text-slate-400">
              Rated 4.9/5 by 2,400+ engineering teams, including
            </h2>
          </div>

          <div
            className="hero-marquee relative mt-8 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <ul className="hero-marquee-track flex w-max items-center gap-12 sm:gap-16">
              {[...brands, ...brands].map(({ name, Icon }, i) => {
                const duplicate = i >= brands.length;
                return (
                  <li
                    key={`${name}-${i}`}
                    aria-hidden={duplicate ? true : undefined}
                    className="flex items-center gap-2 text-slate-400 transition hover:text-slate-100"
                  >
                    <Icon className="h-6 w-6" aria-hidden={true} />
                    <span className="whitespace-nowrap text-lg font-semibold tracking-tight">
                      {name}
                    </span>
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
