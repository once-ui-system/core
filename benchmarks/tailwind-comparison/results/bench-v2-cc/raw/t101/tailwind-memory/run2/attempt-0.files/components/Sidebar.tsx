"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navGroups } from "@/lib/nav";

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-3">
      <ul className="flex flex-col gap-3">
        {navGroups.map((group) => {
          const isOpen = collapsed || !closed[group.label];
          const listId = `nav-group-${group.label.toLowerCase()}`;
          return (
            <li key={group.label}>
              {collapsed ? (
                <div className="mx-2 mb-1 border-t border-line" role="presentation" />
              ) : (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  onClick={() =>
                    setClosed((prev) => ({ ...prev, [group.label]: !prev[group.label] }))
                  }
                  className="mb-1 flex w-full items-center justify-between rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle hover:text-ink"
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
              )}
              <ul id={listId} hidden={!isOpen} className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`flex h-8 items-center gap-2.5 rounded-sm px-2 text-sm font-medium ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "bg-brand text-white"
                            : "text-ink-muted hover:bg-slate-100 hover:text-ink"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
