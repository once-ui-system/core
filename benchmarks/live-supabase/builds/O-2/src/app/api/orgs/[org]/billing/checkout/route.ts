import { stripeEnv } from "../../../../../../lib/env";
import { json, withOrg } from "../../../../../../lib/orgs";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  return withOrg(slug, { manage: true }, async ({ org, user }) => {
    const stripe = stripeEnv();
    if (!stripe.secretKey || !stripe.priceTeam) return json({ error: "Billing is not configured" }, 503);
    const origin = new URL(request.url).origin;
    const form = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": stripe.priceTeam,
      "line_items[0][quantity]": "1",
      client_reference_id: org.id,
      success_url: `${origin}/app/${org.slug}/settings?upgraded=1`,
      cancel_url: `${origin}/app/${org.slug}/settings`,
    });
    if (user.email) form.set("customer_email", user.email);
    const res = await fetch(`${stripe.apiBase}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const session = await res.json().catch(() => null);
    if (!res.ok || !session?.url) return json({ error: "Could not start checkout" }, 502);
    return json({ url: session.url });
  });
}
