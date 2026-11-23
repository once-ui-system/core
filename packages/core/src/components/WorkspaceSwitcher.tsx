"use client";

import React, { type ReactNode, useContext, useEffect, useId, useRef, useState } from "react";
import { DEFAULT_BREAKPOINTS } from "../contexts/LayoutProvider.js";
import { SidebarRailContext } from "../internal/sidebarRail.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Avatar } from "./Avatar.js";
import { Button } from "./Button.js";
import { Column } from "./Column.js";
import { Drawer } from "./Drawer.js";
import { Dropdown } from "./Dropdown.js";
import { Icon } from "./Icon.js";
import { Input } from "./Input.js";
import { Option } from "./Option.js";
import { Row } from "./Row.js";
import { Skeleton } from "./Skeleton.js";
import { Text } from "./Text.js";
import styles from "./WorkspaceSwitcher.module.scss";

/** One workspace, organization, venue or site the person can switch to. */
export interface WorkspaceSwitcherItem {
  /** What `onValueChange` hears: a slug or an id. */
  value: string;
  /** Its name. Wraps in the list; the trigger cuts it short. */
  label: string;
  /** A second line: the person's role in it, a plan, "Personal". */
  description?: ReactNode;
  /** A logo. Without one, the avatar shows the name's first letter. */
  src?: string;
  /** Replaces the avatar altogether: a brand mark the app draws itself. */
  prefix?: ReactNode;
  /** The `id` of the group in `groups` it is listed under. */
  group?: string;
  /** Other words the search matches besides the name: a slug, a domain. */
  keywords?: string[];
  disabled?: boolean;
}

/** A heading in the list. Items name it by `id`; groups show in this order. */
export interface WorkspaceSwitcherGroup {
  id: string;
  label: string;
}

export interface WorkspaceSwitcherLabels {
  /** The list's name: the phone sheet's title and the heading of an ungrouped list. Default "Workspaces". */
  title?: string;
  /** The heading over the current item. Default "Current". */
  current?: string;
  /** The search field's placeholder. Default "Search". */
  search?: string;
  /** When the search matches nothing. Default "No matches". */
  noMatch?: string;
  /** When there are no items. Default "None yet". */
  empty?: string;
  /** While `loading` with no items. Default "Loading". */
  loading?: string;
  /** The trigger with nothing current. Default "Choose a workspace". */
  pick?: string;
  /** The create button. Default "New workspace". */
  create?: string;
}

export interface WorkspaceSwitcherProps {
  items: WorkspaceSwitcherItem[];
  /** The current item's `value`. */
  value?: string;
  defaultValue?: string;
  /** A different item was picked. Route to it here. */
  onValueChange?: (value: string) => void;
  /** Headings to group the list under, in order. Items without a known `group` come last, under no heading. */
  groups?: WorkspaceSwitcherGroup[];
  /** The current item on top, under its own heading. Default true. */
  pinCurrent?: boolean;
  /** Each heading shows how many items it holds. Default true. */
  counts?: boolean;
  /** A search field shows above the list once there are more items than this. Default 6; `false` never. */
  searchAbove?: number | false;
  /** The list is still loading: the trigger and the list show placeholders. */
  loading?: boolean;
  /** Shows a create button at the foot of the list, which closes the list and calls this. */
  onCreate?: () => void;
  /** More at the foot of the list, under the create button: a link to settings. */
  footer?: ReactNode;
  /**
   * Replaces the default trigger (the current item's avatar and name, with a
   * chevron). On a phone it is given `onClick`, so it has to take one:
   * a Button or an IconButton does.
   */
  trigger?: ReactNode;
  /**
   * At and below this breakpoint the list opens as a sheet from the bottom of
   * the screen, as wide as the screen, instead of a dropdown under the
   * trigger. Default `"s"`; `false` keeps the dropdown everywhere.
   */
  mobileBelow?: "xs" | "s" | "m" | "l" | false;
  /** The dropdown's minimum width. Default `"20rem"`. */
  minWidth?: number | `${number}rem` | `${number}px`;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Its words, for another language. */
  labels?: WorkspaceSwitcherLabels;
}

const DEFAULT_LABELS: Required<WorkspaceSwitcherLabels> = {
  title: "Workspaces",
  current: "Current",
  search: "Search",
  noMatch: "No matches",
  empty: "None yet",
  loading: "Loading",
  pick: "Choose a workspace",
  create: "New workspace",
};

/** Matches `max-width` the way the `s={{ … }}` classes do. False until mounted. */
function useBelow(key: WorkspaceSwitcherProps["mobileBelow"]) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (!key || typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(`(max-width: ${DEFAULT_BREAKPOINTS[key]}px)`);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [key]);
  return key ? matches : false;
}

const initial = (label: string) => (label.trim().charAt(0) || "?").toUpperCase();

/** The item's mark. Decorative: the name beside it says who it is. */
const mark = (item: WorkspaceSwitcherItem) =>
  item.prefix ??
  (item.src ? (
    <Avatar size="s" src={item.src} aria-hidden />
  ) : (
    <Avatar size="s" value={initial(item.label)} aria-hidden />
  ));

/**
 * Switches between the workspaces, organizations, venues or sites a person
 * belongs to. The trigger shows the current one; the list pins it on top,
 * groups the rest under headings with counts, searches once it is long, and
 * ends with a create button.
 *
 * On a phone (below `mobileBelow`) the list opens as a sheet from the bottom
 * of the screen, near the thumb and as wide as the screen, so long names
 * wrap instead of being cut. Elsewhere it is a dropdown under the trigger, at
 * least 20rem wide. Inside a Sidebar folded to its rail, the trigger is the
 * avatar alone.
 */
function WorkspaceSwitcher({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  groups,
  pinCurrent = true,
  counts = true,
  searchAbove = 6,
  loading = false,
  onCreate,
  footer,
  trigger: triggerProp,
  mobileBelow = "s",
  minWidth = "20rem",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  labels: labelsProp,
}: WorkspaceSwitcherProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useState("");
  const phone = useBelow(mobileBelow);
  const rail = useContext(SidebarRailContext)?.iconsOnly ?? false;
  const searchId = `${useId()}-search`;
  const currentRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) setQuery("");
  };

  const pick = (next: string) => {
    setOpen(false);
    if (next !== value) setValue(next);
  };

  const current = items.find((item) => item.value === value) ?? null;
  const needle = query.trim().toLocaleLowerCase();
  const matches = (item: WorkspaceSwitcherItem) =>
    !needle ||
    item.label.toLocaleLowerCase().includes(needle) ||
    (item.keywords ?? []).some((word) => word.toLocaleLowerCase().includes(needle));

  const rest = items.filter((item) => (!pinCurrent || item !== current) && matches(item));
  const known = new Set((groups ?? []).map((group) => group.id));
  const sections: { key: string; label?: string; items: WorkspaceSwitcherItem[] }[] = [];
  if (pinCurrent && current && matches(current)) {
    sections.push({ key: "current", label: labels.current, items: [current] });
  }
  for (const group of groups ?? []) {
    sections.push({
      key: `group-${group.id}`,
      label: group.label,
      items: rest.filter((item) => item.group === group.id),
    });
  }
  const loose = rest.filter((item) => !item.group || !known.has(item.group));
  // Without groups, the rest sit under the list's own name; after groups,
  // under none.
  sections.push({ key: "rest", label: groups?.length ? undefined : labels.title, items: loose });
  const shown = sections.filter((section) => section.items.length > 0);

  const searchable = searchAbove !== false && items.length > searchAbove;

  const option = (item: WorkspaceSwitcherItem) => {
    const selected = item.value === value;
    return (
      <Option
        key={item.value}
        ref={selected ? currentRef : undefined}
        value={item.value}
        prefix={mark(item)}
        label={
          <Column fillWidth horizontal="start">
            <Text weight="strong" wrap="balance" className={styles.name}>
              {item.label}
            </Text>
            {item.description && (
              <Text onBackground="neutral-weak" textVariant="label-default-xs">
                {item.description}
              </Text>
            )}
          </Column>
        }
        selected={selected}
        disabled={item.disabled}
        suffix={
          selected ? (
            <Icon name="check" size="xs" onBackground="neutral-weak" decorative />
          ) : undefined
        }
        onClick={() => pick(item.value)}
      />
    );
  };

  const note = (text: string) => (
    <Column padding="12">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {text}
      </Text>
    </Column>
  );

  const list = (
    <Column fillWidth gap="2">
      {searchable && (
        <Column fillWidth paddingBottom="8">
          <Input
            id={searchId}
            size="xs"
            placeholder={labels.search}
            aria-label={labels.search}
            prefix={<Icon name="search" size="xs" onBackground="neutral-weak" decorative />}
            value={query}
            onValueChange={setQuery}
          />
        </Column>
      )}
      {items.length === 0 &&
        (loading ? (
          <Column fillWidth gap="8" padding="12" aria-label={labels.loading}>
            <Skeleton shape="line" size="s" width="12rem" />
            <Skeleton shape="line" size="s" width="9rem" />
          </Column>
        ) : (
          note(labels.empty)
        ))}
      {items.length > 0 && shown.length === 0 && note(labels.noMatch)}
      {shown.map((section, index) => {
        const headingId = `${searchId}-${section.key}`;
        return (
          <Column
            key={section.key}
            fillWidth
            gap="2"
            role="group"
            aria-labelledby={section.label ? headingId : undefined}
          >
            {section.label && (
              <Column paddingX="12" paddingTop={index === 0 ? "4" : "16"} paddingBottom="4">
                <Text id={headingId} textVariant="label-default-xs" onBackground="neutral-weak">
                  {counts ? `${section.label} · ${section.items.length}` : section.label}
                </Text>
              </Column>
            )}
            {section.items.map(option)}
          </Column>
        );
      })}
    </Column>
  );

  const foot =
    onCreate || footer ? (
      <Column fillWidth gap="4">
        {onCreate && (
          <Button
            fillWidth
            prefixIcon="plus"
            size="s"
            variant="secondary"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
          >
            {labels.create}
          </Button>
        )}
        {footer}
      </Column>
    ) : null;

  const name = current?.label ?? labels.pick;
  const pending = loading && !current;

  const defaultTrigger = rail ? (
    <Button variant="tertiary" size="m" aria-label={name} className={styles.trigger}>
      {pending ? (
        <Skeleton shape="circle" size="s" />
      ) : current ? (
        mark(current)
      ) : (
        <Avatar size="s" icon="plus" aria-hidden />
      )}
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="m"
      weight="default"
      fillWidth
      horizontal="between"
      suffixIcon="chevronDown"
      className={styles.trigger}
    >
      {/* Placeholders the size of the mark and name while the list loads, so
          nothing around the switcher moves. */}
      <Row fillWidth vertical="center" horizontal="start" gap="12" className={styles.current}>
        {pending ? (
          <>
            <Skeleton shape="circle" size="s" />
            <Skeleton shape="line" size="s" width="7rem" />
          </>
        ) : (
          <>
            {current ? mark(current) : <Avatar size="s" icon="plus" aria-hidden />}
            <Text textVariant="label-strong-s" align="left" truncate>
              {name}
            </Text>
          </>
        )}
      </Row>
    </Button>
  );

  const trigger = triggerProp ?? defaultTrigger;

  if (phone) {
    const opener = React.isValidElement<{ onClick?: (event: React.MouseEvent) => void }>(trigger)
      ? React.cloneElement(trigger, {
          onClick: (event: React.MouseEvent) => {
            trigger.props.onClick?.(event);
            setOpen(true);
          },
          "aria-haspopup": "dialog",
          "aria-expanded": open,
        } as Record<string, unknown>)
      : trigger;
    return (
      <>
        {opener}
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="bottom"
          size="l"
          title={labels.title}
          footer={foot ?? undefined}
          // The current item, not the search: focusing a field on a phone
          // raises the keyboard over the list.
          initialFocusRef={currentRef}
        >
          <Column fillWidth role="listbox" aria-label={labels.title}>
            {list}
          </Column>
        </Drawer>
      </>
    );
  }

  return (
    <Dropdown
      fillWidth={!rail}
      minWidth={minWidth}
      open={open}
      onOpenChange={setOpen}
      placement={rail ? "right-start" : "bottom-start"}
      trigger={trigger}
    >
      <Column fillWidth padding="4" gap="8">
        {/* About ten items show at once; a longer list scrolls under the search. */}
        <Column fillWidth maxHeight="32rem" overflowY="auto">
          {list}
        </Column>
        {foot && (
          <Column fillWidth paddingX="4" paddingBottom="4">
            {foot}
          </Column>
        )}
      </Column>
    </Dropdown>
  );
}

WorkspaceSwitcher.displayName = "WorkspaceSwitcher";

export { WorkspaceSwitcher };
