import { createOrg, getViewer } from "@/lib/orgs";
import { errorJson, json, readBody } from "@/lib/api";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return errorJson("Sign in first.", 401);

  const body = await readBody(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return errorJson("name is required (1 to 80 characters).", 400);

  const org = await createOrg(viewer, name);
  return json({ id: org.id, slug: org.slug, name: org.name }, 201);
}
