import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
