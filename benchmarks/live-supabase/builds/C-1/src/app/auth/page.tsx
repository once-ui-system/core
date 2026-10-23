import type { Metadata } from "next";
import { SignInForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes or create an account.",
};

export default function AuthPage() {
  return <SignInForm />;
}
