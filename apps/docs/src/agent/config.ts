import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  agentDiscoveryPaths,
  absolute,
  contentSignal,
} from "@/agent/paths";
import { baseURL, schema } from "@/resources";

export { agentDiscoveryPaths, contentSignal } from "@/agent/paths";
export { agentLinkHeader } from "@/agent/link-header";

export function getLlmsTxtDigest(): string {
  const filePath = path.join(process.cwd(), "public", "llms.txt");
  const content = readFileSync(filePath, "utf8");
  return createHash("sha256").update(content).digest("hex");
}

export function buildApiCatalogLinkset() {
  return {
    linkset: [
      {
        anchor: absolute(agentDiscoveryPaths.navigationApi),
        "service-desc": [
          {
            href: absolute(agentDiscoveryPaths.navigationOpenApi),
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: absolute(agentDiscoveryPaths.aiCoding),
            type: "text/html",
          },
        ],
      },
      {
        anchor: absolute(agentDiscoveryPaths.llmsTxt),
        "service-doc": [
          {
            href: absolute(agentDiscoveryPaths.llmsTxt),
            type: "text/plain",
          },
        ],
      },
    ],
  };
}

export function buildAgentSkillsIndex() {
  return {
    $schema: "https://agentskills.io/schemas/discovery/v0.2.0",
    skills: [
      {
        name: "once-ui-docs",
        type: "documentation",
        description:
          "Once UI design system documentation, component reference, and LLM-oriented site map",
        url: absolute(agentDiscoveryPaths.llmsTxt),
        digest: { sha256: getLlmsTxtDigest() },
      },
      {
        name: "once-ui-mcp",
        type: "mcp",
        description:
          "Context7 MCP server for Once UI library documentation in AI-assisted editors",
        url: "https://context7.com/once-ui-system/core",
      },
    ],
  };
}

export function buildMcpServerCard() {
  return {
    $schema:
      "https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/docs/specification/draft/server-card.schema.json",
    serverInfo: {
      name: "once-ui-context7",
      version: "1.0.0",
      description: schema.description,
    },
    documentation: absolute(agentDiscoveryPaths.aiCoding),
    transports: [
      {
        type: "stdio",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp@latest"],
        library: "/once-ui-system/core",
      },
    ],
    capabilities: {
      resources: true,
      tools: false,
    },
  };
}

export const authMdContent = `# Authentication

${schema.name} documentation at ${baseURL} is a **public** site. No API keys, OAuth tokens, or agent registration are required to read the docs.

## Protected APIs

This host does not expose authenticated APIs. Optional JSON endpoints (navigation, Open Graph) are public.

## MCP and library docs

For AI-assisted development, use the [AI Coding (MCP)](${absolute(agentDiscoveryPaths.aiCoding)}) guide and Context7 (\`@once-ui-system/core\`).

## Content usage

See \`robots.txt\` Content-Signal: \`${contentSignal}\`.
`;
