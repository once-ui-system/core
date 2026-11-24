"use client";

import type React from "react";
import { type KeyboardEvent, type ReactNode, useRef } from "react";
import { Button } from "../../components/Button.js";
import { Column } from "../../components/Column.js";
import { IconButton } from "../../components/IconButton.js";
import { Row } from "../../components/Row.js";
import { SegmentedControl } from "../../components/SegmentedControl.js";
import { Text } from "../../components/Text.js";
import { ToggleButton } from "../../components/ToggleButton.js";
import type { IconName } from "../../icons.js";
import type { WorkspaceController } from "./useWorkspace.js";
import type { WorkspaceTab, WorkspaceTabMode } from "./workspace.js";

export interface WorkspacePanelLabels {
  /** The tab strip's name. */
  tabs: string;
  /** A tab's close button; it gets the tab's title. */
  close: (title: string) => string;
  /** The Preview / Edit switch's name. */
  mode: string;
  preview: string;
  edit: string;
  /** The button that lets the active tab fill the room. */
  expand: string;
  /** The button that brings the conversation back beside it. */
  collapse: string;
  /** The link that opens the tab's full editor on its own. */
  openEditor: string;
}

const DEFAULT_LABELS: WorkspacePanelLabels = {
  tabs: "Open items",
  close: (title) => `Close ${title}`,
  mode: "View",
  preview: "Preview",
  edit: "Edit",
  expand: "Expand",
  collapse: "Show conversation",
  openEditor: "Full editor",
};

export interface WorkspacePanelProps<T>
  extends Omit<React.ComponentProps<typeof Column>, "children"> {
  /** From `useWorkspace()`. */
  workspace: WorkspaceController<T>;
  /**
   * Draws the active tab: its preview, or with `mode="edit"` its real editor.
   * Remounted when the tab's version changes, so a refresh shows fresh content.
   */
  children: (tab: WorkspaceTab<T>, mode: WorkspaceTabMode) => ReactNode;
  /** The icon in front of each tab's title. */
  tabIcon?: (tab: WorkspaceTab<T>) => IconName | undefined;
  /** Beside the title in the header: a status tag, a count. */
  meta?: (tab: WorkspaceTab<T>) => ReactNode;
  /** More controls in the header, before the Preview / Edit switch: a picker, a device switch. */
  tools?: (tab: WorkspaceTab<T>, mode: WorkspaceTabMode) => ReactNode;
  /** Where the tab's full editor lives. Left out or undefined, there is no Full editor link. */
  editorHref?: (tab: WorkspaceTab<T>) => string | undefined;
  /**
   * Shows a button that lets the active tab fill the room. `"phone"` (the
   * default) only on small screens, where the conversation and the panel
   * cannot sit side by side; `true` everywhere; `false` never.
   */
  expandToggle?: boolean | "phone";
  /**
   * Switching a tab to its editor expands the workspace too, so the editor
   * gets the room. Defaults to true.
   */
  expandOnEdit?: boolean;
  /** Replaces the panel's words, for another language. */
  labels?: Partial<WorkspacePanelLabels>;
  /** Drawn when no tab is open. Left out, the panel renders nothing. */
  empty?: ReactNode;
}

const MAX_TAB_LABEL = 28;

function shortLabel(title: string): string {
  return title.length > MAX_TAB_LABEL ? `${title.slice(0, MAX_TAB_LABEL - 1)}…` : title;
}

/**
 * The panel beside a conversation: one tab per thing the conversation made
 * or touched, a header with its title and status, a Preview / Edit switch
 * for tabs that have an editor, and the tab itself, drawn by the app.
 *
 * Arrow keys move between tabs; Delete closes the focused one.
 */
export function WorkspacePanel<T>({
  workspace,
  children,
  tabIcon,
  meta,
  tools,
  editorHref,
  expandToggle = "phone",
  expandOnEdit = true,
  labels: labelsProp,
  empty,
  ...rest
}: WorkspacePanelProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const stripRef = useRef<HTMLDivElement>(null);
  const { state, active } = workspace;

  if (!active) return empty ?? null;

  const mode = workspace.modeOf(active.key);
  const href = editorHref?.(active);

  const setMode = (next: WorkspaceTabMode) => {
    workspace.setMode(active.key, next);
    if (next === "edit" && expandOnEdit && !state.expanded) workspace.setExpanded(true);
  };

  const focusTab = (index: number) => {
    const tab = state.tabs.at(index);
    if (!tab) return;
    workspace.activate(tab.key);
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-tab-key="${CSS.escape(tab.key)}"]`)
      ?.focus();
  };

  const onStripKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = state.tabs.findIndex((tab) => tab.key === active.key);
    if (event.key === "ArrowRight") focusTab((index + 1) % state.tabs.length);
    else if (event.key === "ArrowLeft")
      focusTab((index - 1 + state.tabs.length) % state.tabs.length);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(state.tabs.length - 1);
    else if (event.key === "Delete") {
      workspace.close(active.key);
      // Focus follows to the tab that takes its place.
      requestAnimationFrame(() =>
        stripRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus(),
      );
    } else return;
    event.preventDefault();
  };

  const panelId = `workspace-panel-${active.key}`;

  return (
    <Column
      fill
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
      overflow="hidden"
      {...rest}
    >
      <Row
        ref={stripRef}
        fillWidth
        paddingX="8"
        paddingTop="8"
        paddingBottom="4"
        gap="4"
        vertical="center"
        overflowX="auto"
        overflowY="hidden"
        scrollbar="minimal"
        role="tablist"
        aria-label={labels.tabs}
        onKeyDown={onStripKeyDown}
      >
        {state.tabs.map((tab) => {
          const selected = tab.key === active.key;
          return (
            // One pill per tab: the close button sits inside the tab it closes.
            <Row
              key={tab.key}
              vertical="center"
              radius="m"
              border={selected ? "neutral-alpha-medium" : "transparent"}
              background={selected ? "neutral-alpha-weak" : undefined}
              transition="micro-medium"
            >
              <ToggleButton
                size="s"
                radius="m"
                prefixIcon={tabIcon?.(tab)}
                label={shortLabel(tab.title)}
                role="tab"
                id={`workspace-tab-${tab.key}`}
                data-tab-key={tab.key}
                aria-selected={selected}
                aria-controls={selected ? panelId : undefined}
                tabIndex={selected ? 0 : -1}
                title={tab.title}
                onClick={() => workspace.activate(tab.key)}
              />
              {/* Out of the tab order and the accessibility tree: Delete closes a tab from the keyboard. */}
              <Row paddingRight="2" aria-hidden="true">
                <IconButton
                  size="s"
                  icon="close"
                  variant="ghost"
                  tabIndex={-1}
                  aria-label={labels.close(tab.title)}
                  onClick={() => workspace.close(tab.key)}
                />
              </Row>
            </Row>
          );
        })}
      </Row>

      <Row
        fillWidth
        paddingX="12"
        paddingY="8"
        gap="8"
        vertical="center"
        borderTop
        borderBottom
        wrap
      >
        <Row flex={1} minWidth={8} gap="8" vertical="center">
          <Text textVariant="label-strong-s" truncate>
            {active.title}
          </Text>
          {meta?.(active)}
        </Row>
        {tools?.(active, mode)}
        {active.editable ? (
          // Both modes share one fixed width, so the two halves are equal.
          <Row width={16}>
            <SegmentedControl
              compact
              scroll={false}
              semantics="radio"
              aria-label={labels.mode}
              value={mode}
              onValueChange={(value) => setMode(value as WorkspaceTabMode)}
              buttons={[
                { value: "preview", prefixIcon: "eye", label: labels.preview },
                { value: "edit", prefixIcon: "edit", label: labels.edit },
              ]}
            />
          </Row>
        ) : null}
        {expandToggle ? (
          <Row
            hide={expandToggle === "phone"}
            s={expandToggle === "phone" ? { hide: false } : undefined}
          >
            <IconButton
              size="m"
              variant="tertiary"
              icon={state.expanded ? "minimize" : "maximize"}
              tooltip={state.expanded ? labels.collapse : labels.expand}
              tooltipPosition="bottom"
              aria-pressed={state.expanded}
              onClick={() => workspace.setExpanded(!state.expanded)}
            />
          </Row>
        ) : null}
        {href ? (
          <Button
            size="s"
            variant="secondary"
            weight="default"
            suffixIcon="arrowUpRight"
            href={href}
          >
            {labels.openEditor}
          </Button>
        ) : null}
      </Row>

      <Column
        fill
        overflow="hidden"
        background="page"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`workspace-tab-${active.key}`}
      >
        <Column key={`${active.key}:${active.version}:${mode}`} fill>
          {children(active, mode)}
        </Column>
      </Column>
    </Column>
  );
}
