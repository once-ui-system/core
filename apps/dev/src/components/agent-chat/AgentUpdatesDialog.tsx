"use client";

import { Column, Dialog, Line, Row, Text } from "@once-ui-system/core";
import type { AgentUpdate } from "./types";

type AgentUpdatesDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  updates: AgentUpdate[];
  title?: string;
};

export function AgentUpdatesDialog({
  isOpen,
  onClose,
  updates,
  title = "Activity log",
}: AgentUpdatesDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} minHeight={24}>
      <Column gap="8" paddingTop="4">
        {updates.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            No activity yet.
          </Text>
        ) : (
          updates.map((update, index) => (
            <Column key={update.id} gap="8">
              <Row gap="12" vertical="start">
                <Text variant="label-default-xs" onBackground="neutral-weak" wrap="nowrap">
                  {update.time}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-strong">
                  {update.message}
                </Text>
              </Row>
              {index < updates.length - 1 ? <Line /> : null}
            </Column>
          ))
        )}
      </Column>
    </Dialog>
  );
}
