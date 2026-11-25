"use client";

export type { AgentChoice, AgentControlSpec } from "../../internal/agentRegistry.js";
export { useAgentControl } from "../../internal/agentRegistry.js";
export type {
  Agent,
  AgentActResult,
  AgentEntry,
  AgentQueryResult,
  AgentStep,
  AgentStepRequest,
  AgentStepResult,
  CreateAgentOptions,
} from "./createAgent.js";
export { createAgent } from "./createAgent.js";
export { agentTools, registerTools } from "./tools.js";
