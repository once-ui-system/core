import { authorize, json } from "@/lib/api";
import { acceptInvitation } from "@/lib/orgs";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const a = await authorize();
  if (a instanceof Response) return a;
  const r = await acceptInvitation((await params).token, a.user);
  if (!r.ok) return json({ error: r.error }, r.status);
  return json({ ok: true, slug: r.slug });
}
