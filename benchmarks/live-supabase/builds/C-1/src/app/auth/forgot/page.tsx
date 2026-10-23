import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Acme Notes password.",
};

export default function Page() {
  return <ForgotForm />;
}
