import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Pawpoint", template: "%s | Pawpoint" },
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
