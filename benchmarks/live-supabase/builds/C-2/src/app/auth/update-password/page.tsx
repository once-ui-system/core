import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { DemoNotice } from "@/components/site/demo-notice";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <DemoNotice />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <UpdatePasswordForm configured={isSupabaseConfigured()} />
      </div>
    </>
  );
}
