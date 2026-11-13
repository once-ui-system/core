import type { Metadata } from "next";
import { ProjectsList } from "@/components/ProjectsList";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsList />;
}
