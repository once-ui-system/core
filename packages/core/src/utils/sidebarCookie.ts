/**
 * The cookie a persisted Sidebar keeps its width and collapse in.
 *
 * A cookie, not localStorage, so the server can read it and render the
 * sidebar at the right width on the first paint, instead of rendering the
 * default and jumping once the browser has looked. No `"use client"` here:
 * a server layout calls `parseSidebarCookie` on the request's cookie and
 * passes the result to SidebarProvider.
 */

export interface SidebarCookieState {
  /** The width the person dragged it to, in pixels. */
  width?: number;
  /** Whether they folded it away. */
  collapsed?: boolean;
}

/** The cookie name for a `persist` key: `once-ui-sidebar-<key>`. */
export function sidebarCookieName(key: string): string {
  return `once-ui-sidebar-${key.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

/** `"280:1"`: the width in whole pixels, then 1 when collapsed and 0 when open. */
export function serializeSidebarCookie(state: { width: number; collapsed: boolean }): string {
  return `${Math.round(state.width)}:${state.collapsed ? 1 : 0}`;
}

/**
 * What a sidebar cookie says, or an empty object when there is none or it
 * cannot be read. Each field is left out when it is missing or malformed, so
 * the provider falls back to its own default for it.
 *
 * ```tsx
 * const store = await cookies();
 * const saved = parseSidebarCookie(store.get(sidebarCookieName("app"))?.value);
 * <SidebarProvider persist="app" defaultWidth={saved.width} defaultCollapsed={saved.collapsed}>
 * ```
 */
export function parseSidebarCookie(value: string | null | undefined): SidebarCookieState {
  if (!value) return {};
  const [rawWidth, rawCollapsed] = decodeURIComponent(value).split(":");
  const state: SidebarCookieState = {};
  const width = Number(rawWidth);
  if (rawWidth && Number.isFinite(width) && width > 0 && width < 4096) state.width = width;
  if (rawCollapsed === "1") state.collapsed = true;
  else if (rawCollapsed === "0") state.collapsed = false;
  return state;
}
