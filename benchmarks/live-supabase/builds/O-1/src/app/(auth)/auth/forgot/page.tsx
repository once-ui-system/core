import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../../../../components/AuthForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a link to reset your Acme Notes password.",
};

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="forgot" />
    </Suspense>
  );
}
