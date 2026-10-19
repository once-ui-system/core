"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { IconName } from "../icons";
import { Column } from "./Column";
import styles from "./FileTree.module.scss";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

export interface FileTreeFile {
  id: string;
  name: string;
  type: "file";
  icon?: IconName;
}

export interface FileTreeFolder {
  id: string;
  name: string;
  type: "folder";
  icon?: IconName;
  children: FileTreeItem[];
}

export type FileTreeItem = FileTreeFile | FileTreeFolder;

export interface FileTreeProps
  extends Omit<React.ComponentProps<typeof Column>, "children" | "onSelect"> {
  /** The root entries to display. IDs must be unique within the tree. */
  items: FileTreeItem[];
  /** Selected item ID. Pass `null` to clear selection. */
  selectedId?: string | null;
  /** Initial selection when `selectedId` is uncontrolled. */
  defaultSelectedId?: string;
  /** IDs of expanded folders. When omitted, expansion is uncontrolled. */
  expandedIds?: string[];
  /** Initial expanded folders when `expandedIds` is uncontrolled. */
  defaultExpandedIds?: string[];
  /** Called when an item becomes selected. */
  onSelect?: (item: FileTreeItem) => void;
  /** Called after a folder's expanded state changes. */
  onExpandChange?: (expandedIds: string[], item: FileTreeFolder) => void;
  /** Called for pointer clicks on an item row. */
  onItemClick?: (item: FileTreeItem) => void;
  /** Replaces the default item label while keeping the built-in file/folder icon. */
  renderItem?: (
    item: FileTreeItem,
    state: { selected: boolean; expanded: boolean; depth: number },
  ) => React.ReactNode;
  /** Content shown when `items` is empty. */
  emptyState?: React.ReactNode;
  /** Show the loading state instead of the tree. */
  loading?: boolean;
  /** Replaces the default loading placeholder. */
  loadingState?: React.ReactNode;
  /** Accessible name for the tree. Defaults to "File tree". */
  "aria-label"?: string;
}

interface VisibleItem {
  item: FileTreeItem;
  depth: number;
  parentId?: string;
}

function flattenVisible(
  items: FileTreeItem[],
  expanded: Set<string>,
  depth = 1,
  parentId?: string,
): VisibleItem[] {
  return items.flatMap((item) => [
    { item, depth, parentId },
    ...(item.type === "folder" && expanded.has(item.id)
      ? flattenVisible(item.children, expanded, depth + 1, item.id)
      : []),
  ]);
}

const FileTree = forwardRef<HTMLDivElement, FileTreeProps>(
  (
    {
      items,
      selectedId,
      defaultSelectedId,
      expandedIds,
      defaultExpandedIds = [],
      onSelect,
      onExpandChange,
      onItemClick,
      renderItem,
      emptyState,
      loading = false,
      loadingState,
      className,
      style,
      "aria-label": ariaLabel = "File tree",
      onKeyDown,
      ...columnProps
    },
    ref,
  ) => {
    const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState(defaultSelectedId ?? null);
    const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState(defaultExpandedIds);
    const [activeId, setActiveId] = useState(
      selectedId ?? defaultSelectedId ?? items[0]?.id ?? null,
    );
    const rowRefs = useRef(new Map<string, HTMLDivElement>());
    const controlledExpansion = expandedIds !== undefined;
    const expanded = useMemo(
      () => new Set(controlledExpansion ? expandedIds : uncontrolledExpandedIds),
      [controlledExpansion, expandedIds, uncontrolledExpandedIds],
    );
    const currentSelectedId = selectedId === undefined ? uncontrolledSelectedId : selectedId;
    const visibleItems = useMemo(() => flattenVisible(items, expanded), [items, expanded]);
    const visibleIds = visibleItems.map(({ item }) => item.id);
    const currentActiveId =
      activeId && visibleIds.includes(activeId) ? activeId : (visibleIds[0] ?? null);

    useEffect(() => {
      if (currentActiveId !== activeId) setActiveId(currentActiveId);
    }, [activeId, currentActiveId]);

    const focusItem = (id: string) => {
      setActiveId(id);
      rowRefs.current.get(id)?.focus();
    };

    const selectItem = (item: FileTreeItem) => {
      if (selectedId === undefined) setUncontrolledSelectedId(item.id);
      onSelect?.(item);
    };

    const toggleFolder = (item: FileTreeFolder) => {
      const next = new Set(expanded);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      const nextIds = Array.from(next);
      if (!controlledExpansion) setUncontrolledExpandedIds(nextIds);
      onExpandChange?.(nextIds, item);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !currentActiveId) return;
      const index = visibleIds.indexOf(currentActiveId);
      const current = visibleItems[index];
      if (!current) return;
      let destination: string | undefined;

      switch (event.key) {
        case "ArrowDown":
          destination = visibleIds[Math.min(index + 1, visibleIds.length - 1)];
          break;
        case "ArrowUp":
          destination = visibleIds[Math.max(index - 1, 0)];
          break;
        case "Home":
          destination = visibleIds[0];
          break;
        case "End":
          destination = visibleIds[visibleIds.length - 1];
          break;
        case "ArrowRight":
          if (current.item.type === "folder") {
            if (!expanded.has(current.item.id)) toggleFolder(current.item);
            else destination = current.item.children[0]?.id;
          }
          break;
        case "ArrowLeft":
          if (current.item.type === "folder" && expanded.has(current.item.id))
            toggleFolder(current.item);
          else destination = current.parentId;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          selectItem(current.item);
          break;
        default:
          break;
      }

      if (["ArrowDown", "ArrowUp", "Home", "End", "ArrowRight", "ArrowLeft"].includes(event.key)) {
        event.preventDefault();
      }
      if (destination) focusItem(destination);
    };

    const renderNodes = (nodes: FileTreeItem[], depth: number): React.ReactNode =>
      nodes.map((item, index) => {
        const isFolder = item.type === "folder";
        const isExpandable = isFolder && item.children.length > 0;
        const isExpanded = isExpandable && expanded.has(item.id);
        const isSelected = currentSelectedId === item.id;
        const accessibleLabel = item.name;

        return (
          // Keyboard input is handled once at the tree root for roving focus.
          // biome-ignore lint/a11y/useKeyWithClickEvents: The containing tree handles keyboard activation and navigation.
          <div
            key={item.id}
            ref={(node) => {
              if (node) rowRefs.current.set(item.id, node);
              else rowRefs.current.delete(item.id);
            }}
            className={classNames(styles.item, isSelected && styles.selected)}
            role="treeitem"
            aria-label={accessibleLabel}
            aria-level={depth}
            aria-posinset={index + 1}
            aria-setsize={nodes.length}
            aria-selected={isSelected}
            aria-expanded={isExpandable ? isExpanded : undefined}
            tabIndex={currentActiveId === item.id ? 0 : -1}
            onFocus={(event) => {
              event.stopPropagation();
              setActiveId(item.id);
            }}
            onClick={(event) => {
              // Child rows sit inside their folder's row, so stop the click
              // here or the folder would also select and collapse.
              event.stopPropagation();
              setActiveId(item.id);
              onItemClick?.(item);
              selectItem(item);
              if (item.type === "folder" && item.children.length > 0) toggleFolder(item);
            }}
            style={{ "--tree-depth": depth } as React.CSSProperties}
          >
            <span className={styles.itemContent}>
              {isExpandable ? (
                <Icon
                  name="chevronRight"
                  size="xs"
                  onBackground="neutral-weak"
                  className={classNames(styles.disclosure, isExpanded && styles.disclosureOpen)}
                />
              ) : (
                <span className={styles.disclosureSpacer} aria-hidden="true" />
              )}
              <Icon
                name={item.icon ?? (isFolder ? "folder" : "file")}
                size="xs"
                onBackground="neutral-weak"
              />
              <span className={styles.label}>
                {renderItem
                  ? renderItem(item, { selected: isSelected, expanded: Boolean(isExpanded), depth })
                  : item.name}
              </span>
            </span>
            {isExpandable && isExpanded && (
              // biome-ignore lint/a11y/useSemanticElements: The ARIA tree pattern requires a group around child treeitems.
              <div role="group" className={styles.group}>
                {renderNodes(item.children, depth + 1)}
              </div>
            )}
          </div>
        );
      });

    return (
      <Column
        {...columnProps}
        ref={ref}
        role="tree"
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        onKeyDown={handleKeyDown}
        className={classNames(styles.tree, className)}
        style={style}
      >
        {loading
          ? (loadingState ?? (
              <Column gap="8" paddingY="8" aria-label="Loading file tree">
                <Skeleton shape="line" width="60%" />
                <Skeleton shape="line" width="45%" />
                <Skeleton shape="line" width="70%" />
              </Column>
            ))
          : items.length === 0
            ? (emptyState ?? <Text className={styles.empty}>No files</Text>)
            : renderNodes(items, 1)}
      </Column>
    );
  },
);

FileTree.displayName = "FileTree";

export { FileTree };
