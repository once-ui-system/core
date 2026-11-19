"use client";

import { Column, StyleScope } from "@once-ui-system/core";
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
import { isEditorMessage, type PreviewMessage, TO_EDITOR } from "../bridge.js";
import { FOOTER_ID, HEADER_ID, type Page, type SiteStyle } from "../model.js";

interface PreviewContextValue {
  selectedId: string | null;
  hoveredId: string | null;
  /** Whether the preview runs inside the editor (and should outline sections). */
  editing: boolean;
  select: (id: string) => void;
}

const PreviewContext = createContext<PreviewContextValue>({
  selectedId: null,
  hoveredId: null,
  editing: false,
  select: () => {},
});

export const usePreviewSelection = () => useContext(PreviewContext);

export interface PreviewState {
  pageId: string | null;
  page: Page;
  style: SiteStyle | null;
}

const post = (message: PreviewMessage) =>
  window.parent?.postMessage({ ...message, source: TO_EDITOR }, window.location.origin);

/**
 * Runs inside the preview iframe. It renders the draft page the editor posts
 * (so a change shows as it is typed), applies the site's style through
 * StyleScope, keeps the selection outlined, and answers clicks:
 *
 * - a click on a section (a `PreviewSection`) selects it;
 * - a click inside `[data-site-chrome="header"]` or `"footer"` selects that;
 * - a link to a path on this site opens that page in the editor instead.
 *
 * `initial` is what a server render already has; the editor's first message
 * replaces it. `onRefresh` runs when the editor asks a server-rendered preview
 * to render again (Next: `router.refresh()`).
 */
export function PreviewRoot({
  initial,
  onRefresh,
  children,
}: {
  initial?: Partial<PreviewState>;
  onRefresh?: () => void;
  children: (state: PreviewState) => ReactNode;
}) {
  const [state, setState] = useState<PreviewState>({
    pageId: initial?.pageId ?? null,
    page: initial?.page ?? { sections: [] },
    style: initial?.style ?? null,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const refresh = useRef(onRefresh);
  refresh.current = onRefresh;

  useEffect(() => {
    const inFrame = window.parent !== window;
    setEditing(inFrame);
    if (!inFrame) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (!isEditorMessage(event.data)) return;
      const message = event.data;
      if (message.kind === "page") {
        setState((current) => ({ ...current, pageId: message.pageId, page: message.page }));
      }
      if (message.kind === "style") setState((current) => ({ ...current, style: message.style }));
      if (message.kind === "select") setSelectedId(message.id);
      if (message.kind === "hover") setHoveredId(message.id);
      if (message.kind === "refresh") refresh.current?.();
    };
    window.addEventListener("message", onMessage);
    post({ kind: "ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Links and the header and footer, answered for the whole document.
  useEffect(() => {
    if (!editing) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (href) {
        // The frame shows one page at a time: a link never leaves it.
        event.preventDefault();
        if (href.startsWith("/") && !href.startsWith("//")) post({ kind: "navigate", path: href });
      }
      const chrome = target?.closest?.("[data-site-chrome]")?.getAttribute("data-site-chrome");
      if (chrome === "header") post({ kind: "select", id: HEADER_ID });
      if (chrome === "footer") post({ kind: "select", id: FOOTER_ID });
    };
    // Capture, so this runs before a router's own link handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [editing]);

  // The editor's shortcuts work while the preview has focus too: the keys it
  // knows are passed up, everything else stays with the page.
  useEffect(() => {
    if (!editing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const editorKey =
        event.key === "Escape" ||
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "?" ||
        (mod && ["z", "y", "d"].includes(key)) ||
        (mod && (event.key === "ArrowUp" || event.key === "ArrowDown"));
      if (!editorKey) return;
      event.preventDefault();
      post({
        kind: "key",
        key: event.key,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing]);

  // The header and footer are outlined like a selected section.
  useEffect(() => {
    if (!editing) return;
    for (const [name, id] of [
      ["header", HEADER_ID],
      ["footer", FOOTER_ID],
    ] as const) {
      const element = document.querySelector<HTMLElement>(`[data-site-chrome="${name}"]`);
      if (!element) continue;
      const on = selectedId === id || hoveredId === id;
      element.style.outline = on
        ? `2px solid var(--brand-${selectedId === id ? "on-background-medium" : "border-medium"})`
        : "";
      element.style.outlineOffset = on ? "-2px" : "";
      if (selectedId === id) element.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [editing, selectedId, hoveredId]);

  const select = useCallback((id: string) => post({ kind: "select", id }), []);
  const context = useMemo(
    () => ({ selectedId, hoveredId, editing, select }),
    [selectedId, hoveredId, editing, select],
  );

  const config = state.style?.config;
  return (
    <PreviewContext.Provider value={context}>
      <StyleScope
        config={config}
        fonts={state.style?.fonts}
        fillWidth
        direction="column"
        minHeight="100vh"
        background="page"
        // Grow with the page inside a flex parent (a fixed scroll container,
        // say), so the page background runs the whole length of the site.
        style={{ flexShrink: 0 }}
      >
        <Column fillWidth flex={1}>
          {children(state)}
        </Column>
      </StyleScope>
    </PreviewContext.Provider>
  );
}
