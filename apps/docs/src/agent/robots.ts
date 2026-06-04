import { contentSignal } from "@/agent/config";
import { baseURL } from "@/resources";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Bytespider",
  "CCBot",
] as const;

export function buildRobotsTxt(): string {
  const lines: string[] = [];

  for (const agent of AI_CRAWLERS) {
    lines.push(`User-agent: ${agent}`, "Allow: /", "");
  }

  lines.push(
    "User-agent: *",
    "Allow: /",
    `Content-Signal: ${contentSignal}`,
    "",
    `Sitemap: ${baseURL}/sitemap.xml`,
  );

  return `${lines.join("\n")}\n`;
}
