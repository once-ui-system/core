"use client";

import { useCallback } from "react";
import { IconButton } from "../../components/IconButton";
import { Row } from "../../components/Row";
import { useToast } from "../../contexts/ToastProvider";

export interface MdxHeadingAnchorProps {
  /** The heading's id; the link points at `#id`. */
  id: string;
  /** The heading's text, for the link's accessible name. */
  label: string;
  className?: string;
}

/**
 * The link next to an MDX heading: a real link to `#id`, so it works
 * without JavaScript, can be opened or copied from the context menu, and is
 * reachable by keyboard. Activating it also copies the section's URL and
 * confirms with a toast, the way `HeadingLink` does.
 *
 * The click is handled on the wrapper because links drop their own `onClick`
 * (the event still bubbles up from the anchor, for pointer and keyboard alike).
 */
export function MdxHeadingAnchor({ id, label, className }: MdxHeadingAnchorProps) {
  const { addToast } = useToast();

  const copy = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(
      () => addToast({ variant: "success", message: "Link copied to clipboard." }),
      () => addToast({ variant: "danger", message: "Failed to copy link." }),
    );
  }, [addToast, id]);

  return (
    <Row className={className} onClick={copy}>
      <IconButton
        href={`#${id}`}
        icon="link"
        size="m"
        variant="secondary"
        tooltip="Copy link"
        tooltipPosition="right"
        aria-label={label ? `Copy link to ${label}` : "Copy link to this section"}
      />
    </Row>
  );
}
