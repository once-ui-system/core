import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { brand, features, logos } from "@/lib/data";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            For small software teams
          </p>
          <h1 className="mt-4 text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Lumen turns your product data into a short, honest page your whole
            team reads on Monday morning, and lets you open an issue the moment
            a number looks wrong.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/pricing">
                Start free
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="customers"
        aria-labelledby="customers-heading"
        className="border-y bg-card/40"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <h2
            id="customers-heading"
            className="text-center font-sans text-sm font-medium text-muted-foreground"
          >
            Trusted by small teams at
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <li
                key={logo}
                className="font-serif text-xl font-semibold text-muted-foreground"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="features" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {features.map((feature, index) => (
          <section
            key={feature.title}
            aria-labelledby={`feature-${index}`}
            className="grid items-center gap-8 border-b py-14 last:border-b-0 sm:py-20 lg:grid-cols-2 lg:gap-16"
          >
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-sm font-medium text-primary">
                0{index + 1}
              </p>
              <h2
                id={`feature-${index}`}
                className="mt-2 text-3xl font-bold text-balance"
              >
                {feature.title}
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                {feature.body}
              </p>
            </div>
            <ul className="space-y-3 rounded-lg border bg-card p-6 text-card-foreground">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <CheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-bold text-balance">
            Give your team one page worth reading.
          </h2>
          <Button asChild size="lg">
            <Link href="/pricing">
              Compare plans
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
