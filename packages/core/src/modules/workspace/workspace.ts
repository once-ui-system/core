/**
 * Workspace tabs: the things a conversation made or touched, open beside it
 * as previews or as their real editor. Pure state, no React, so apps can run
 * the reducer on the server, in a test, or behind their own store.
 *
 * A tab is keyed by what it shows (`site:<id>`), so touching the same thing
 * twice refreshes one tab instead of opening a second one. What a tab holds
 * is the app's own `data`; the workspace never reads it.
 */

/** How a tab shows its item: the read-only preview or the real editor. */
export type WorkspaceTabMode = "preview" | "edit";

export interface WorkspaceTab<T = unknown> {
  /** What the tab shows, such as `site:42`. Opening the same key again refreshes it. */
  key: string;
  /** The tab's name in the strip and the panel header. */
  title: string;
  /** The app's own payload: whatever its renderer needs. */
  data: T;
  /** Whether the tab has an editor to switch to. Defaults to false: preview only. */
  editable?: boolean;
  /**
   * Bumped each time the tab is opened again or leaves its editor. Use it in
   * the preview's React `key`, so a refresh remounts it.
   */
  version: number;
}

/** A tab as the app opens it, before the workspace gives it a version. */
export type WorkspaceTabInput<T = unknown> = Omit<WorkspaceTab<T>, "version">;

export interface WorkspaceState<T = unknown> {
  tabs: WorkspaceTab<T>[];
  activeKey: string | null;
  /** The active tab fills the room and the conversation folds aside. */
  expanded: boolean;
  /** Per tab key: shown as the editor instead of the preview. */
  editing: Record<string, true>;
}

export type WorkspaceAction<T = unknown> =
  | { type: "open"; tabs: WorkspaceTabInput<T>[]; focus?: boolean; expand?: boolean }
  | { type: "activate"; key: string }
  | { type: "close"; key: string }
  | { type: "expand"; expanded: boolean }
  | { type: "mode"; key: string; mode: WorkspaceTabMode }
  | { type: "reset" };

export interface WorkspaceOptions {
  /** At most this many tabs; opening one more drops the oldest that is not active. Defaults to 8. */
  maxTabs?: number;
}

export const DEFAULT_MAX_TABS = 8;

export function emptyWorkspace<T = unknown>(): WorkspaceState<T> {
  return { tabs: [], activeKey: null, expanded: false, editing: {} };
}

/** The mode a tab is in: `"edit"` only while its editor is mounted. */
export function workspaceTabMode(state: WorkspaceState<unknown>, key: string): WorkspaceTabMode {
  return state.editing[key] ? "edit" : "preview";
}

/** The active tab, or null when nothing is open. */
export function activeWorkspaceTab<T>(state: WorkspaceState<T>): WorkspaceTab<T> | null {
  return state.tabs.find((tab) => tab.key === state.activeKey) ?? null;
}

function withoutKey(editing: Record<string, true>, key: string): Record<string, true> {
  if (!editing[key]) return editing;
  const next = { ...editing };
  delete next[key];
  return next;
}

/**
 * The workspace's reducer. Opening keeps an open editor's version, so a
 * refresh never remounts an editor with unsaved changes; leaving the editor
 * bumps the version, so the preview shows what was saved.
 */
export function workspaceReducer<T>(
  state: WorkspaceState<T>,
  action: WorkspaceAction<T>,
  options: WorkspaceOptions = {},
): WorkspaceState<T> {
  const maxTabs = Math.max(1, options.maxTabs ?? DEFAULT_MAX_TABS);
  switch (action.type) {
    case "open": {
      if (action.tabs.length === 0) return state;
      let tabs = state.tabs;
      for (const input of action.tabs) {
        const existing = tabs.find((tab) => tab.key === input.key);
        const keep = existing && state.editing[input.key];
        const version = existing ? existing.version + (keep ? 0 : 1) : 0;
        const next: WorkspaceTab<T> = { ...input, version };
        tabs = existing ? tabs.map((tab) => (tab.key === input.key ? next : tab)) : [...tabs, next];
      }
      const lastKey = action.tabs.at(-1)?.key ?? null;
      const focus = action.focus ?? true;
      const activeKey = focus || !state.activeKey ? lastKey : state.activeKey;
      let editing = state.editing;
      while (tabs.length > maxTabs) {
        const drop = tabs.findIndex((tab) => tab.key !== activeKey);
        editing = withoutKey(editing, tabs[drop].key);
        tabs = tabs.filter((_, index) => index !== drop);
      }
      // A tab that lost its editor (opened again as preview-only) leaves edit mode.
      for (const tab of tabs) {
        if (editing[tab.key] && !tab.editable) editing = withoutKey(editing, tab.key);
      }
      return { ...state, tabs, activeKey, editing, expanded: state.expanded || !!action.expand };
    }
    case "activate":
      return state.tabs.some((tab) => tab.key === action.key)
        ? { ...state, activeKey: action.key }
        : state;
    case "close": {
      const index = state.tabs.findIndex((tab) => tab.key === action.key);
      if (index < 0) return state;
      const tabs = state.tabs.filter((tab) => tab.key !== action.key);
      let activeKey = state.activeKey;
      if (activeKey === action.key) activeKey = (tabs[index] ?? tabs[index - 1])?.key ?? null;
      return {
        ...state,
        tabs,
        activeKey,
        editing: withoutKey(state.editing, action.key),
        expanded: tabs.length > 0 && state.expanded,
      };
    }
    case "expand":
      return { ...state, expanded: action.expanded && state.tabs.length > 0 };
    case "mode": {
      const target = state.tabs.find((tab) => tab.key === action.key);
      if (!target) return state;
      if (action.mode === "edit") {
        if (!target.editable || state.editing[action.key]) return state;
        return { ...state, editing: { ...state.editing, [action.key]: true } };
      }
      if (!state.editing[action.key]) return state;
      return {
        ...state,
        editing: withoutKey(state.editing, action.key),
        tabs: state.tabs.map((tab) =>
          tab.key === action.key ? { ...tab, version: tab.version + 1 } : tab,
        ),
      };
    }
    case "reset":
      return emptyWorkspace<T>();
  }
}
