import type { Metadata } from "next";
import { WelcomeView } from "@/components/WelcomeView";

export const metadata: Metadata = { title: "Welcome to Lumen" };

export default function Page() {
  return <WelcomeView />;
}
