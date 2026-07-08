"use client";

import { useState } from "react";
import { IconButton, Row } from "@once-ui-system/core";
import { AgentUpdatesDialog } from "./AgentUpdatesDialog";
import { ToolCallGroup } from "./ToolCallGroup";
import type { AgentUpdate, ToolCall, ToolCallGroup as ToolCallGroupType } from "./types";
import { groupToolCalls } from "./utils";

type AgentActivityBarProps = {
  toolCalls: ToolCall[];
  updates: AgentUpdate[];
};

export function AgentActivityBar({ toolCalls, updates }: AgentActivityBarProps) {
  const [logOpen, setLogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Activity log");
  const [dialogUpdates, setDialogUpdates] = useState<AgentUpdate[]>(updates);
  const groups = groupToolCalls(toolCalls);

  const openLog = (nextUpdates: AgentUpdate[], title = "Activity log") => {
    setDialogUpdates(nextUpdates);
    setDialogTitle(title);
    setLogOpen(true);
  };

  const handleGroupSelect = (group: ToolCallGroupType) => {
    const detailUpdates = group.items.map((item) => ({
      id: item.id,
      time: "",
      message: item.detail ? `${item.name}: ${item.detail}` : item.name,
    }));

    openLog(
      detailUpdates,
      group.count > 1 ? `${group.name} (${group.count})` : group.name,
    );
  };

  if (groups.length === 0 && updates.length === 0) return null;

  return (
    <>
      <Row gap="8" vertical="center" wrap>
        <ToolCallGroup groups={groups} onSelect={handleGroupSelect} />
        {updates.length > 0 ? (
          <IconButton
            icon="document"
            variant="tertiary"
            size="s"
            tooltip="Log"
            aria-label="Open activity log"
            onClick={() => openLog(updates)}
          />
        ) : null}
      </Row>

      <AgentUpdatesDialog
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        updates={dialogUpdates}
        title={dialogTitle}
      />
    </>
  );
}
