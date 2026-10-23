import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search, ShieldCheck, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter, SiteHeader } from "@/components/site/header";
import { cn } from "@/lib/utils";

const title = `${siteConfig.name}: ${siteConfig.tagline}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: { card: "summary", title, description: siteConfig.description },
};

const features = [
  {
    icon: BookOpen,
    title: "Shared notebooks",
    text: "Keep every note in notebooks your whole team can open, edit and organize together.",
  },
  {
    icon: Search,
    title: "Instant search",
    text: "Find any note in a moment, across every notebook you have access to.",
  },
  {
    icon: ShieldCheck,
    title: "Roles and permissions",
    text: "Owners, admins and members get exactly the access their role calls for.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">{siteConfig.name}</h1>
          <p className="mx-auto mt-6 max-w-xl text-xl text-muted-foreground">{siteConfig.tagline}</p>
          <div className="mt-8">
            <Link href="/auth" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}>
              Get started
            </Link>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-center text-3xl font-semibold">Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="mb-2 size-6 text-primary" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-center text-3xl font-semibold">Pricing</h2>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {siteConfig.plans.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  <CardDescription>{p.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    <span className="text-4xl font-bold">{p.price}</span>{" "}
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </p>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((x) => (
                      <li key={x} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {x}
                      </li>
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
