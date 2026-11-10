import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
