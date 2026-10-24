import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { site } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${site.name}: ${site.tagline}`,
  description: site.description,
  path: "/",
  openGraph: true,
});

const features = [
  {
    title: "Shared notebooks",
    body: "Keep team notes in notebooks that everyone in the organization can open, edit and link to.",
  },
  {
    title: "Instant search",
    body: "Find any note by a word from its title or body while you type, across every notebook you can see.",
  },
  {
    title: "Roles and permissions",
    body: "Owners, admins and members each get the access their role needs, and nothing more.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    blurb: "For small teams getting started.",
    points: ["Up to 3 members", "Shared notebooks and search", "Roles and permissions"],
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    blurb: "For teams that grow past three people.",
    points: ["Everything in Free", "Upgrade from Settings in a minute"],
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 pt-20 pb-16 sm:pt-28">
        <p className="text-sm font-medium text-highlight">{site.name}</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">{site.tagline}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          One workspace for your team&apos;s notes, with search that keeps up and roles that keep the right people in the
          right places.
        </p>
        <Link href="/auth" className={buttonVariants({ size: "lg" })}>
          Get started
        </Link>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.blurb}</CardDescription>
                <p className="pt-2">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  {plan.period && <span className="ml-2 text-sm text-muted-foreground">{plan.period}</span>}
                </p>
              </CardHeader>
              <div className="flex flex-col gap-6 px-4 pb-6">
                <ul className="flex flex-col gap-2 text-sm">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <CheckIcon className="size-4 text-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className={buttonVariants({ variant: "outline" })}>
                  Choose {plan.name}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
