"use client";

import type React from "react";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { ToggleButton, type ToggleButtonProps } from "./ToggleButton.js";

// Written out on the props rather than as aliases, so the generated spec, the
// docs' props table and an agent all see the values.
type TabsOrientation = NonNullable<TabsProps["orientation"]>;
type TabsActivation = NonNullable<TabsProps["activation"]>;

interface TabsContextValue {
  baseId: string;
  value: string | undefined;
  controlled: boolean;
  orientation: TabsOrientation;
  activation: TabsActivation;
  select: (value: string) => void;
  /** Uncontrolled with no `defaultValue`: the first tab becomes the selection. */
  adopt: (value: string) => void;
  /** Values that have a TabPanel mounted, so a tab only points at a panel that exists. */
  panels: ReadonlySet<string>;
  registerPanel: (value: string) => () => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

/** The tab that takes Tab-key focus when no enabled tab is selected. */
const TabListContext = createContext<string | null>(null);

const useTabsContext = (component: string) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return context;
};

// Layout effects warn during a server render; the tab list only needs one in the browser.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Ids are an IDREF list in `aria-controls`, so a value with a space must not split. */
const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${encodeURIComponent(value)}`;

/** This list's own enabled tabs, in DOM order; a nested Tabs inside a panel is not ours. */
const enabledTabs = (list: HTMLElement): HTMLElement[] =>
  Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
    (tab) =>
      tab.closest('[role="tablist"]') === list &&
      !tab.hasAttribute("disabled") &&
      tab.getAttribute("aria-disabled") !== "true",
  );

interface TabsProps extends Omit<React.ComponentProps<typeof Column>, "onChange" | "defaultValue"> {
  /** The selected tab's `value`, when the host owns the state. Pair with `onValueChange`. */
  value?: string;
  /**
   * The tab selected first when Tabs manages its own state. Without it the
   * first enabled tab is selected once the list mounts; pass it when the page
   * renders on the server, so the right panel is in the first paint.
   */
  defaultValue?: string;
  /** Called with the newly selected tab's `value`. Not called for the tab already selected. */
  onValueChange?: (value: string) => void;
  /**
   * Which arrow keys move between tabs: Left and Right for `horizontal`, Up and
   * Down for `vertical`. Also lays the list out beside the panels instead of above them.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * `automatic` selects a tab as soon as the arrow keys focus it. `manual` only
   * moves focus, and Enter or Space selects: use it when showing a panel is
   * slow, such as one that fetches.
   */
  activation?: "automatic" | "manual";
  /** A TabList and its TabPanels, in any layout. */
  children?: ReactNode;
}

/**
 * Tabs: one TabList of Tab buttons, and a TabPanel per tab, matched by `value`.
 *
 * The parts are separate components so the list and the panels can sit in any
 * layout, as a settings page with the list beside its content and above it on a
 * phone does. Tabs itself is a Column (a Row when `vertical`) that takes every
 * Flex prop.
 *
 * Roles, `aria-selected`, `aria-controls` and `aria-labelledby` are wired up,
 * focus roves through the list with the arrow keys, Home and End, and only the
 * selected tab is in the page's Tab order.
 */
const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      activation = "automatic",
      children,
      ...flex
    },
    ref,
  ) => {
    const baseId = useId();
    const controlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue);
    const current = controlled ? value : uncontrolled;
    const [panels, setPanels] = useState<ReadonlySet<string>>(() => new Set());

    const select = useCallback(
      (next: string) => {
        if (next === current) return;
        if (!controlled) setUncontrolled(next);
        onValueChange?.(next);
      },
      [current, controlled, onValueChange],
    );

    const adopt = useCallback(
      (next: string) => {
        if (!controlled) setUncontrolled((previous) => previous ?? next);
      },
      [controlled],
    );

    const registerPanel = useCallback((panel: string) => {
      setPanels((previous) => new Set(previous).add(panel));
      return () =>
        setPanels((previous) => {
          const remaining = new Set(previous);
          remaining.delete(panel);
          return remaining;
        });
    }, []);

    const context = useMemo<TabsContextValue>(
      () => ({
        baseId,
        value: current,
        controlled,
        orientation,
        activation,
        select,
        adopt,
        panels,
        registerPanel,
      }),
      [baseId, current, controlled, orientation, activation, select, adopt, panels, registerPanel],
    );

    const Layout = orientation === "vertical" ? Row : Column;

    return (
      <TabsContext.Provider value={context}>
        <Layout ref={ref} fillWidth gap="16" {...flex}>
          {children}
        </Layout>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

interface TabListProps extends React.ComponentProps<typeof Row> {
  /** The Tab buttons. Name the list with `aria-label` when nothing on the page labels it. */
  children?: ReactNode;
}

/**
 * The row (or, when `vertical`, column) of tabs. Handles the arrow keys, Home
 * and End, and keeps exactly one tab in the page's Tab order.
 */
const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ children, onKeyDown, ...flex }, ref) => {
    const { value, controlled, orientation, activation, select, adopt } = useTabsContext("TabList");
    const listRef = useRef<HTMLDivElement | null>(null);
    const [fallback, setFallback] = useState<string | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Exactly one tab must be reachable with the Tab key. That is the selected
    // one, unless nothing is selected yet or the selected tab is disabled: then
    // it is the first enabled tab. Uncontrolled Tabs with no default adopt that
    // tab as the selection, which is the first tab a reader sees.
    useIsomorphicLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const tabs = enabledTabs(list);
      const reachable = tabs.some((tab) => tab.getAttribute("aria-selected") === "true");
      const first = tabs[0]?.dataset.value ?? null;
      if (!reachable && value === undefined && !controlled && first !== null) {
        adopt(first);
        return;
      }
      const next = reachable ? null : first;
      if (next !== fallback) setFallback(next);
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      const list = listRef.current;
      if (event.defaultPrevented || !list) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const tabs = enabledTabs(list);
      const index = tabs.indexOf(event.target as HTMLElement);
      if (index === -1) return;

      const vertical = orientation === "vertical";
      const rtl = !vertical && list.closest("[dir]")?.getAttribute("dir") === "rtl";
      const previousKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
      const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";

      let target: number;
      switch (event.key) {
        case previousKey:
          target = (index - 1 + tabs.length) % tabs.length;
          break;
        case nextKey:
          target = (index + 1) % tabs.length;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = tabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const tab = tabs[target];
      tab.focus();
      const tabValue = tab.dataset.value;
      if (activation === "automatic" && tabValue !== undefined) select(tabValue);
    };

    const Layout = orientation === "vertical" ? Column : Row;

    return (
      <TabListContext.Provider value={fallback}>
        <Layout
          ref={setRefs}
          gap="4"
          role="tablist"
          aria-orientation={orientation}
          onKeyDown={handleKeyDown}
          {...flex}
        >
          {children}
        </Layout>
      </TabListContext.Provider>
    );
  },
);

TabList.displayName = "TabList";

interface TabProps extends Omit<ToggleButtonProps, "selected" | "value" | "role" | "href"> {
  /** Matches the TabPanel this tab shows, and is what `onValueChange` reports. */
  value: string;
  /** The tab's text. `label` works too, as on ToggleButton. */
  children?: ReactNode;
  /** A disabled tab stays visible and is skipped by the arrow keys. */
  disabled?: boolean;
}

/**
 * One tab: a ToggleButton with the `tab` role, so it takes every ToggleButton
 * prop (`prefixIcon`, `size`, `variant`…). In a vertical list it fills the
 * width and aligns its label to the start, as a settings sidebar does.
 */
const Tab = forwardRef<HTMLElement, TabProps>(
  ({ value, onClick, disabled = false, fillWidth, horizontal, ...rest }, ref) => {
    const { baseId, value: selectedValue, orientation, select, panels } = useTabsContext("Tab");
    const fallback = useContext(TabListContext);
    const selected = selectedValue === value;
    const vertical = orientation === "vertical";
    const reachable = (selected && !disabled) || fallback === value;

    return (
      <ToggleButton
        fillWidth={fillWidth ?? vertical}
        horizontal={horizontal ?? (vertical ? "start" : "center")}
        {...rest}
        ref={ref}
        type="button"
        role="tab"
        id={idFor(baseId, "tab", value)}
        data-value={value}
        aria-selected={selected}
        aria-controls={panels.has(value) ? idFor(baseId, "panel", value) : undefined}
        tabIndex={reachable ? 0 : -1}
        selected={selected}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) select(value);
        }}
      />
    );
  },
);

Tab.displayName = "Tab";

interface TabPanelProps extends React.ComponentProps<typeof Column> {
  /** The `value` of the Tab that shows this panel. */
  value: string;
  /**
   * Keep the content mounted while another tab is selected, hidden. Use it to
   * keep a form's unsaved input or a player's position; by default an
   * unselected panel renders nothing, so its effects stop.
   */
  keepMounted?: boolean;
  children?: ReactNode;
}

/**
 * The content for one tab. It is labelled by its tab and focusable, so a
 * keyboard user can reach a panel with no controls of its own and a screen
 * reader announces which tab it belongs to.
 */
const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, keepMounted = false, children, ...flex }, ref) => {
    const { baseId, value: selectedValue, registerPanel } = useTabsContext("TabPanel");
    const selected = selectedValue === value;

    useEffect(() => registerPanel(value), [registerPanel, value]);

    return (
      <Column
        fillWidth
        {...flex}
        ref={ref}
        role="tabpanel"
        id={idFor(baseId, "panel", value)}
        aria-labelledby={idFor(baseId, "tab", value)}
        tabIndex={0}
        hidden={!selected}
        hide={!selected}
      >
        {selected || keepMounted ? children : null}
      </Column>
    );
  },
);

TabPanel.displayName = "TabPanel";

export type { TabListProps, TabPanelProps, TabProps, TabsActivation, TabsOrientation, TabsProps };
export { Tab, TabList, TabPanel, Tabs };
