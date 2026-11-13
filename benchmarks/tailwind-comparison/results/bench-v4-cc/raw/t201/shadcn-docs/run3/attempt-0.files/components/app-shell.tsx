import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC_NAME, PRODUCT_NAME, initials, user } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">{PRODUCT_NAME}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">{CLINIC_NAME}</span>
            </span>
          </Link>

          <div className="order-3 w-full md:order-none md:mx-auto md:w-auto md:max-w-lg md:flex-1">
            <PatientSearch />
          </div>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary text-sm font-semibold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only sm:hidden">
              Signed in as {user.name}, {user.role}
            </span>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 py-6 outline-none sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
