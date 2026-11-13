"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navGroups } from "@/lib/nav";

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-4">
      <ul className="flex flex-col gap-5">
        {navGroups.map((group, index) => {
          const headingId = `nav-group-${group.label.toLowerCase()}${collapsed ? "-c" : ""}`;
          return (
            <li key={group.label}>
              {collapsed ? (
                index > 0 ? <hr aria-hidden="true" className="mx-2 mb-3 border-line" /> : null
              ) : (
                <p
                  id={headingId}
                  className="mb-2 px-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {group.label}
                </p>
              )}
              <ul aria-label={collapsed ? group.label : undefined} aria-labelledby={collapsed ? undefined : headingId} className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-ui border-l-2 px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "border-brand bg-brand/15 font-semibold text-brand"
                            : "border-transparent text-muted hover:bg-raised hover:text-fg"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-5 shrink-0" />
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
