import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../../../components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create an account to use Acme Notes with your team.",
};

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
