"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { navGroups } from "./nav-config";

interface NavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function Nav({ collapsed = false, onNavigate }: NavProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        const open = collapsed || !closed[group.id];
        const listId = `nav-group-${group.id}`;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            {collapsed ? (
              <div className="mx-auto my-1 h-px w-8 bg-line" role="presentation" />
            ) : (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                className="flex min-h-12 w-full items-center gap-3 rounded-brand px-4 text-sm font-semibold tracking-wide text-muted uppercase hover:bg-sunken"
              >
                <GroupIcon aria-hidden="true" className="size-5" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`}
                />
              </button>
            )}
            <ul id={listId} hidden={!open} className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const current = item.href === pathname;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-brand px-4 font-medium transition-colors ${
                        collapsed ? "justify-center" : ""
                      } ${
                        current
                          ? "bg-primary text-white"
                          : "text-ink hover:bg-sunken"
                      } ${!collapsed && "pl-6"}`}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
