import { type NextRequest, NextResponse } from "next/server";
import { agentLinkHeader } from "@/agent/config";
import { acceptsMarkdown } from "@/agent/markdown";

const SKIP_MARKDOWN_PREFIXES = ["/api/", "/_next/", "/.well-known/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (acceptsMarkdown(request.headers.get("accept"))) {
    const skipMarkdown = SKIP_MARKDOWN_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    const hasFileExtension = /\.[a-z0-9]+$/i.test(pathname);

    if (!skipMarkdown && !hasFileExtension) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/agent/markdown";
      url.searchParams.set("path", pathname);
      return NextResponse.rewrite(url);
    }
  }

  if (pathname === "/") {
    const response = NextResponse.next();
    response.headers.set("Link", agentLinkHeader);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
