import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search, ShieldCheck, Check } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const title = `${siteConfig.name}: ${siteConfig.tagline}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: { card: "summary", title, description: siteConfig.description },
};

const features = [
  { icon: BookOpen, title: "Shared notebooks", body: "Keep every team's notes in notebooks everyone can open, edit and organize together." },
  { icon: Search, title: "Instant search", body: "Find any note, in any notebook, the moment you start typing." },
  { icon: ShieldCheck, title: "Roles and permissions", body: "Owners, admins and members: decide who can read, edit and invite." },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          {siteConfig.tagline}
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/auth" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-5xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="mb-2 size-6 text-primary" />
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-5xl px-4 py-12 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For small teams getting started.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">$0</p>
              <p className="mt-4 flex items-center gap-2 text-sm"><Check className="size-4 text-primary" /> Up to 3 members</p>
            </CardContent>
          </Card>
          <Card className="ring-primary">
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>For teams that grow.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">$8 <span className="text-base font-normal text-muted-foreground">per member per month</span></p>
              <p className="mt-4 flex items-center gap-2 text-sm"><Check className="size-4 text-primary" /> Unlimited members</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
