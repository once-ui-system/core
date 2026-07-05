import { agentDiscoveryPaths, absolute } from "@/agent/paths";

/** RFC 8288 Link header value for the homepage (Edge-safe) */
export const agentLinkHeader = [
  `<${absolute(agentDiscoveryPaths.apiCatalog)}>; rel="api-catalog"`,
  `<${absolute(agentDiscoveryPaths.agentSkills)}>; rel="agent-skills"; type="application/json"`,
  `<${absolute(agentDiscoveryPaths.mcpServerCard)}>; rel="mcp-server-card"; type="application/json"`,
  `<${absolute(agentDiscoveryPaths.aiManifest)}>; rel="alternate"; type="application/json"; title="Once UI AI harness"`,
  `<${absolute(agentDiscoveryPaths.aiRules)}>; rel="service-doc"; type="text/markdown"; title="Once UI codegen rules"`,
  `<${absolute(agentDiscoveryPaths.llmsTxt)}>; rel="alternate"; type="text/plain"; title="LLM site map"`,
  `<${absolute(agentDiscoveryPaths.aiCoding)}>; rel="service-doc"; title="AI Coding and MCP"`,
  `<${absolute(agentDiscoveryPaths.navigationApi)}>; rel="describedby"; type="application/json"`,
].join(", ");
