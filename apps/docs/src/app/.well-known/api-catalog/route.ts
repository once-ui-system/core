import { buildApiCatalogLinkset } from "@/agent/config";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(buildApiCatalogLinkset(), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
