import Link from "next/link";
import { BarChart3, Bug, Users } from "lucide-react";

import { brand, features, logos } from "@/lib/data";

const icons = {
  chart: BarChart3,
  issue: Bug,
  team: Users,
} as const;

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-link">
          {brand.name} for small software teams
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          {brand.tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          See what your users do, turn the surprises into issues, and keep both
          in one place your whole team opens every day.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn btn-primary">
            Start free
          </Link>
          <Link href="/pricing" className="btn btn-secondary">
            See pricing
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="logos-heading"
        className="border-y border-line bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2
            id="logos-heading"
            className="text-center text-sm font-medium text-muted"
          >
            Trusted by small teams shipping every week
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <li
                key={logo}
                className="font-serif text-xl font-bold text-muted"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
        {features.map((f, i) => {
          const Icon = icons[f.icon];
          return (
            <section
              key={f.title}
              aria-labelledby={`feature-${i}`}
              className="grid items-center gap-8 border-b border-line py-16 last:border-b-0 md:grid-cols-2 md:gap-14"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <span className="inline-flex size-11 items-center justify-center rounded-lumen bg-brand text-brand-fg">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h2 id={`feature-${i}`} className="mt-5 text-3xl font-bold">
                  {f.title}
                </h2>
                <p className="mt-4 text-muted">{f.body}</p>
              </div>
              <ul className="card divide-y divide-line">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 px-5 py-4">
                    <span
                      className="size-2 shrink-0 rounded-full bg-brand"
                      aria-hidden="true"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Ready to read your product?</h2>
          <Link href="/pricing" className="btn btn-primary">
            Compare plans
          </Link>
        </div>
      </section>
    </>
  );
}
