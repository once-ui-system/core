import Link from "next/link";
import { site } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm">
            A
          </span>
          {site.name}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
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
