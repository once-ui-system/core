"use client";

import React, { useCallback, useState } from "react";
import {
  Button,
  Column,
  DropdownWrapper,
  IconButton,
  Option,
  Row,
  useToast,
} from "@once-ui-system/core";

interface CopyPageProps {
  /** Route of the page being read, e.g. `/once-ui/components/card`. */
  path: string;
}

const MARKDOWN_ENDPOINT = "/api/agent/markdown?path=";

/**
 * Hands the page to an LLM. The Markdown is the same representation
 * `/api/agent/markdown` already serves to agents, so what a reader pastes into
 * a chat is byte-for-byte what a crawler gets — one source, not two.
 */
function CopyPage({ path }: CopyPageProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { addToast } = useToast();

  const markdownUrl = `${MARKDOWN_ENDPOINT}${encodeURIComponent(path)}`;

  const copy = useCallback(async () => {
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      setCopied(true);
      // Long enough to read, short enough that a second copy still feels live.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({
        variant: "danger",
        message: "Could not copy this page. Open it as Markdown instead.",
      });
    }
  }, [markdownUrl, addToast]);

  const openWith = useCallback(
    (base: string) => {
      const prompt = `Read ${window.location.origin}${markdownUrl} and answer questions about it.`;
      window.open(`${base}${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
    },
    [markdownUrl],
  );

  return (
    <Row gap="4" vertical="center" data-border="rounded">
      <Button
        size="s"
        weight="default"
        variant="secondary"
        prefixIcon={copied ? "check" : "copy"}
        onClick={copy}
      >
        {copied ? "Copied" : "Copy for LLM"}
      </Button>
      <DropdownWrapper
        open={open}
        onOpenChange={setOpen}
        placement="bottom-end"
        minWidth={16}
        // The trigger drives the open state itself: an IconButton without an
        // `onClick` renders a div, which is not focusable, and letting the
        // wrapper handle the click would leave the control mouse-only.
        disableTriggerClick
        trigger={
          <IconButton
            size="s"
            variant="secondary"
            icon="chevronDown"
            tooltip="More ways to use this page"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          />
        }
        dropdown={
          <Column fillWidth padding="4" gap="2">
            <Option
              value="markdown"
              label="View as Markdown"
              href={markdownUrl}
              onLinkClick={() => setOpen(false)}
            />
            <Option
              value="chatgpt"
              label="Open in ChatGPT"
              onClick={() => {
                setOpen(false);
                openWith("https://chatgpt.com/?q=");
              }}
            />
            <Option
              value="claude"
              label="Open in Claude"
              onClick={() => {
                setOpen(false);
                openWith("https://claude.ai/new?q=");
              }}
            />
          </Column>
        }
      />
    </Row>
  );
}

export { CopyPage };
