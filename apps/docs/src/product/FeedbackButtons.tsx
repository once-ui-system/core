"use client";

import { Drawer, IconButton, Row, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";

type Tab = "new" | "changelog";

declare global {
  interface Window {
    Chirio?: {
      embed?: (element: Element, which: Tab) => () => void;
      unread?: () => boolean;
      open?: (which: Tab) => void;
    };
  }
}

/**
 * The header's Feedback and What's new buttons. Both open a Once UI Drawer
 * that Chirio's widget fills (window.Chirio.embed): the post form, with a
 * screenshot of the page and the signed-in person, or the changelog. What's
 * new carries a dot while there is news this person hasn't opened.
 */
export function FeedbackButtons({
  boardUrl,
  labels,
}: {
  /** The public board, for the drawer's open-in-a-tab button. */
  boardUrl: string;
  labels: { feedback: string; changelog: string; openBoard: string; close: string };
}) {
  const [open, setOpen] = useState<Tab | null>(null);
  const [unread, setUnread] = useState(false);
  // The drawer mounts its body a moment after it opens: fill it once it's there.
  const [body, setBody] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const onUnread = (event: Event) =>
      setUnread(Boolean((event as CustomEvent<{ unread: boolean }>).detail?.unread));
    window.addEventListener("chirio:unread", onUnread);
    setUnread(window.Chirio?.unread?.() ?? false);
    return () => window.removeEventListener("chirio:unread", onUnread);
  }, []);

  useEffect(() => {
    if (!open || !body) return;
    return window.Chirio?.embed?.(body, open);
  }, [open, body]);

  const title = open === "changelog" ? labels.changelog : labels.feedback;

  // A widget from before embed mode opens its own panel instead.
  const show = (which: Tab) => {
    if (window.Chirio && !window.Chirio.embed) window.Chirio.open?.(which);
    else setOpen(which);
  };

  return (
    <>
      <IconButton
        icon="lightbulb"
        size="m"
        variant="ghost"
        tooltip={labels.feedback}
        tooltipPosition="bottom"
        aria-label={labels.feedback}
        onClick={() => show("new")}
      />
      <Row position="relative">
        <IconButton
          icon="megaphone"
          size="m"
          variant="ghost"
          tooltip={labels.changelog}
          tooltipPosition="bottom"
          aria-label={labels.changelog}
          onClick={() => show("changelog")}
        />
        {unread && (
          <Row
            position="absolute"
            top="4"
            right="4"
            width="8"
            height="8"
            radius="full"
            solid="danger-strong"
            pointerEvents="none"
          />
        )}
      </Row>
      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        side="right"
        size="m"
        title={title}
        flush
        showClose={false}
      >
        <Row
          fillWidth
          vertical="center"
          gap="4"
          paddingLeft="20"
          paddingRight="12"
          paddingY="12"
          borderBottom="neutral-alpha-weak"
        >
          <Row flex={1}>
            <Text textVariant="heading-strong-s">{title}</Text>
          </Row>
          <IconButton
            icon="arrowUpRight"
            size="m"
            variant="ghost"
            href={boardUrl}
            tooltip={labels.openBoard}
            aria-label={labels.openBoard}
          />
          <IconButton
            icon="close"
            size="m"
            variant="ghost"
            tooltip={labels.close}
            aria-label={labels.close}
            onClick={() => setOpen(null)}
          />
        </Row>
        <Row ref={setBody} fillWidth flex={1} minHeight={0} />
      </Drawer>
    </>
  );
}
