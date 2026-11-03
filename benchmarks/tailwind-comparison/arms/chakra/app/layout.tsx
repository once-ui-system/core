import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = { title: "Benchmark" };

// Official Next.js App Router setup: the CLI's Provider snippet (ChakraProvider
// with defaultSystem + next-themes color mode), the Toaster snippet, and the guide's
// EmotionRegistry (useServerInsertedHTML), without which Next 16 production builds
// fail hydration (React #418) on every page, an empty one included.
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
