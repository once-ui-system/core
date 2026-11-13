import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Check,
  Mail,
  Maximize2,
  Phone,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Placeholder } from "@/components/Placeholder";
import { EnergyRating } from "@/components/EnergyRating";
import { ContactForm } from "@/components/ContactForm";
import { DetailMapLoader } from "@/components/DetailMapLoader";
import {
  AGENT,
  HOMES,
  bedsLabel,
  formatDate,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: bedsLabel(home.beds) },
    { icon: Bath, label: "Bathrooms", value: String(home.baths) },
    { icon: Maximize2, label: "Area", value: `${home.area_m2} m²` },
    { icon: Calendar, label: "Built", value: String(home.year) },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        <section aria-label="Photo gallery" className="mt-4">
          <ul className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className={`shrink-0 max-md:w-[80%] ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <Placeholder
                  seed={home.id}
                  variant={i}
                  className={`w-full rounded-xl ${
                    i === 0
                      ? "h-56 md:h-full md:min-h-[22rem]"
                      : "h-56 md:h-[10.5rem]"
                  }`}
                />
                <span className="sr-only">Photo placeholder {i + 1} of 4</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">
            <section aria-labelledby="home-title">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-800">
                  {home.type}
                </span>
                {isNew(home.listed) && (
                  <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
                    New this week
                  </span>
                )}
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {formatPrice(home.price)}
              </p>
              <h1 id="home-title" className="mt-1 text-xl font-medium">
                {home.title}
              </h1>
              <p className="mt-1 text-stone-600">
                {home.district}, Lisbon · Listed {formatDate(home.listed)}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-stone-200 bg-white p-3"
                  >
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                      <Icon className="size-4" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="features-h">
              <h2 id="features-h" className="text-lg font-semibold">
                Features
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {home.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-stone-800">
                    <Check
                      className="size-4 shrink-0 text-teal-700"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="energy-h">
              <h2 id="energy-h" className="text-lg font-semibold">
                Energy rating
              </h2>
              <div className="mt-3">
                <EnergyRating rating={home.energy} />
              </div>
            </section>

            <section aria-labelledby="location-h">
              <h2 id="location-h" className="text-lg font-semibold">
                Location
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {home.district}, Lisbon
              </p>
              <div
                className="mt-3 h-72 overflow-hidden rounded-xl border border-stone-200"
                role="region"
                aria-label={`Map showing ${home.title}`}
              >
                <DetailMapLoader
                  lat={home.lat}
                  lng={home.lng}
                  label={`${home.title}, ${home.district}`}
                />
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="contact-h"
            className="lg:sticky lg:top-4 lg:self-start"
          >
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 id="contact-h" className="text-lg font-semibold">
                Contact the agent
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-full bg-teal-700 text-sm font-semibold text-white"
                >
                  IC
                </div>
                <div className="text-sm">
                  <p className="font-medium">{AGENT.name}</p>
                  <p className="text-stone-600">{AGENT.agency}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-stone-700">
                <li className="flex items-center gap-2">
                  <Phone className="size-4" aria-hidden="true" />
                  {AGENT.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4" aria-hidden="true" />
                  {AGENT.email}
                </li>
              </ul>
              <div className="mt-5 border-t border-stone-200 pt-5">
                <ContactForm homeTitle={home.title} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
