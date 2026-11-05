import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
