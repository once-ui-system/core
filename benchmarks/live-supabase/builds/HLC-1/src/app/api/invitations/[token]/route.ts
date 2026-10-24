import { apiSession, json } from "@/lib/api";
import { acceptInvitation, InvitationError } from "@/lib/orgs/data";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await apiSession();
  if (session instanceof Response) return session;
  try {
    const org = await acceptInvitation(session.supabase, token);
    return json({ id: org.id, slug: org.slug, name: org.name, role: org.role });
  } catch (error) {
    if (error instanceof InvitationError) {
      const message =
        error.status === 404
          ? "Invitation not found"
          : error.status === 410
            ? "Invitation has expired"
            : error.status === 403
              ? "This invitation is for another email address"
              : "Could not accept the invitation";
      return json({ error: message }, error.status);
    }
    return json({ error: "Could not accept the invitation" }, 500);
  }
}
