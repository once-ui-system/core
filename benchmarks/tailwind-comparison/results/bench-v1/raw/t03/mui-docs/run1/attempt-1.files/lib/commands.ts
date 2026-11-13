export type CommandGroup = "Pages" | "Actions" | "Recent";

export type CommandIconName =
  | "dashboard"
  | "projects"
  | "members"
  | "create"
  | "invite"
  | "theme"
  | "project";

export type CommandRun =
  | { type: "navigate"; href: string }
  | { type: "create-project" }
  | { type: "invite-member" }
  | { type: "toggle-theme" };

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  hint?: string;
  keywords?: string;
  icon: CommandIconName;
  run: CommandRun;
}

export const GROUP_ORDER: CommandGroup[] = ["Pages", "Actions", "Recent"];

export function filterCommands(commands: Command[], query: string): Command[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return commands;
  return commands.filter((c) => {
    const haystack = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
