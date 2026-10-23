import Stripe from "stripe";

export function getStripe() {
  const base = process.env.STRIPE_API_BASE;
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (base) {
    const u = new URL(base);
    return new Stripe(key, {
      host: u.hostname,
      port: u.port || (u.protocol === "https:" ? "443" : "80"),
      protocol: u.protocol.replace(":", "") as "http" | "https",
      maxNetworkRetries: 0,
    });
  }
  return new Stripe(key);
}
