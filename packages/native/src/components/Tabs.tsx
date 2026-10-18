import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { Column, type FlexProps, Row } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";
import { ToggleButton, type ToggleButtonProps } from "./ToggleButton";
import { useControlledValue } from "./useControllable";

interface TabsContextValue {
  baseId: string;
  value: string | undefined;
  orientation: "horizontal" | "vertical";
  select: (value: string) => void;
  /** Uncontrolled with no `defaultValue`: the first enabled tab becomes the selection. */
  adopt: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  return context;
}

// `nativeID`s, so a panel can name the tab that labels it.
const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${encodeURIComponent(value)}`;

export interface TabsProps extends FlexProps {
  /** The selected tab's `value`, when the host owns the state. Pair with `onChange`. */
  value?: string;
  /** The tab selected first when Tabs keeps its own state; without it, the first enabled tab. */
  defaultValue?: string;
  /** Called with the newly selected tab's `value`. Not called for the tab already selected. */
  onChange?: (value: string) => void;
  /** `vertical` lays the list out beside the panels, as a settings screen does. */
  orientation?: "horizontal" | "vertical";
  /** Accepted for core's API; it is about arrow keys, which a touch screen does not have. */
  activation?: "automatic" | "manual";
  children?: ReactNode;
}

/**
 * Core's `Tabs`: one `TabList` of `Tab`s and a `TabPanel` per tab, matched by
 * `value`. A Column (a Row when `vertical`) that takes every Flex prop.
 */
export const Tabs: RefComponent<TabsProps, ViewRef> = forwardRef<ViewRef, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onChange,
    orientation = "horizontal",
    activation: _activation,
    children,
    ...flex
  },
  ref,
) {
  const baseId = useId();
  const [chosen, setChosen] = useControlledValue<string | undefined>(value, defaultValue, (v) => {
    if (v !== undefined) onChange?.(v);
  });
  const [first, setFirst] = useState<string>();
  const current = chosen ?? (value === undefined ? first : undefined);

  const context: TabsContextValue = {
    baseId,
    value: current,
    orientation,
    select: (next) => {
      if (next !== current) setChosen(next);
    },
    adopt: (next) => setFirst((previous) => previous ?? next),
  };

  const Layout = orientation === "vertical" ? Row : Column;
  return (
    <TabsContext.Provider value={context}>
      <Layout ref={ref} fillWidth gap="16" {...flex}>
        {children}
      </Layout>
    </TabsContext.Provider>
  );
});

export interface TabListProps extends FlexProps {
  /** The `Tab`s. Name the list with `aria-label` when nothing on screen labels it. */
  children?: ReactNode;
}

/** The row (a column when `vertical`) of tabs. */
export const TabList: RefComponent<TabListProps, ViewRef> = forwardRef<ViewRef, TabListProps>(
  function TabList({ children, ...flex }, ref) {
    const { orientation } = useTabs("TabList");
    const Layout = orientation === "vertical" ? Column : Row;
    return (
      <Layout ref={ref} accessibilityRole="tablist" gap="4" {...flex}>
        {children}
      </Layout>
    );
  },
);

export interface TabProps extends Omit<ToggleButtonProps, "selected"> {
  /** Matches the `TabPanel` this tab shows, and is what `onChange` reports. */
  value: string;
  /** A disabled tab stays visible and cannot be picked. */
  disabled?: boolean;
}

/**
 * One tab: a `ToggleButton` with the `tab` role, so it takes every ToggleButton
 * prop. The selected one is highlighted as a selected ToggleButton is. In a
 * vertical list it fills the width with its label at the start.
 */
export const Tab: RefComponent<TabProps, ViewRef> = forwardRef<ViewRef, TabProps>(function Tab(
  { value, disabled = false, fillWidth, horizontal, onPress, onClick, ...rest },
  ref,
) {
  const { baseId, value: selectedValue, orientation, select, adopt } = useTabs("Tab");
  const selected = selectedValue === value;
  const vertical = orientation === "vertical";

  // Effects run in render order, so the first enabled tab is the one adopted.
  useEffect(() => {
    if (!disabled) adopt(value);
  }, [adopt, disabled, value]);

  return (
    <ToggleButton
      fillWidth={fillWidth ?? vertical}
      horizontal={horizontal ?? (vertical ? "start" : "center")}
      {...rest}
      ref={ref}
      accessibilityRole="tab"
      nativeID={idFor(baseId, "tab", value)}
      selected={selected}
      disabled={disabled}
      onPress={(e) => {
        onPress?.(e);
        onClick?.();
        select(value);
      }}
    />
  );
});

export interface TabPanelProps extends FlexProps {
  /** The `value` of the `Tab` that shows this panel. */
  value: string;
  /**
   * Keep the content mounted, hidden, while another tab is selected, so a
   * form's unsaved input survives. By default an unselected panel renders nothing.
   */
  keepMounted?: boolean;
  children?: ReactNode;
}

/** The content for one tab, labelled by its tab for screen readers. */
export const TabPanel: RefComponent<TabPanelProps, ViewRef> = forwardRef<ViewRef, TabPanelProps>(
  function TabPanel({ value, keepMounted = false, children, style, ...flex }, ref) {
    const { baseId, value: selectedValue, orientation } = useTabs("TabPanel");
    const selected = selectedValue === value;
    if (!selected && !keepMounted) return null;
    const own = Array.isArray(style) ? style : style ? [style] : [];
    // Beside a vertical list the panel takes the rest of the row, not all of it.
    const vertical = orientation === "vertical";
    return (
      <Column
        ref={ref}
        role="tabpanel"
        nativeID={idFor(baseId, "panel", value)}
        aria-labelledby={idFor(baseId, "tab", value)}
        aria-hidden={!selected}
        fillWidth={!vertical}
        flex={vertical ? 1 : undefined}
        {...flex}
        style={selected ? own : [...own, { display: "none" }]}
      >
        {children}
      </Column>
    );
  },
);
