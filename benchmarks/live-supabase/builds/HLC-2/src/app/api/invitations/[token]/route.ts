import { errorResponse, json, requireApiViewer } from "@/lib/api";
import { acceptInvitation } from "@/lib/orgs/actions";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const viewer = await requireApiViewer();
  if (viewer instanceof Response) return viewer;
  const { token } = await params;

  try {
    const org = await acceptInvitation(token);
    return json({ id: org.id, slug: org.slug, name: org.name, role: org.role });
  } catch (error) {
    return errorResponse(error);
  }
}
