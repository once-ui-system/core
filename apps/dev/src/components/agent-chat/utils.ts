import type { IconName } from "@once-ui-system/core";
import type { ToolCall, ToolCallGroup } from "./types";

export function groupToolCalls(calls: ToolCall[]): ToolCallGroup[] {
  const groups: ToolCallGroup[] = [];

  for (const call of calls) {
    const last = groups[groups.length - 1];
    if (last && last.name === call.name) {
      last.count += 1;
      last.items.push(call);
      continue;
    }

    groups.push({
      name: call.name,
      count: 1,
      items: [call],
    });
  }

  return groups;
}

export function toolCallIcon(name: string): IconName {
  switch (name) {
    case "Read":
      return "eye";
    case "Grep":
      return "search";
    case "Edit":
    case "Write":
    case "StrReplace":
      return "clipboard";
    case "Shell":
      return "computer";
    default:
      return "document";
  }
}
