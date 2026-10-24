import type { Metadata } from "next";
import { CreateOrgForm } from "@/components/product/CreateOrgForm";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

const seo = product.dashboard;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: `New organization - ${seo.title.split(" - ").pop()}`,
  description: seo.description,
  robots: seo.robots,
};

export default function NewOrganization() {
  return <CreateOrgForm demo={!isSupabaseConfigured()} />;
}
