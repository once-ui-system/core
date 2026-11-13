import type { Metadata } from "next"
import { WelcomeContent } from "@/components/welcome/welcome-content"

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
}

export default function WelcomePage() {
  return <WelcomeContent />
}
