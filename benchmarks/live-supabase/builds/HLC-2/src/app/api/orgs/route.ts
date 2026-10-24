import { createOrganization } from "@/lib/orgs/actions";
import { errorResponse, json, readJson, requireApiViewer } from "@/lib/api";

export async function POST(request: Request) {
  const viewer = await requireApiViewer();
  if (viewer instanceof Response) return viewer;

  const body = await readJson(request);
  if (!body || typeof body.name !== "string") return json({ error: "name is required" }, 400);

  try {
    const org = await createOrganization(viewer.id, body.name);
    return json({ id: org.id, slug: org.slug, name: org.name }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
