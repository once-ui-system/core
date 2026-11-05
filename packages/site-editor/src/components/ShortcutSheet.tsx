"use client";

import { Column, Dialog, Kbd, Row, Text } from "@once-ui-system/core";
import { useEditorContext } from "../context.js";
import { SHORTCUTS } from "../shortcuts.js";

/** The shortcuts, one per row, opened with `?`. */
export function ShortcutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { labels } = useEditorContext();
  return (
    <Dialog open={open} onClose={onClose} title={labels.shortcuts}>
      <Column fillWidth gap="12">
        {SHORTCUTS.map((shortcut) => (
          <Row key={shortcut.label} fillWidth horizontal="between" vertical="center" gap="16">
            <Text variant="body-default-s">{labels[shortcut.label]}</Text>
            <Row gap="4">
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </Row>
          </Row>
        ))}
      </Column>
    </Dialog>
  );
}
