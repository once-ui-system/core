import { AppShell } from "../../components/AppShell";

// Every route in this folder renders inside the shell. It is mounted here, once,
// so open groups and the drawer survive navigation. A route outside the shell
// (sign-in, a landing page) goes outside (app)/.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
