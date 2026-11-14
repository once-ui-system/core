"use client";

import { useCallback, useMemo, useReducer } from "react";
import {
  activeWorkspaceTab,
  emptyWorkspace,
  type WorkspaceAction,
  type WorkspaceOptions,
  type WorkspaceState,
  type WorkspaceTab,
  type WorkspaceTabInput,
  type WorkspaceTabMode,
  workspaceReducer,
  workspaceTabMode,
} from "./workspace.js";

export interface UseWorkspaceOptions<T> extends WorkspaceOptions {
  /** Tabs open on first render. */
  initialTabs?: WorkspaceTabInput<T>[];
}

export interface WorkspaceController<T = unknown> {
  state: WorkspaceState<T>;
  /** The active tab, or null when nothing is open. */
  active: WorkspaceTab<T> | null;
  /** Open or refresh tabs. `focus` (default true) makes the last one active. */
  open: (
    tabs: WorkspaceTabInput<T> | WorkspaceTabInput<T>[],
    options?: { focus?: boolean; expand?: boolean },
  ) => void;
  activate: (key: string) => void;
  close: (key: string) => void;
  /** Switch a tab between its preview and its editor. */
  setMode: (key: string, mode: WorkspaceTabMode) => void;
  modeOf: (key: string) => WorkspaceTabMode;
  setExpanded: (expanded: boolean) => void;
  reset: () => void;
  /** The raw dispatch, for an app that keeps its own actions beside these. */
  dispatch: (action: WorkspaceAction<T>) => void;
}

/**
 * The workspace's state in a component: tabs beside a conversation, each a
 * preview that can switch to its editor. Hand the result to `WorkspacePanel`.
 */
export function useWorkspace<T = unknown>(
  options: UseWorkspaceOptions<T> = {},
): WorkspaceController<T> {
  const { maxTabs, initialTabs } = options;
  const [state, dispatch] = useReducer(
    (current: WorkspaceState<T>, action: WorkspaceAction<T>) =>
      workspaceReducer(current, action, { maxTabs }),
    initialTabs,
    (tabs) => {
      if (!tabs?.length) return emptyWorkspace<T>();
      // The first initial tab is the one in front.
      const opened = workspaceReducer(emptyWorkspace<T>(), { type: "open", tabs }, { maxTabs });
      return workspaceReducer(opened, { type: "activate", key: tabs[0].key }, { maxTabs });
    },
  );

  const open = useCallback<WorkspaceController<T>["open"]>(
    (tabs, opts) => dispatch({ type: "open", tabs: Array.isArray(tabs) ? tabs : [tabs], ...opts }),
    [],
  );
  const activate = useCallback((key: string) => dispatch({ type: "activate", key }), []);
  const close = useCallback((key: string) => dispatch({ type: "close", key }), []);
  const setMode = useCallback(
    (key: string, mode: WorkspaceTabMode) => dispatch({ type: "mode", key, mode }),
    [],
  );
  const setExpanded = useCallback(
    (expanded: boolean) => dispatch({ type: "expand", expanded }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return useMemo(
    () => ({
      state,
      active: activeWorkspaceTab(state),
      open,
      activate,
      close,
      setMode,
      modeOf: (key: string) => workspaceTabMode(state, key),
      setExpanded,
      reset,
      dispatch,
    }),
    [state, open, activate, close, setMode, setExpanded, reset],
  );
}
