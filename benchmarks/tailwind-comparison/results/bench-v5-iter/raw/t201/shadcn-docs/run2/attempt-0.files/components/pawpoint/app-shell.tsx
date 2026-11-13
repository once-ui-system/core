import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/pawpoint/patient-search";
import { user } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-offset-4">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">Pawpoint</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Hillside Veterinary Clinic</span>
            </span>
          </Link>
          <div className="order-last w-full md:order-none md:ml-4 md:w-auto md:max-w-md md:flex-1">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            <Avatar className="size-9">
              <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-7">
        {children}
      </main>
    </div>
  );
}
