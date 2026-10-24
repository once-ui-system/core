import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, auth } from "@/resources";

// Depends on the environment at request time (demo mode or live Supabase).
export const dynamic = "force-dynamic";

const seo = auth.updatePassword;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  robots: seo.robots,
  alternates: { canonical: seo.path },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm configured={isSupabaseConfigured()} />;
}
