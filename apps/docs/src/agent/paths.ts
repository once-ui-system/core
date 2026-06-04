import { baseURL } from "@/resources";

export const contentSignal = "search=yes, ai-input=yes, ai-train=no";

export const agentDiscoveryPaths = {
  apiCatalog: "/.well-known/api-catalog",
  agentSkills: "/.well-known/agent-skills/index.json",
  mcpServerCard: "/.well-known/mcp/server-card.json",
  llmsTxt: "/llms.txt",
  aiCoding: "/once-ui/ai-coding",
  navigationApi: "/api/navigation",
  navigationOpenApi: "/openapi/navigation.json",
  authMd: "/auth.md",
} as const;

export function absolute(pathname: string) {
  return `${baseURL}${pathname}`;
}
