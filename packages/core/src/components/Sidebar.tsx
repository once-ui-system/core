"use client";

import classNames from "clsx";
import type React from "react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_BREAKPOINTS } from "../contexts/LayoutProvider.js";
import { useHotkeys } from "../hooks/useHotkeys.js";
import type { IconName } from "../icons.js";
import { isApplePlatform, labelCombo } from "../internal/hotkeys.js";
import { SidebarRailContext } from "../internal/sidebarRail.js";
import { useControllableState } from "../internal/useControllableState.js";
import { useHoverExpand } from "../internal/useHoverExpand.js";
import { serializeSidebarCookie, sidebarCookieName } from "../utils/sidebarCookie.js";
import { Column } from "./Column.js";
import { Drawer } from "./Drawer.js";
import { IconButton } from "./IconButton.js";
import styles from "./Sidebar.module.scss";

/** How far past the minimum width a drag has to go before it folds the sidebar away. */
const SNAP = 48;
/** One arrow-key step on the resize handle, and one with Shift. */
const STEP = 8;
const STEP_LARGE = 32;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SidebarCollapsible = "rail" | "offcanvas" | false;

interface SidebarContextValue {
  /** Folded away: an icon rail, or gone, by the Sidebar's `collapsible`. */
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  /** Fold or unfold it; on a phone, open or close the drawer instead. */
  toggle: () => void;
  /** The open width in pixels. */
  width: number;
  setWidth: (next: number) => void;
  /** Back to `defaultWidth`, open. */
  reset: () => void;
  minWidth: number;
  maxWidth: number;
  /** The screen is below `mobileBelow`: the sidebar is a drawer. */
  mobile: boolean;
  /** The phone drawer is open. */
  mobileOpen: boolean;
  setMobileOpen: (next: boolean) => void;
  /** The `shortcut` that toggles it, or false. */
  shortcut: string | false;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * The sidebar's state, for a control outside it: a toggle in the top bar, a
 * page that wants more room. Throws outside a SidebarProvider (or a Sidebar,
 * which makes its own).
 */
function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebar must be used inside a SidebarProvider or a Sidebar. Wrap the layout that holds the sidebar and its toggle in <SidebarProvider>.",
    );
  }
  return context;
}

interface SidebarProviderOptions {
  /** The open width in pixels to start from, such as a saved one. Default 256. */
  defaultWidth?: number;
  /** The open width, when the host owns it. */
  width?: number;
  /** Called once a resize ends, with the new width. */
  onWidthChange?: (width: number) => void;
  /** Start folded away. */
  defaultCollapsed?: boolean;
  /** Folded away, when the host owns it. */
  collapsed?: boolean;
  /** Called with the state it moves to: `true` when it folds away. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The narrowest a drag can make it, in pixels. Default 200. */
  minWidth?: number;
  /** The widest a drag can make it, in pixels. Default 400. */
  maxWidth?: number;
  /**
   * Keep the width and collapse in a cookie under this key, so they survive a
   * reload. Read it back on the server (`parseSidebarCookie` on the cookie
   * named `sidebarCookieName(key)`) and pass it as the defaults, and the
   * first paint is already right.
   */
  persist?: string;
  /** The key that folds and unfolds it. Default `"mod+b"` (⌘B, Ctrl+B); `false` for none. */
  shortcut?: string | false;
  /** Below this breakpoint the sidebar becomes a drawer. Default `"s"`; `false` never. */
  mobileBelow?: "xs" | "s" | "m" | "l" | false;
}

interface SidebarProviderProps extends SidebarProviderOptions {
  children?: ReactNode;
}

const clampWidth = (value: number, min: number, max: number) =>
  Math.round(Math.max(min, Math.min(max, value)));

function useMaxWidth(key: SidebarProviderOptions["mobileBelow"]) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (!key || typeof window === "undefined" || !window.matchMedia) return;
    // The same edge as the `s={{ hide: true }}` classes: max-width, inclusive.
    const query = window.matchMedia(`(max-width: ${DEFAULT_BREAKPOINTS[key]}px)`);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [key]);
  return key ? matches : false;
}

/**
 * Holds a sidebar's width and collapse, for the Sidebar and for anything
 * outside it that toggles it (a SidebarTrigger in the top bar, ⌘B). Put it
 * around the layout that holds both. A Sidebar on its own makes its own.
 */
function SidebarProvider({
  children,
  defaultWidth = 256,
  width: widthProp,
  onWidthChange,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  minWidth = 200,
  maxWidth = 400,
  persist,
  shortcut = "mod+b",
  mobileBelow = "s",
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useControllableState({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });
  const [width, setWidthState] = useControllableState({
    value: widthProp,
    defaultValue: clampWidth(defaultWidth, minWidth, maxWidth),
    onChange: onWidthChange,
  });
  const mobile = useMaxWidth(mobileBelow);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobile) setMobileOpen(false);
  }, [mobile]);

  const setWidth = useCallback(
    (next: number) => setWidthState(clampWidth(next, minWidth, maxWidth)),
    [setWidthState, minWidth, maxWidth],
  );

  const toggle = useCallback(() => {
    if (mobile) setMobileOpen((open) => !open);
    else setCollapsed((value) => !value);
  }, [mobile, setCollapsed]);

  const reset = useCallback(() => {
    setWidth(defaultWidth);
    setCollapsed(false);
  }, [setWidth, setCollapsed, defaultWidth]);

  // Written on every change after the first render, never on mount, so a
  // render with the defaults cannot overwrite what the person chose.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!persist || typeof document === "undefined") return;
    // biome-ignore lint/suspicious/noDocumentCookie: the server reads this cookie for the first paint; the Cookie Store API is not in Safari or Firefox.
    document.cookie = `${sidebarCookieName(persist)}=${serializeSidebarCookie({ width, collapsed })}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }, [persist, width, collapsed]);

  useHotkeys(shortcut || "", toggle, { enabled: Boolean(shortcut), preventDefault: true });

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggle,
      width,
      setWidth,
      reset,
      minWidth,
      maxWidth,
      mobile,
      mobileOpen,
      setMobileOpen,
      shortcut,
    }),
    [
      collapsed,
      setCollapsed,
      toggle,
      width,
      setWidth,
      reset,
      minWidth,
      maxWidth,
      mobile,
      mobileOpen,
      shortcut,
    ],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

SidebarProvider.displayName = "SidebarProvider";

interface SidebarProps
  extends Omit<React.ComponentProps<typeof Column>, "width" | "minWidth" | "maxWidth">,
    SidebarProviderOptions {
  /**
   * What folding it away does. `"rail"` (the default) narrows it to its icons;
   * a Nav inside drops its labels and its groups open as menus. `"offcanvas"`
   * slides it out entirely. `false` keeps it open.
   */
  collapsible?: SidebarCollapsible;
  /** A handle on its edge that drags the width, and folds it past the minimum. Default true. */
  resizable?: boolean;
  /**
   * As an icon rail, open over the page, labels and all, while a mouse rests
   * on it or the keyboard is in it. The page beside it does not move. Touch
   * never opens it.
   */
  expandOnHover?: boolean;
  /**
   * The rail's width in pixels. Left out, it fits the Nav inside: 52 for a
   * compact Nav, 80 for a normal or spacious one, so the icons sit centred.
   */
  railWidth?: number;
  /** Its words, for another language. */
  labels?: { resize?: string; menu?: string };
}

/**
 * A resizable app sidebar that folds into an icon rail.
 *
 * Compose it from SidebarHeader (a workspace switcher), SidebarContent (a
 * Nav, which scrolls) and SidebarFooter (the account), and put a
 * SidebarTrigger wherever the toggle belongs. Drag its edge to resize it, and
 * past the minimum to fold it; double-click the edge to reset it. ⌘B / Ctrl+B
 * folds it from anywhere outside a text field. Below `mobileBelow` it is a
 * drawer that the trigger opens.
 *
 * Inside a SidebarProvider it shares that state; on its own it makes one from
 * the provider props it is given (`defaultWidth`, `persist` and the rest).
 */
function Sidebar(props: SidebarProps) {
  const context = useContext(SidebarContext);
  if (context) return <SidebarFrame {...props} />;
  const {
    defaultWidth,
    width,
    onWidthChange,
    defaultCollapsed,
    collapsed,
    onCollapsedChange,
    minWidth,
    maxWidth,
    persist,
    shortcut,
    mobileBelow,
    ...rest
  } = props;
  return (
    <SidebarProvider
      defaultWidth={defaultWidth}
      width={width}
      onWidthChange={onWidthChange}
      defaultCollapsed={defaultCollapsed}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      minWidth={minWidth}
      maxWidth={maxWidth}
      persist={persist}
      shortcut={shortcut}
      mobileBelow={mobileBelow}
    >
      <SidebarFrame {...rest} />
    </SidebarProvider>
  );
}

Sidebar.displayName = "Sidebar";

function SidebarFrame({
  collapsible = "rail",
  resizable = true,
  expandOnHover = false,
  railWidth,
  labels,
  children,
  className,
  style,
  // Provider options are the provider's; inside one they do nothing here.
  defaultWidth: _defaultWidth,
  width: _width,
  onWidthChange: _onWidthChange,
  defaultCollapsed: _defaultCollapsed,
  collapsed: _collapsed,
  onCollapsedChange: _onCollapsedChange,
  minWidth: _minWidth,
  maxWidth: _maxWidth,
  persist: _persist,
  shortcut: _shortcut,
  mobileBelow: _mobileBelow,
  ...column
}: SidebarProps) {
  const sidebar = useSidebar();
  const {
    collapsed: folded,
    setCollapsed,
    width,
    setWidth,
    reset,
    minWidth,
    maxWidth,
    mobile,
    mobileOpen,
    setMobileOpen,
  } = sidebar;
  const collapsed = collapsible !== false && folded;

  // While dragging, the width follows the pointer here and is committed once,
  // on release, so onWidthChange and the cookie hear one change, not hundreds.
  const [drag, setDrag] = useState<{ width: number; collapsed: boolean } | null>(null);
  const live = drag ?? { width, collapsed };
  const resizing = drag !== null;

  const { expanded: peeking, handlers } = useHoverExpand<HTMLDivElement>(
    collapsible === "rail" && live.collapsed && expandOnHover && !resizing && !mobile,
    {},
  );
  const iconsOnly = collapsible === "rail" && live.collapsed && !peeking;
  const state =
    collapsible === "rail" && live.collapsed
      ? "rail"
      : collapsible === "offcanvas" && live.collapsed
        ? "hidden"
        : "open";

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture?.(event.pointerId);
    const startX = event.clientX;
    const panel = handle.parentElement;
    // From what is on screen: the rail's own width when folded.
    const startWidth = collapsed ? (panel?.getBoundingClientRect().width ?? 0) : width;
    let next = { width, collapsed };
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    setDrag(next);

    const move = (moveEvent: PointerEvent) => {
      const raw = startWidth + (moveEvent.clientX - startX);
      next =
        collapsible !== false && raw < minWidth - SNAP
          ? { width, collapsed: true }
          : { width: clampWidth(raw, minWidth, maxWidth), collapsed: false };
      setDrag(next);
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
      setDrag(null);
      if (next.width !== width) setWidth(next.width);
      if (next.collapsed !== collapsed) setCollapsed(next.collapsed);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? STEP_LARGE : STEP;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (collapsed) return;
        if (collapsible !== false && width - step < minWidth) setCollapsed(true);
        else setWidth(width - step);
        return;
      case "ArrowRight":
        event.preventDefault();
        if (collapsed) setCollapsed(false);
        else setWidth(width + step);
        return;
      case "Home":
        event.preventDefault();
        setCollapsed(false);
        setWidth(minWidth);
        return;
      case "End":
        event.preventDefault();
        setCollapsed(false);
        setWidth(maxWidth);
        return;
      case "Enter":
        if (collapsible === false) return;
        event.preventDefault();
        setCollapsed(!collapsed);
        return;
    }
  };

  const frameStyle = {
    "--sidebar-width": `${live.width}px`,
    ...(railWidth !== undefined ? { "--sidebar-rail-width": `${railWidth}px` } : {}),
    ...style,
  } as React.CSSProperties;

  const menuLabel = labels?.menu ?? "Menu";

  if (mobile) {
    // A drawer the trigger opens. Following a link in it closes it.
    return (
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        size="s"
        title={menuLabel}
        flush
      >
        <SidebarRailContext.Provider value={{ iconsOnly: false }}>
          <Column
            fill
            onClickCapture={(event: React.MouseEvent<HTMLDivElement>) => {
              if ((event.target as HTMLElement).closest?.("a[href]")) setMobileOpen(false);
            }}
          >
            {children}
          </Column>
        </SidebarRailContext.Provider>
      </Drawer>
    );
  }

  return (
    <Column
      as="aside"
      fillHeight
      data-state={state}
      data-resizing={resizing ? "" : undefined}
      className={classNames(styles.sidebar, className)}
      style={frameStyle}
      {...column}
    >
      <Column
        className={styles.panel}
        data-icons={iconsOnly ? "" : undefined}
        data-peek={peeking ? "" : undefined}
        // Folded off the canvas, nothing in it is reachable.
        inert={state === "hidden" ? true : undefined}
        {...handlers}
      >
        <SidebarRailContext.Provider value={{ iconsOnly }}>{children}</SidebarRailContext.Provider>
        {resizable && state !== "hidden" && (
          // biome-ignore lint/a11y/useSemanticElements: a focusable separator is the ARIA pattern for a splitter; <hr> cannot take focus.
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label={labels?.resize ?? "Resize sidebar"}
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
            aria-valuenow={live.collapsed ? 0 : live.width}
            aria-valuetext={live.collapsed ? "Collapsed" : `${live.width} pixels`}
            className={styles.handle}
            onPointerDown={onPointerDown}
            onDoubleClick={reset}
            onKeyDown={onKeyDown}
          />
        )}
      </Column>
    </Column>
  );
}

/** The top of a Sidebar: a workspace switcher, a logo. It does not scroll. */
function SidebarHeader({ className, ...column }: React.ComponentProps<typeof Column>) {
  return (
    <Column
      fillWidth
      padding="8"
      gap="4"
      className={classNames(styles.edge, className)}
      {...column}
    />
  );
}

SidebarHeader.displayName = "SidebarHeader";

/** The middle of a Sidebar, usually a Nav. It takes the space left and scrolls on its own. */
function SidebarContent({ className, ...column }: React.ComponentProps<typeof Column>) {
  return (
    <Column
      fillWidth
      flex={1}
      paddingX="8"
      paddingY="4"
      gap="4"
      className={classNames(styles.content, className)}
      {...column}
    />
  );
}

SidebarContent.displayName = "SidebarContent";

/** The bottom of a Sidebar: the account, help, a feedback link. It does not scroll. */
function SidebarFooter({ className, ...column }: React.ComponentProps<typeof Column>) {
  return (
    <Column
      fillWidth
      padding="8"
      gap="4"
      className={classNames(styles.edge, className)}
      {...column}
    />
  );
}

SidebarFooter.displayName = "SidebarFooter";

/** `mod+b` as aria-keyshortcuts spells it: `Meta+B` on Apple platforms, `Control+B` elsewhere. */
function ariaShortcut(source: string, apple: boolean) {
  return source
    .split("+")
    .map((part) => {
      const key = part.trim().toLowerCase();
      if (key === "mod") return apple ? "Meta" : "Control";
      if (key === "ctrl") return "Control";
      if (key === "cmd" || key === "meta") return "Meta";
      if (key === "alt" || key === "option") return "Alt";
      if (key === "shift") return "Shift";
      return key.length === 1 ? key.toUpperCase() : key;
    })
    .join("+");
}

interface SidebarTriggerProps {
  /** Overrides the icon, which otherwise follows the state (chevrons, a menu on phones). */
  icon?: IconName;
  /** Overrides the tooltip, which otherwise names the action and its shortcut. */
  tooltip?: ReactNode;
  size?: React.ComponentProps<typeof IconButton>["size"];
  variant?: React.ComponentProps<typeof IconButton>["variant"];
  className?: string;
  style?: React.CSSProperties;
  /** Runs before the toggle; call `event.preventDefault()` to stop it. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Its words, for another language. */
  labels?: { collapse?: string; expand?: string; menu?: string };
}

/**
 * The button that folds the sidebar and opens it again, or opens the drawer
 * on a phone. Put it in the top bar or in the SidebarHeader. Its tooltip
 * names the shortcut.
 */
function SidebarTrigger({
  labels,
  onClick,
  icon,
  tooltip,
  variant = "tertiary",
  ...button
}: SidebarTriggerProps) {
  const { collapsed, toggle, mobile, mobileOpen, shortcut } = useSidebar();
  const [apple, setApple] = useState(false);
  useEffect(() => setApple(isApplePlatform()), []);
  const label = mobile
    ? (labels?.menu ?? "Open menu")
    : collapsed
      ? (labels?.expand ?? "Expand sidebar")
      : (labels?.collapse ?? "Collapse sidebar");
  const keys = shortcut ? labelCombo(shortcut, apple) : [];
  const hint = keys.length ? ` (${keys.map((k) => k.cap).join(apple ? "" : "+")})` : "";
  return (
    <IconButton
      variant={variant}
      icon={icon ?? (mobile ? "menu" : collapsed ? "chevronDoubleRight" : "chevronDoubleLeft")}
      tooltip={tooltip ?? `${label}${hint}`}
      aria-label={label}
      aria-expanded={mobile ? mobileOpen : !collapsed}
      aria-keyshortcuts={shortcut && !mobile ? ariaShortcut(shortcut, apple) : undefined}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...button}
    />
  );
}

SidebarTrigger.displayName = "SidebarTrigger";

export type {
  SidebarCollapsible,
  SidebarContextValue,
  SidebarProps,
  SidebarProviderOptions,
  SidebarProviderProps,
  SidebarTriggerProps,
};
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
