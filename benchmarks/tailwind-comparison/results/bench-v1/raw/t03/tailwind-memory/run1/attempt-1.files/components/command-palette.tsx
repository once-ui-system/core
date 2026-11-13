"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CornerDownLeft,
  FolderKanban,
  FolderOpen,
  FolderPlus,
  LayoutDashboard,
  Moon,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { recentProjects } from "@/lib/data";

type Group = "Pages" | "Actions" | "Recent";

interface Command {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

const GROUPS: Group[] = ["Pages", "Actions", "Recent"];

interface Props {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  onInvite: () => void;
}

export function CommandPalette(props: Props) {
  if (!props.open) return null;
  return <PaletteInner {...props} />;
}

function PaletteInner({ onClose, dark, onToggleTheme, onInvite }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const commands = useMemo<Command[]>(
    () => [
      { id: "page-dashboard", group: "Pages", label: "Dashboard", hint: "/", icon: LayoutDashboard, run: () => router.push("/") },
      { id: "page-projects", group: "Pages", label: "Projects", hint: "/projects", icon: FolderKanban, run: () => router.push("/projects") },
      { id: "page-members", group: "Pages", label: "Members", hint: "/members", icon: Users, run: () => router.push("/members") },
      { id: "act-create", group: "Actions", label: "Create project", icon: FolderPlus, run: () => router.push("/projects") },
      { id: "act-invite", group: "Actions", label: "Invite member", icon: UserPlus, run: onInvite },
      { id: "act-theme", group: "Actions", label: "Toggle theme", icon: Moon, run: onToggleTheme },
      ...recentProjects.map<Command>((p) => ({
        id: `recent-${p.key}`,
        group: "Recent",
        label: p.name,
        hint: p.key,
        icon: FolderOpen,
        run: () => router.push("/projects"),
      })),
    ],
    [router, onInvite, onToggleTheme],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? commands.filter((c) => `${c.label} ${c.hint ?? ""}`.toLowerCase().includes(q))
      : commands;
    return GROUPS.flatMap((g) => list.filter((c) => c.group === g));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));
  const activeCommand: Command | undefined = filtered[activeIndex];
  const activeDomId = activeCommand ? `${uid}-${activeCommand.id}` : undefined;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  useEffect(() => {
    if (!activeDomId) return;
    const el = document.getElementById(activeDomId);
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest" });
  }, [activeDomId]);

  function execute(cmd: Command | undefined) {
    if (!cmd) return;
    onClose();
    window.setTimeout(cmd.run, 0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filtered.length) setActive((activeIndex + 1) % filtered.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (filtered.length) setActive((activeIndex - 1 + filtered.length) % filtered.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(Math.max(filtered.length - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        execute(activeCommand);
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "Tab":
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  const panel = dark
    ? "bg-slate-900 text-slate-100 border-slate-700"
    : "bg-white text-slate-900 border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[10vh] sm:pt-[15vh]"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={`relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border shadow-2xl ${panel}`}
      >
        <div className={`flex items-center gap-3 border-b px-4 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <Search className={`size-4 shrink-0 ${muted}`} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded={true}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeDomId}
            aria-label="Search commands"
            placeholder="Search pages, actions, projects…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
          <kbd
            className={`hidden rounded border px-1.5 py-0.5 text-xs sm:block ${
              dark ? "border-slate-600" : "border-slate-300"
            } ${muted}`}
          >
            Esc
          </kbd>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p role="status" className={`px-3 py-8 text-center text-sm ${muted}`}>
              No results for “{query}”.
            </p>
          ) : (
            GROUPS.map((group) => {
              const items = filtered.filter((c) => c.group === group);
              if (items.length === 0) return null;
              const headingId = `${uid}-group-${group}`;
              return (
                <div key={group} role="group" aria-labelledby={headingId} className="mb-1 last:mb-0">
                  <div
                    id={headingId}
                    className={`px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide ${muted}`}
                  >
                    {group}
                  </div>
                  {items.map((cmd) => {
                    const isActive = cmd.id === activeCommand?.id;
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
                        id={`${uid}-${cmd.id}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => execute(cmd)}
                        onMouseMove={() => {
                          const idx = filtered.indexOf(cmd);
                          if (idx !== activeIndex) setActive(idx);
                        }}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : dark
                              ? "text-slate-200"
                              : "text-slate-800"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && (
                          <span className={`text-xs ${isActive ? "text-indigo-100" : muted}`}>{cmd.hint}</span>
                        )}
                        {isActive && <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div
          className={`hidden items-center gap-4 border-t px-4 py-2 text-xs sm:flex ${muted} ${
            dark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
