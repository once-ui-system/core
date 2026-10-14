```tsx
import type { CSSProperties, ReactNode } from "react";

type Logo = {
  name: string;
  mark: ReactNode;
};

const svgBase = {
  viewBox: "0 0 24 24",
  width: 24,
  height: 24,
  "aria-hidden": true,
  focusable: false,
} as const;

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg {...svgBase} className={className} width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg {...svgBase} className={className} width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg {...svgBase} className={className} width={16} height={16} fill="currentColor">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg {...svgBase} className={className} width={16} height={16} fill="currentColor">
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...svgBase} className={className} width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const LOGOS: Logo[] = [
  {
    name: "Northwind Labs",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19 9 5l4 9 3-6 5 11" />
      </svg>
    ),
  },
  {
    name: "Quillpay",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="currentColor">
        <circle cx="12" cy="12" r="9" opacity="0.25" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    ),
  },
  {
    name: "Helio",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    ),
  },
  {
    name: "Brightloop",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 8a4 4 0 1 0 4 4" />
      </svg>
    ),
  },
  {
    name: "Monarch",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="currentColor">
        <path d="M12 3 21 9v6l-9 6-9-6V9z" opacity="0.3" />
        <path d="M12 8 17 11.5v3L12 18l-5-3.5v-3z" />
      </svg>
    ),
  },
  {
    name: "Fernhill",
    mark: (
      <svg {...svgBase} className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V9" />
        <path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6Z" />
        <path d="M12 16c4 0 6-2 6-6-4 0-6 2-6 6Z" />
      </svg>
    ),
  },
];

const HIGHLIGHTS = ["No credit card required", "14-day free trial", "SOC 2 Type II"];

const NAV_ITEMS = ["Product", "Pricing", "Customers", "Docs"];

const AVATARS = [
  { initials: "AK", className: "from-indigo-400 to-violet-500" },
  { initials: "MR", className: "from-sky-400 to-indigo-500" },
  { initials: "JT", className: "from-fuchsia-400 to-pink-500" },
  { initials: "LS", className: "from-emerald-400 to-teal-500" },
];

const STYLES = `
@keyframes hero-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(6%, 8%, 0) scale(1.12); }
}
@keyframes hero-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-8%, -6%, 0) scale(1.08); }
}
@keyframes hero-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translate3d(0, 14px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
.hero-blob-a { animation: hero-drift-a 18s ease-in-out infinite; }
.hero-blob-b { animation: hero-drift-b 22s ease-in-out infinite; }
.hero-gradient-text {
  background-image: linear-gradient(90deg, #a5b4fc, #e879f9, #38bdf8, #a5b4fc);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: hero-shimmer 8s linear infinite;
}
.hero-rise { opacity: 0; animation: hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.hero-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
}
.hero-vignette {
  background: radial-gradient(ellipse at center, transparent 40%, #020617 100%);
}
@media (prefers-reduced-motion: reduce) {
  .hero-blob-a, .hero-blob-b, .hero-gradient-text { animation: none; }
  .hero-rise { animation: none; opacity: 1; }
}
`;

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Background effect */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-blob-a absolute -left-[10%] -top-[15%] h-[32rem] w-[32rem] rounded-full bg-indigo-600/30 blur-3xl sm:h-[40rem] sm:w-[40rem]" />
        <div className="hero-blob-b absolute -right-[10%] top-[5%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-3xl sm:h-[36rem] sm:w-[36rem]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="hero-vignette absolute inset-0" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <a
            href="#"
            className="flex items-center gap-2 rounded-md text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-slate-950">
              <SparklesIcon className="h-4 w-4" />
            </span>
            Lumen
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-md transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Sign in
          </a>
        </header>

        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-24"
        >
          <a
            href="#"
            className="hero-rise group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 sm:text-sm"
          >
            <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-indigo-200">
              New
            </span>
            Lumen Insights 2.0 is here
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>

          <h1
            id="hero-heading"
            style={delay(80)}
            className="hero-rise mt-8 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Turn scattered data into{" "}
            <span className="hero-gradient-text">decisions your team trusts</span>
          </h1>

          <p
            style={delay(160)}
            className="hero-rise mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            Lumen connects your warehouse, billing and product analytics into one live workspace, so
            every team answers questions in seconds instead of waiting days for a dashboard.
          </p>

          <div
            style={delay(240)}
            className="hero-rise mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
            >
              Start free trial
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 sm:text-base"
            >
              <PlayIcon className="h-4 w-4" />
              Watch 2-min demo
            </a>
          </div>

          <ul
            style={delay(320)}
            className="hero-rise mt-6 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-slate-400 sm:flex-row"
          >
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div style={delay(400)} className="hero-rise mt-16 w-full sm:mt-20">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="flex -space-x-2" aria-hidden="true">
                {AVATARS.map((a) => (
                  <span
                    key={a.initials}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br ${a.className} text-[0.65rem] font-bold text-slate-950`}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="flex" role="img" aria-label="Rated 4.9 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                </span>
                <span>
                  <strong className="font-semibold text-white">4.9/5</strong> from 2,400+ reviews
                </span>
              </div>
            </div>

            <p className="mt-8 text-xs font-medium uppercase tracking-widest text-slate-500">
              Trusted by data teams at fast-growing companies
            </p>
            <ul className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
              {LOGOS.map((logo) => (
                <li
                  key={logo.name}
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
                >
                  {logo.mark}
                  <span className="text-sm font-semibold tracking-tight">{logo.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
```