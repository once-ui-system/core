import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Lumen | Product analytics and issue tracking for small teams",
  description:
    "Product analytics and issue tracking that small teams actually read.",
};

// Official Next.js App Router setup: the CLI's Provider snippet (ChakraProvider
// with the Lumen system + next-themes color mode, dark by default), the Toaster
// snippet, and the guide's EmotionRegistry (useServerInsertedHTML), without which
// Next 16 production builds fail hydration (React #418) on every page.
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
