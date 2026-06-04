import { authMdContent } from "@/agent/config";

export const runtime = "nodejs";

export async function GET() {
  return new Response(authMdContent, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
