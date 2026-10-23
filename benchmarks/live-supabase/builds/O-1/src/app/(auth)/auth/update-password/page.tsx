import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../../../../components/AuthForm";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
};

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="update" />
    </Suspense>
  );
}
