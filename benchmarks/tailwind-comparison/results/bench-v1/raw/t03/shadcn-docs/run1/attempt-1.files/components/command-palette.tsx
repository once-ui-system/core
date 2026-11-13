"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FolderKanban,
  FolderPlus,
  LayoutDashboard,
  Moon,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { formatDate, recentProjects } from "@/lib/data";

interface PageEntry {
  id: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  href: string;
}

const pages: PageEntry[] = [
  { id: "page-dashboard", label: "Dashboard", keywords: ["home", "overview"], icon: LayoutDashboard, href: "/" },
  { id: "page-projects", label: "Projects", keywords: ["issues"], icon: FolderKanban, href: "/projects" },
  { id: "page-members", label: "Members", keywords: ["team", "people"], icon: Users, href: "/members" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onInvite,
  onCreateProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: () => void;
  onCreateProject: () => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = React.useState("");

  // Reset the query every time the palette closes.
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function run(action: () => void) {
    onOpenChange(false);
    // Let the palette finish closing so focus moves cleanly to what follows.
    window.setTimeout(action, 0);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search pages, actions and recent projects, then press Enter to run one."
    >
      <CommandInput
        placeholder="Search pages, actions and projects…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results for “{search}”.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.id}
              value={page.id}
              keywords={[page.label, ...page.keywords]}
              onSelect={() => run(() => router.push(page.href))}
            >
              <page.icon aria-hidden="true" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="action-create-project"
            keywords={["Create project", "new", "add"]}
            onSelect={() => run(onCreateProject)}
          >
            <FolderPlus aria-hidden="true" />
            <span>Create project</span>
          </CommandItem>
          <CommandItem
            value="action-invite-member"
            keywords={["Invite member", "add", "teammate", "email"]}
            onSelect={() => run(onInvite)}
          >
            <UserPlus aria-hidden="true" />
            <span>Invite member</span>
          </CommandItem>
          <CommandItem
            value="action-toggle-theme"
            keywords={["Toggle theme", "dark", "light", "appearance"]}
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            <Moon aria-hidden="true" />
            <span>Toggle theme</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent">
          {recentProjects.map((project) => (
            <CommandItem
              key={project.key}
              value={`recent-${project.key}`}
              keywords={[project.name, project.key, project.status]}
              onSelect={() => run(() => router.push("/projects"))}
            >
              <FolderKanban aria-hidden="true" />
              <span className="truncate">{project.name}</span>
              <Badge variant="outline" className="font-mono">
                {project.key}
              </Badge>
              <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                {formatDate(project.updated)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
