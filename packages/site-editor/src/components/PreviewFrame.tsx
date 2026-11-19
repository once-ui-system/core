"use client";

import { Column, Spinner } from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { type EditorMessage, isPreviewMessage, TO_PREVIEW } from "../bridge.js";
import { useEditorContext } from "../context.js";
import type { Page, SiteStyle } from "../model.js";

export const DEVICES = ["desktop", "tablet", "mobile"] as const;
export type Device = (typeof DEVICES)[number];

/** How wide the frame may be, on the token scale (n/16 rem). Desktop fills the canvas. */
const WIDTHS: Record<Device, number | undefined> = { desktop: undefined, tablet: 768, mobile: 390 };

export interface PreviewFrameProps {
  src: string;
  pageId: string;
  page: Page | null;
  style: SiteStyle | null;
  selectedId: string | null;
  hoveredId: string | null;
  device: Device;
  /** Bumped to make a server-rendered preview render again. */
  revision: number;
  onSelect: (id: string) => void;
  onNavigate: (path: string) => void;
}

/**
 * The site as visitors get it, in its own document, so its styles, fonts and
 * breakpoints are exactly theirs. There is no editor inside the frame: a click
 * selects, and the panel answers with the fields.
 */
export function PreviewFrame({
  src,
  pageId,
  page,
  style,
  selectedId,
  hoveredId,
  device,
  revision,
  onSelect,
  onNavigate,
}: PreviewFrameProps) {
  const { labels } = useEditorContext();
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const post = useCallback((message: EditorMessage) => {
    // Same-origin route, so the strict target origin is this window's own.
    frame.current?.contentWindow?.postMessage(
      { ...message, source: TO_PREVIEW },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      if (!isPreviewMessage(event.data)) return;
      if (event.data.kind === "ready") setReady(true);
      if (event.data.kind === "select") onSelect(event.data.id);
      if (event.data.kind === "navigate") onNavigate(event.data.path);
      if (event.data.kind === "key") {
        const { key, metaKey, ctrlKey, shiftKey } = event.data;
        window.dispatchEvent(new KeyboardEvent("keydown", { key, metaKey, ctrlKey, shiftKey }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelect, onNavigate]);

  // A new address reloads the frame: wait for its next "ready".
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on every new address
  useEffect(() => {
    setReady(false);
  }, [src]);

  useEffect(() => {
    if (ready && page) post({ kind: "page", pageId, page });
  }, [ready, page, pageId, post]);

  useEffect(() => {
    if (ready && style) post({ kind: "style", style });
  }, [ready, style, post]);

  useEffect(() => {
    if (ready) post({ kind: "select", id: selectedId });
  }, [ready, selectedId, post]);

  useEffect(() => {
    if (ready) post({ kind: "hover", id: hoveredId });
  }, [ready, hoveredId, post]);

  useEffect(() => {
    if (ready && revision > 0) post({ kind: "refresh" });
  }, [ready, revision, post]);

  return (
    <Column fill horizontal="center" padding="8" radius="l" background="neutral-alpha-weak">
      <Column
        fill
        maxWidth={WIDTHS[device]}
        transition="macro-medium"
        radius="l"
        border="neutral-alpha-medium"
        background="page"
        overflow="hidden"
        position="relative"
        shadow={device === "desktop" ? undefined : "l"}
      >
        {!ready && (
          <Column position="absolute" fill center zIndex={1} background="page">
            <Spinner aria-label={labels.loading} />
          </Column>
        )}
        <iframe
          ref={frame}
          title={labels.previewTitle}
          src={src}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
      </Column>
    </Column>
  );
}
