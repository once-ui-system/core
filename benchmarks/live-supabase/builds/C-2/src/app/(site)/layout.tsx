import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { DemoNotice } from "@/components/site/demo-notice";
import { buttonVariants } from "@/components/ui/button";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoNotice />
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/blog" className={buttonVariants({ variant: "ghost" })}>
              Blog
            </Link>
            <Link href="/auth" className={buttonVariants({ variant: "outline" })}>
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; 2026 {siteConfig.name}</p>
          <nav className="flex gap-4">
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
