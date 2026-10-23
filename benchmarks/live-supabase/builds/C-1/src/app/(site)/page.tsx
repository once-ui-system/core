import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${siteConfig.name}: ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name}: ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary", title: siteConfig.name, description: siteConfig.tagline },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{siteConfig.tagline}</p>
        <div className="mt-8">
          <Link href="/auth" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        </div>
      </section>

      <section className="py-12" aria-labelledby="features">
        <h2 id="features" className="mb-6 text-2xl font-semibold">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {siteConfig.features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12" aria-labelledby="pricing">
        <h2 id="pricing" className="mb-6 text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {siteConfig.plans.map((p) => (
            <Card key={p.name}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>
                  <span className="text-4xl font-bold">{p.price}</span>{" "}
                  <span className="text-muted-foreground">{p.detail}</span>
                </p>
                <Link href="/auth" className={buttonVariants({ variant: "outline" })}>
                  {p.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
