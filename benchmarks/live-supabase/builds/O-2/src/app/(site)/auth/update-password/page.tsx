import type { Metadata } from "next";
import { AuthForm } from "../../../../components/AuthForm";
import { supabaseConfig } from "../../../../lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
};

export default function UpdatePasswordPage() {
  const { url, anonKey } = supabaseConfig();
  return <AuthForm supabaseUrl={url} anonKey={anonKey} initialMode="update" />;
}
