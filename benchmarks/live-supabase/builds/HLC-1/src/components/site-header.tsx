import Link from "next/link";
import { site } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block size-2.5 rounded-full bg-primary" aria-hidden="true" />
          {site.name}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/blog" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Blog
          </Link>
          <Link href="/auth" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
