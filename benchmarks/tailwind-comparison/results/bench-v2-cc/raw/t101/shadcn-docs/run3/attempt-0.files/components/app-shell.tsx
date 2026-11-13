"use client";

import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "14rem",
          "--sidebar-width-icon": "2.75rem",
        } as React.CSSProperties
      }
    >
      <a
        href="#content"
        className="sr-only z-50 rounded-sm bg-primary px-3 py-1.5 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div id="content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 p-4 outline-none md:p-5">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
