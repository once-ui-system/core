import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/haven/HomeDetail";
import { formatPrice, getHome, listings } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return listings.homes.map((home) => ({ id: home.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${home.type} in ${home.district}, ${listings.city}: ${home.beds === 0 ? "studio" : `${home.beds} bedrooms`}, ${home.area_m2} m², ${formatPrice(home.price)}.`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
