import Link from "next/link";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = pageMetadata({
  description: site.description,
  path: "/",
  openGraph: true,
});

const features = [
  {
    title: "Shared notebooks",
    body: "Group notes into notebooks that the whole team can open, edit and follow.",
  },
  {
    title: "Instant search",
    body: "Find any note by a word in its title or body while you type, across every notebook you can see.",
  },
  {
    title: "Roles and permissions",
    body: "Owners, admins and members. Each organization decides who can invite, change settings and upgrade.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For small teams getting started.",
    points: ["Up to 3 members", "Shared notebooks", "Instant search"],
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    description: "For teams that grow past three people.",
    points: ["Unlimited members", "Everything in Free", "Roles and permissions"],
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-24 text-center">
          <p className="text-sm font-medium text-brand-accent">{site.name}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{site.tagline}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{site.description}</p>
          <div className="mt-10 flex justify-center">
            <Link href="/auth" className={buttonVariants({ size: "lg" })}>
              Get started
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section id="pricing" className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Pricing</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <p>
                    <span className="text-4xl font-semibold">{plan.price}</span>{" "}
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {plan.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
