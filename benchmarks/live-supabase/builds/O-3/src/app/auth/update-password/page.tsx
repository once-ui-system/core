import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
};

export default function Page() {
  return <AuthCard kind="update" />;
}
