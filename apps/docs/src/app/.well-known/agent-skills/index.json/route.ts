import { buildAgentSkillsIndex } from "@/agent/config";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(buildAgentSkillsIndex(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
