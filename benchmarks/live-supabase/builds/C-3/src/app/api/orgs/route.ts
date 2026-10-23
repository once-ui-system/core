import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { createOrganization, requireUser } from "@/lib/orgs/server";

export function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    const body = await readJson(req);
    const org = await createOrganization(user.id, String(body.name ?? ""));
    return NextResponse.json({ id: org.id, slug: org.slug, name: org.name }, { status: 201 });
  });
}
