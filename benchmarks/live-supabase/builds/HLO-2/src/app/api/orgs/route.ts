import { createOrganization } from "@/lib/orgs/service";
import { apiSession, fail, guarded, isError, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export const POST = guarded(async (request: Request) => {
  const session = await apiSession();
  if (isError(session)) return session;
  const body = await readJson(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return fail(400, "name is required (up to 80 characters)");
  const org = await createOrganization(session.sb, name);
  return Response.json({ id: org.id, slug: org.slug, name: org.name }, { status: 201 });
});
