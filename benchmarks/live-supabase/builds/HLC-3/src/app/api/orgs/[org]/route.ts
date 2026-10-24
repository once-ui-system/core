import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/orgs/access";
import { jsonError, readJsonObject } from "@/lib/http";

type Params = { params: Promise<{ org: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { org: slug } = await params;
  const guard = await apiGuard(slug);
  if (!guard.ok) return guard.response;
  const { org, role } = guard;
  return NextResponse.json({ id: org.id, slug: org.slug, name: org.name, plan: org.plan, role });
}

// Renames the organization. Owners and admins only.
export async function PATCH(request: Request, { params }: Params) {
  const { org: slug } = await params;
  const guard = await apiGuard(slug, { manage: true });
  if (!guard.ok) return guard.response;

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) return jsonError(400, "name must be 1 to 80 characters");

  const { data, error } = await guard.supabase
    .from("organizations")
    .update({ name })
    .eq("id", guard.org.id)
    .select("id, slug, name, plan")
    .single();
  if (error) return jsonError(500, error.message);
  return NextResponse.json({ ...data, role: guard.role });
}
