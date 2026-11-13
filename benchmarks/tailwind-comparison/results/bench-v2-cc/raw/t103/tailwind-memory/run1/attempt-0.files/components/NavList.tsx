"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navGroups } from "@/lib/nav";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-col gap-4">
        {navGroups.map((group, index) => {
          const isClosed = !collapsed && closed[group.id] === true;
          const listId = `nav-group-${group.id}`;
          return (
            <li key={group.id}>
              {collapsed ? (
                index > 0 && <hr className="mb-4 border-line" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  aria-expanded={!isClosed}
                  aria-controls={listId}
                  onClick={() => setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-fg"
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                  />
                </button>
              )}
              <ul id={listId} hidden={isClosed} aria-label={group.label} className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "border-brand-500 bg-brand-500/15 text-brand-300"
                            : "border-transparent text-muted hover:bg-raised hover:text-fg"
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
