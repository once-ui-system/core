import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = { title: "Benchmark" };

// Official Next.js App Router setup: the CLI's Provider snippet (ChakraProvider
// with defaultSystem + next-themes color mode) and the Toaster snippet.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
