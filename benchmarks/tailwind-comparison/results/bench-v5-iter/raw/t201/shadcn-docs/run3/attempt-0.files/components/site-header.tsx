import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/patient-search";
import { user } from "@/lib/data";

export function SiteHeader() {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint aria-hidden className="size-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-bold tracking-tight">Pawpoint</span>
            <span className="block text-[11px] text-muted-foreground">Hillside Veterinary Clinic</span>
          </span>
          <span className="sr-only sm:hidden">Pawpoint, Hillside Veterinary Clinic</span>
        </Link>
        <PatientSearch />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="sr-only md:hidden">
            Signed in as {user.name}, {user.role}
          </span>
        </div>
      </div>
    </header>
  );
}
