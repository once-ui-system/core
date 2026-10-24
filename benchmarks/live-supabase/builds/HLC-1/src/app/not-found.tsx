import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">We could not find that page</h1>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to home</Link>
      </main>
    </>
  );
}
