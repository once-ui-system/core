export type ToolCall = {
  id: string;
  name: string;
  detail?: string;
  status?: "pending" | "done";
};

export type ToolCallGroup = {
  name: string;
  count: number;
  items: ToolCall[];
};

export type AgentUpdate = {
  id: string;
  time: string;
  message: string;
};
