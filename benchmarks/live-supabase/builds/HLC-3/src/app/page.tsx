import type { Metadata } from "next";
import Link from "next/link";
import { Check, FolderOpen, Search, ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const title = site.seo.titleDefault;
const description = site.description;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: site.name,
    type: "website",
  },
};

const features = [
  {
    title: "Shared notebooks",
    description: "Put notes in notebooks the whole team can open, so answers live where people look for them.",
    icon: FolderOpen,
  },
  {
    title: "Instant search",
    description: "Search across every notebook you can read as you type, with no index to wait for.",
    icon: Search,
  },
  {
    title: "Roles and permissions",
    description: "Owners, admins and members. Each person sees and changes only what their role allows.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const { free, team } = site.pricing;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <Badge variant="outline" className="mb-6 border-brand text-brand">
            For teams
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{site.name}</h1>
          <p className="mt-4 text-xl text-brand-accent sm:text-2xl">{site.tagline}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Write notes once, share them with the people who need them, and find any of them in
            seconds.
          </p>
          <Link href="/auth" className={buttonVariants({ size: "lg", className: "mt-10 px-6" })}>
            Get started
          </Link>
        </section>

        <section aria-labelledby="features" className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="features" className="sr-only">
            Features
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 size-6 text-brand" aria-hidden="true" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="pricing" className="mx-auto max-w-4xl px-4 py-16">
          <h2 id="pricing" className="text-center text-3xl font-semibold tracking-tight">
            Pricing
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For small teams getting started.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">
                  ${free.price}
                  <span className="ml-1 text-base font-normal text-muted-foreground">/ month</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="size-4 text-brand" aria-hidden="true" />Up to {free.memberLimit} members</li>
                  <li className="flex gap-2"><Check className="size-4 text-brand" aria-hidden="true" />Shared notebooks and search</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="ring-brand">
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For growing teams that need every member.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">
                  ${team.pricePerMemberPerMonth}
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    per member per month
                  </span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="size-4 text-brand" aria-hidden="true" />No member limit</li>
                  <li className="flex gap-2"><Check className="size-4 text-brand" aria-hidden="true" />Roles and permissions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
