import { authorize, json, readJson } from "@/lib/api";
import { createOrg } from "@/lib/orgs";

export async function POST(req: Request) {
  const a = await authorize();
  if (a instanceof Response) return a;
  const body = await readJson(req);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return json({ error: "A name of 1 to 120 characters is required" }, 400);
  try {
    const org = await createOrg(a.user, name);
    return json({ id: org.id, slug: org.slug, name: org.name }, 201);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Could not create organization" }, 500);
  }
}
