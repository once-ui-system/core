"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { isActive, navGroups } from "@/lib/nav";

export function Nav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {navGroups.map((group) => {
        const groupId = `nav-group-${group.label.toLowerCase()}`;
        const isClosed = !collapsed && closed[group.label];
        return (
          <div key={group.label} role="group" aria-labelledby={groupId}>
            {collapsed ? (
              <div
                id={groupId}
                className="mx-auto mb-2 h-px w-8 bg-sand-200"
                role="presentation"
              >
                <span className="sr-only">{group.label}</span>
              </div>
            ) : (
              <button
                type="button"
                id={groupId}
                aria-expanded={!isClosed}
                aria-controls={`${groupId}-list`}
                onClick={() => setClosed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="flex min-h-11 w-full items-center justify-between rounded-ui px-4 text-xs font-bold uppercase tracking-widest text-sand-600 hover:bg-sand-100"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                />
              </button>
            )}
            <ul
              id={`${groupId}-list`}
              hidden={isClosed}
              className="mt-1 flex flex-col gap-1"
            >
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-semibold transition-colors ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        active
                          ? "bg-brand-600 text-white shadow-card"
                          : "text-sand-800 hover:bg-sand-100"
                      }`}
                      style={active ? { color: "#fff" } : undefined}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
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
