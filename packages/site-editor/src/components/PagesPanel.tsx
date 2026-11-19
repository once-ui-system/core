"use client";

import { Button, Column, IconButton, Input, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import { useEditorContext } from "../context.js";
import type { PageEntry } from "../model.js";

/**
 * The site's pages: open one, add one, rename or remove one. What the panel
 * offers follows the adapter: no `createPage`, no New page.
 */
export function PagesPanel({
  pages,
  current,
  onOpen,
  onCreate,
  onRename,
  onRemove,
}: {
  pages: PageEntry[];
  current: string;
  onOpen: (id: string) => void;
  onCreate?: (input: { title: string; slug: string }) => Promise<void>;
  onRename?: (id: string, input: { title: string; slug: string }) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
}) {
  const { labels } = useEditorContext();
  const [draft, setDraft] = useState<{ id?: string; title: string; slug: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      if (draft.id) await onRename?.(draft.id, draft);
      else await onCreate?.(draft);
      setDraft(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Column fillWidth gap="8" paddingY="16">
      {pages.map((page) => {
        const selected = page.id === current;
        return (
          <Row
            key={page.id}
            fillWidth
            gap="4"
            vertical="center"
            radius="m"
            paddingRight="4"
            background={selected ? "brand-alpha-weak" : "transparent"}
            border={selected ? "brand-alpha-strong" : "neutral-alpha-medium"}
          >
            <Row
              as="button"
              type="button"
              flex={1}
              minWidth={0}
              padding="12"
              gap="8"
              vertical="center"
              cursor="interactive"
              background="transparent"
              aria-current={selected ? "page" : undefined}
              onClick={() => onOpen(page.id)}
            >
              <Column flex={1} minWidth={0}>
                <Text variant="label-strong-s" truncate>
                  {page.title || (page.home ? labels.homePage : page.slug)}
                </Text>
                <Text variant="label-default-xs" onBackground="neutral-weak" truncate>
                  /{page.slug}
                </Text>
              </Column>
            </Row>
            {onRename && (
              <IconButton
                icon="edit"
                size="s"
                variant="tertiary"
                tooltip={labels.renamePage}
                onClick={() => setDraft({ id: page.id, title: page.title, slug: page.slug })}
              />
            )}
            {onRemove && !page.home && (
              <IconButton
                icon="trash"
                size="s"
                variant="tertiary"
                tooltip={labels.removePage}
                onClick={() => void onRemove(page.id)}
              />
            )}
          </Row>
        );
      })}

      {draft ? (
        <Column fillWidth gap="12" padding="12" radius="m" border="neutral-alpha-medium">
          <Input
            id="site-editor-page-title"
            label={labels.pageTitle}
            value={draft.title}
            onValueChange={(title) => setDraft({ ...draft, title })}
          />
          {!pages.find((page) => page.id === draft.id)?.home && (
            <Input
              id="site-editor-page-slug"
              label={labels.pageSlug}
              prefix={<Text onBackground="neutral-weak">/</Text>}
              value={draft.slug}
              onValueChange={(slug) => setDraft({ ...draft, slug })}
            />
          )}
          <Row gap="8" horizontal="end">
            <Button size="s" variant="tertiary" onClick={() => setDraft(null)}>
              {labels.cancel}
            </Button>
            <Button size="s" loading={busy} disabled={!draft.title.trim()} onClick={submit}>
              {draft.id ? labels.save : labels.createPage}
            </Button>
          </Row>
        </Column>
      ) : (
        onCreate && (
          <Button
            size="s"
            variant="secondary"
            prefixIcon="plus"
            fillWidth
            onClick={() => setDraft({ title: "", slug: "" })}
          >
            {labels.newPage}
          </Button>
        )
      )}
    </Column>
  );
}
