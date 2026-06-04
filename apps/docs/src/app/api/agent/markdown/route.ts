import { NextRequest, NextResponse } from "next/server";
import { getMarkdownForPath } from "@/agent/markdown";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path") ?? "/";
  const markdown = getMarkdownForPath(pathParam);

  if (!markdown) {
    return NextResponse.json(
      { error: "No markdown representation for this path" },
      { status: 404 },
    );
  }

  if (request.method === "HEAD") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}
