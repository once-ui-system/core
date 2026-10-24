import { apiSession, json, readJson } from "@/lib/api";

export async function POST(request: Request) {
  const session = await apiSession();
  if (session instanceof Response) return session;
  const body = await readJson(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) {
    return json({ error: "name must be 1 to 80 characters" }, 400);
  }
  const { data, error } = await session.supabase.rpc("create_organization", { p_name: name });
  if (error || !data) {
    return json({ error: "Could not create the organization" }, 500);
  }
  const org = data as { id: string; slug: string; name: string };
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
}
