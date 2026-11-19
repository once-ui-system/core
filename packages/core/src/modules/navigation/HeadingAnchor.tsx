"use client";

import { useCallback } from "react";
import { IconButton } from "../../components/IconButton.js";
import { useOptionalToast } from "../../contexts/ToastContext.js";
import { copyText } from "../../internal/copyText.js";

/**
 * Copies the URL of the section `id` to the clipboard, and confirms with a
 * toast when there is a ToastProvider. Without one it still copies. On plain
 * http, where there is no Clipboard API, it copies through a textarea.
 */
export function useCopySectionLink(id: string) {
  const addToast = useOptionalToast()?.addToast;

  return useCallback(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void copyText(url).then((copied) =>
      addToast?.(
        copied
          ? { tone: "success", message: "Link copied to clipboard." }
          : { tone: "danger", message: "Failed to copy link." },
      ),
    );
  }, [addToast, id]);
}

export interface HeadingAnchorProps {
  /** The heading's id; the link points at `#id`. */
  id: string;
  /** The heading's text, for the link's accessible name. */
  label: string;
  className?: string;
}

/**
 * The link next to a heading, shared by `HeadingLink` and the `/mdx` map's
 * headings: a real link to `#id`, so it works without JavaScript, can be
 * opened or copied from the context menu, and is reachable by keyboard.
 * Activating it also copies the section's URL, with a toast when there is a
 * ToastProvider. Hide it visually if you like, never with `inert` or
 * `display: none`, or keyboard users lose it.
 */
export function HeadingAnchor({ id, label, className }: HeadingAnchorProps) {
  const copy = useCopySectionLink(id);

  return (
    <IconButton
      href={`#${id}`}
      icon="link"
      size="m"
      variant="secondary"
      tooltip="Copy link"
      tooltipPosition="right"
      aria-label={label ? `Copy link to ${label}` : "Copy link to this section"}
      className={className}
      onClick={copy}
    />
  );
}
