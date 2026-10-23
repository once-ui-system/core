import { authorize, json } from "@/lib/api";
import { listMembers } from "@/lib/orgs";

export async function GET(_req: Request, { params }: { params: Promise<{ org: string }> }) {
  const a = await authorize((await params).org);
  if (a instanceof Response) return a;
  return json(await listMembers(a.ctx!.org.id));
}
