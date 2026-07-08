"use client";

import { Button, Row } from "@once-ui-system/core";
import type { ToolCallGroup as ToolCallGroupType } from "./types";
import { toolCallIcon } from "./utils";

type ToolCallGroupProps = {
  groups: ToolCallGroupType[];
  onSelect?: (group: ToolCallGroupType) => void;
};

export function ToolCallGroup({ groups, onSelect }: ToolCallGroupProps) {
  if (!groups || groups.length === 0) return null;

  return (
    <Row gap="4" wrap>
      {groups.map((group) => {
        // Defensive: skip if group doesn't have required properties
        if (!group || !group.name) return null;
        
        const label = group.count > 1 ? `${group.name} ×${group.count}` : group.name;

        return (
          <Button
            key={`${group.name}-${group.items[0]?.id}`}
            size="s"
            variant="secondary"
            prefixIcon={toolCallIcon(group.name)}
            onClick={() => onSelect?.(group)}
          >
            {label}
          </Button>
        );
      })}
    </Row>
  );
}
