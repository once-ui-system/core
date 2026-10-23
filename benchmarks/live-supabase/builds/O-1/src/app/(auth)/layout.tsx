import { SiteShell } from "../../components/SiteChrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      {children}
    </SiteShell>
  );
}
