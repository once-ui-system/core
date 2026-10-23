import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get a link to reset your Acme Notes password.",
};

export default function Page() {
  return <AuthCard kind="forgot" />;
}
