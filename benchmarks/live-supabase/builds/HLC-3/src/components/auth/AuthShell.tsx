import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  error,
  message,
  children,
}: {
  title: string;
  description: string;
  error?: string;
  message?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 block text-center text-sm text-muted-foreground hover:text-foreground">
            {site.name}
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              {children}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
