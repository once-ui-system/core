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

export function getFileDigest(relativePath: string): string {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const content = readFileSync(filePath, "utf8");
  return createHash("sha256").update(content).digest("hex");
}

export function getLlmsTxtDigest(): string {
  return getFileDigest("llms.txt");
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
      {
        anchor: absolute(agentDiscoveryPaths.aiManifest),
        "service-doc": [
          {
            href: absolute(agentDiscoveryPaths.aiManifest),
            type: "application/json",
          },
          {
            href: absolute(agentDiscoveryPaths.aiRules),
            type: "text/markdown",
          },
          {
            href: absolute(agentDiscoveryPaths.aiCatalog),
            type: "application/json",
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
        name: "once-ui-codegen",
        type: "documentation",
        description:
          "Once UI agent-first codegen harness: compact rules, component catalog, task bundles, and gold examples",
        url: absolute(agentDiscoveryPaths.aiManifest),
        digest: { sha256: getFileDigest("ai/manifest.json") },
      },
      {
        name: "once-ui-rules",
        type: "documentation",
        description: "Compact Once UI codegen rules — load before any UI generation task",
        url: absolute(agentDiscoveryPaths.aiRules),
        digest: { sha256: getFileDigest("ai/rules.compact.md") },
      },
      {
        name: "once-ui-catalog",
        type: "documentation",
        description: "Once UI component catalog with purpose, tags, and pairing hints",
        url: absolute(agentDiscoveryPaths.aiCatalog),
        digest: { sha256: getFileDigest("ai/catalog.json") },
      },
      {
        name: "once-ui-tasks",
        type: "documentation",
        description: "Intent-to-component task bundles with gold example references",
        url: absolute(agentDiscoveryPaths.aiTasks),
      },
      {
        name: "once-ui-blocks",
        type: "documentation",
        description: "Once UI Pro block references — production-quality composition patterns for headers, dashboards, chat, waitlist, roadmap",
        url: absolute("/ai/examples/blocks/manifest.json"),
      },
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
          "Context7 MCP server for exploratory Once UI documentation queries",
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
