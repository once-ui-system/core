import { MembersTable } from "@/components/members-table";
import { PRODUCT } from "@/lib/data";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {PRODUCT.name} &middot; {PRODUCT.workspace}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage who can view dashboards, triage issues and administer the {PRODUCT.workspace}{" "}
          workspace.
        </p>
      </header>
      <MembersTable />
    </main>
  );
}
