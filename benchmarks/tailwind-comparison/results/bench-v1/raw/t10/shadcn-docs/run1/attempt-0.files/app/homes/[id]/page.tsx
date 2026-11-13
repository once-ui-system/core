import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, Calendar, Check, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AGENT,
  HOMES,
  formatBeds,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";
import { SiteHeader } from "@/components/haven/site-header";
import { HomePlaceholder } from "@/components/haven/home-placeholder";
import { SaveButton } from "@/components/haven/save-button";
import { EnergyRating } from "@/components/haven/energy-rating";
import { DetailMapLoader } from "@/components/haven/detail-map-loader";
import { ContactForm } from "@/components/haven/contact-form";

export const dynamicParams = false;

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found · Haven" };
  return { title: `${home.title}, ${home.district} · Haven` };
}

const GALLERY_LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { icon: Bath, label: "Bathrooms", value: String(home.baths) },
    { icon: Ruler, label: "Area", value: `${home.area_m2} m²` },
    { icon: Calendar, label: "Built", value: String(home.year) },
  ];

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <section aria-label="Photo gallery" className="mb-8">
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {GALLERY_LABELS.map((label, i) => (
              <li key={label} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[32%]">
                <HomePlaceholder
                  home={home}
                  variant={i}
                  className="rounded-xl"
                  label={`${label} of ${home.title} (placeholder)`}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-8">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{home.type}</Badge>
                {isNew(home) ? <Badge className="bg-emerald-600 text-white">New this week</Badge> : null}
                <span className="text-sm text-muted-foreground">{formatListed(home)}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">{home.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {home.district}, Lisbon
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight">{formatPrice(home.price)}</p>
                <SaveButton homeId={home.id} title={home.title} withLabel />
              </div>
            </header>

            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="sr-only">
                Key facts
              </h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border p-4">
                    <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Separator />

            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="mb-3 text-xl font-semibold">
                Features
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {home.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="energy-heading">
              <h2 id="energy-heading" className="mb-3 text-xl font-semibold">
                Energy rating
              </h2>
              <EnergyRating rating={home.energy} />
            </section>

            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="mb-3 text-xl font-semibold">
                Location
              </h2>
              <div className="h-72 overflow-hidden rounded-xl border">
                <DetailMapLoader home={home} />
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="contact-heading"
            className="rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-6"
          >
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact the agent
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              {AGENT.name}, {AGENT.agency}
            </p>
            <ContactForm home={home} />
          </aside>
        </div>
      </main>
    </div>
  );
}
