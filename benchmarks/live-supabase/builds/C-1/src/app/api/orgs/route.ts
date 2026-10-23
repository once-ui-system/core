import { NextResponse } from "next/server";
import { createOrg, requireUser } from "@/lib/orgs";

export async function POST(req: Request) {
  const u = await requireUser();
  if (!u.ok) return u.response;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  try {
    const org = await createOrg(u.user, name);
    return NextResponse.json(org, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
