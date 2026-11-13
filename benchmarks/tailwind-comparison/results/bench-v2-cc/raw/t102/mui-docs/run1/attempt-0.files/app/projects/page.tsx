import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProjectsList from "@/components/ProjectsList";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and what is still open."
      />
      <ProjectsList />
    </>
  );
}
