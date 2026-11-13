import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/HomeDetail";
import { HOMES, formatPrice, getHome } from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((home) => ({ id: home.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${formatPrice(home.price)} · ${home.beds} bed · ${home.area_m2} m² in ${home.district}, Lisbon.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
