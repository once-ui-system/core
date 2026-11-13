import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProjectsList } from "@/components/ProjectsList";

export const metadata: Metadata = {
  title: "Projects · Lumen",
  description: "Every project in your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <ProjectsList />
    </AppShell>
  );
}
