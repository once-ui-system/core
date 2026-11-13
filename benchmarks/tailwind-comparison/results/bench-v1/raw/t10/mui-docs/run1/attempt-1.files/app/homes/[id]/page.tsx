import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeDetail from "@/components/HomeDetail";
import { HOMES, formatPrice, getHome } from "@/lib/data";

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
  return {
    title: `${home.title}, ${home.district} · ${formatPrice(home.price)} · Haven`,
    description: `${home.type} in ${home.district}, Lisbon with ${home.beds} beds and ${home.area_m2} m².`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
