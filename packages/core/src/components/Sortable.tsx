"use client";

import classNames from "clsx";
import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "../internal/labels.js";
import {
  arrayMove,
  blockScroll,
  DEFAULT_SORTABLE_LABELS,
  keyDown,
  pointerDown,
  registerList,
  type SortableAnnouncement,
  type SortableDirection,
  type SortableLabels,
  type SortableList,
  type SortablePosition,
} from "../internal/sortable.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { IconButton, type IconButtonProps } from "./IconButton.js";
import { useNavStyle } from "./Nav.js";
import { Row } from "./Row.js";
import styles from "./Sortable.module.scss";

/** What `onReorder` is told besides the new order. */
interface SortableReorder {
  id: string;
  from: number;
  to: number;
}

interface SortableContextValue {
  handle: boolean;
  direction: SortableDirection;
  instructionsId: string;
  labels: SortableLabels;
}

const SortableContext = createContext<SortableContextValue | null>(null);

interface SortableProps
  extends Omit<React.ComponentProps<typeof Column>, "direction" | "onDrop" | "label"> {
  /** The rows' ids in their current order, the same ids the SortableItems carry. */
  items: readonly string[];
  /**
   * Called when a row is dropped somewhere new in this list, with the new
   * order and the move that made it. Apply it to your own array with
   * `arrayMove(rows, from, to)`.
   */
  onReorder?: (items: string[], move: SortableReorder) => void;
  /**
   * Lists with the same `group` trade rows: pinned, projects and recents in a
   * sidebar, or the columns of a board. Without one, rows stay in this list.
   */
  group?: string;
  /** This list's name in `onMove`. Set it on every list of a group. */
  name?: string;
  /**
   * Called when a row lands in this list from another one of its group.
   * Passing the same handler to every list is the usual way.
   */
  onMove?: (id: string, to: SortablePosition, from: SortablePosition) => void;
  /** `row` for a horizontal list, such as a board's columns or a strip of media. */
  direction?: SortableDirection;
  /**
   * Drag only from a `SortableHandle` in each row. Use it when the rows hold
   * buttons or text people select, or need a quick touch drag.
   */
  handle?: boolean;
  /** Turns dragging off for the whole list. */
  disabled?: boolean;
  /** The list's name for screen readers when a row moves into it, such as "Projects". */
  label?: string;
  /** What screen readers hear, for a translated interface. */
  labels?: Partial<SortableLabels>;
}

/**
 * A list people can reorder: drag with a mouse or pen, press and hold with a
 * finger, or pick a row up with Space and move it with the arrow keys. Screen
 * readers hear each step. Rows slide aside with the macro transition, or
 * jump into place with reduced motion on.
 *
 * Sortable keeps no order of its own: it reports moves through `onReorder`
 * and `onMove`, and shows whatever order `items` holds.
 */
const Sortable = ({
  ref,
  items,
  onReorder,
  group,
  name,
  onMove,
  direction = "column",
  handle = false,
  disabled = false,
  label,
  labels,
  gap,
  className,
  style,
  children,
  ...flex
}: SortableProps) => {
  const ownName = useId();
  const instructionsId = `${ownName}-sortable-instructions`;
  const nav = useNavStyle();
  const text = useMemo(() => mergeLabels(DEFAULT_SORTABLE_LABELS, labels), [labels]);
  const elementRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => elementRef.current as HTMLDivElement);

  // The engine reads props through this, so a drag in progress always sees
  // the latest handlers and order without the list re-registering.
  const latest = useRef({
    items,
    onReorder,
    onMove,
    group,
    name,
    label,
    disabled,
    handle,
    direction,
    text,
  });
  latest.current = {
    items,
    onReorder,
    onMove,
    group,
    name,
    label,
    disabled,
    handle,
    direction,
    text,
  };

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const list: SortableList = {
      el,
      name: () => latest.current.name ?? ownName,
      group: () => latest.current.group ?? latest.current.name ?? ownName,
      direction: () => latest.current.direction,
      label: () => latest.current.label,
      disabled: () => latest.current.disabled,
      handle: () => latest.current.handle,
      labels: () => latest.current.text,
      reorder: (id, from, to) =>
        latest.current.onReorder?.(arrayMove(latest.current.items, from, to), { id, from, to }),
      move: () => latest.current.onMove,
    };
    return registerList(list);
  }, [ownName]);

  const context = useMemo(
    () => ({ handle, direction, instructionsId, labels: text }),
    [handle, direction, instructionsId, text],
  );

  const List = direction === "row" ? Row : Column;
  return (
    <SortableContext.Provider value={context}>
      <List
        ref={elementRef}
        fillWidth={direction === "column"}
        // Inside a Nav the rows keep the nav's own spacing.
        gap={gap ?? (nav.inNav ? nav.sizes.gap : undefined)}
        data-sortable-list=""
        data-sortable-handles={handle ? "" : undefined}
        aria-disabled={disabled || undefined}
        className={classNames(styles.list, className)}
        style={{
          // An empty list still needs room to drop into.
          minHeight:
            items.length === 0 && direction === "column" ? "var(--static-space-40)" : undefined,
          minWidth:
            items.length === 0 && direction === "row" ? "var(--static-space-40)" : undefined,
          ...style,
        }}
        {...flex}
      >
        {children}
        <span id={instructionsId} hidden>
          {text.instructions}
        </span>
      </List>
    </SortableContext.Provider>
  );
};

Sortable.displayName = "Sortable";

const useSortable = (part: string) => {
  const context = useContext(SortableContext);
  if (!context) throw new Error(`${part} must be inside a Sortable.`);
  return context;
};

const ItemContext = createContext<{ label?: string }>({});

interface SortableItemProps extends Omit<React.ComponentProps<typeof Flex>, "id"> {
  /** The row's id, as it appears in the list's `items`. */
  id: string;
  /**
   * What screen readers call the row as it moves. Defaults to the row's text,
   * which is right for a nav row; set it when the row holds more than a name.
   */
  label?: string;
  /** Keeps this row where it is. Other rows still move around it. */
  disabled?: boolean;
}

/**
 * One row of a Sortable. Wrap whatever the row is (a NavItem, a Card, a
 * Media) without changing it.
 *
 * When the row holds a link or a button, that stays the one tab stop and
 * picks up the row with Space. A row with nothing focusable becomes a tab
 * stop itself.
 */
const SortableItem = ({
  ref,
  id,
  label,
  disabled = false,
  className,
  children,
  onPointerDown,
  onKeyDown,
  ...flex
}: SortableItemProps) => {
  const { handle, direction, instructionsId } = useSortable("SortableItem");
  const elementRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => elementRef.current as HTMLDivElement);
  const [ownFocus, setOwnFocus] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    // Non-passive, so a drag in progress can keep the page from scrolling.
    el.addEventListener("touchmove", blockScroll, { passive: false });
    return () => el.removeEventListener("touchmove", blockScroll);
  }, []);

  // Describe the keyboard moves on whichever element takes focus: the
  // row's own link or button, or the row itself when it has none.
  useEffect(() => {
    const el = elementRef.current;
    if (!el || handle) return;
    const inner = el.querySelector<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!inner || inner === el) {
      setOwnFocus(true);
      return;
    }
    setOwnFocus(false);
    if (disabled) return;
    const before = inner.getAttribute("aria-describedby");
    inner.setAttribute("aria-describedby", [before, instructionsId].filter(Boolean).join(" "));
    return () => {
      if (before) inner.setAttribute("aria-describedby", before);
      else inner.removeAttribute("aria-describedby");
    };
  });

  const itemContext = useMemo(() => ({ label }), [label]);
  return (
    <ItemContext.Provider value={itemContext}>
      <Flex
        ref={elementRef}
        fillWidth={direction === "column"}
        data-sortable-id={id}
        data-sortable-label={label}
        data-sortable-disabled={disabled ? "" : undefined}
        tabIndex={ownFocus && !handle && !disabled ? 0 : undefined}
        aria-describedby={ownFocus && !handle && !disabled ? instructionsId : undefined}
        className={classNames(styles.item, className)}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (!disabled) pointerDown(event.nativeEvent, event.currentTarget);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!disabled && !event.defaultPrevented) keyDown(event.nativeEvent, event.currentTarget);
        }}
        // Links and images are natively draggable, which would take the
        // drag over and cancel the pointer.
        onDragStart={(event) => event.preventDefault()}
        {...flex}
      >
        {children}
      </Flex>
    </ItemContext.Provider>
  );
};

SortableItem.displayName = "SortableItem";

type SortableHandleProps = Partial<Omit<IconButtonProps, "href">> & {
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The grip a row is dragged by, for a list with `handle`. It is a button, so
 * it is the row's tab stop for picking it up with Space, and a touch on it
 * drags at once with no press and hold.
 */
const SortableHandle = ({ ref, className, ...button }: SortableHandleProps) => {
  const { instructionsId, labels } = useSortable("SortableHandle");
  const { label } = useContext(ItemContext);
  return (
    <IconButton
      ref={ref}
      type="button"
      icon="grip"
      variant="ghost"
      size="s"
      aria-label={labels.handle(label)}
      aria-describedby={instructionsId}
      data-sortable-handle=""
      className={classNames(styles.handle, className)}
      {...button}
    />
  );
};

SortableHandle.displayName = "SortableHandle";

export type {
  SortableAnnouncement,
  SortableDirection,
  SortableHandleProps,
  SortableItemProps,
  SortableLabels,
  SortablePosition,
  SortableProps,
  SortableReorder,
};
export { arrayMove, Sortable, SortableHandle, SortableItem };
