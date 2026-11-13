import type { Metadata } from "next";
import { Welcome } from "@/components/Welcome";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function WelcomePage() {
  return <Welcome />;
}
