import { buildMcpServerCard } from "@/agent/config";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(buildMcpServerCard(), {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}
