import type { Metadata } from "next";
import { NewOrgForm } from "@/components/new-org-form";

export const metadata: Metadata = {
  title: "New organization",
  description: "Create an organization for your team.",
};

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <NewOrgForm />
    </div>
  );
}
