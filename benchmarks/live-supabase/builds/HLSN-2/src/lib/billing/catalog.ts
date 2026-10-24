/**
 * The billing catalog, read from src/resources/plans.json. Client-safe: the
 * pricing cards render from it and the server resolves checkout prices and
 * entitlements from it, so the two cannot describe different plans.
 *
 * Price ids are not in the file. Stripe ids differ between test and live
 * mode, so they come from the environment (`STRIPE_PRICE_PRO_MONTHLY`, which
 * `npm run stripe:sync` prints) or, failing that, from the price's Stripe
 * `lookup_key`, which stripe-sync sets to the key here.
 */
import plans from "@/resources/plans.json";

export type Interval = "day" | "week" | "month" | "year";

export interface CatalogPrice {
  key: string;
  /** Minor units: 1900 = 19.00. */
  amount: number;
  /** Absent for a one-time price. */
  interval?: Interval;
  /**
   * A Stripe Billing Meter event name, for a usage-based (per-call) price.
   * `reportUsage` records against it; the price bills what was reported.
   * A metered price needs an `interval`; `amount` is then per unit and may be
   * fractional (0.05 = $0.0005 a call).
   */
  meter?: string;
  /**
   * Graduated tiers for a metered price, replacing `amount`. Included usage
   * is a first tier at 0: `[{ upTo: 1000, amount: 0 }, { upTo: null, amount: 0.05 }]`.
   */
  tiers?: CatalogTier[];
}

export interface CatalogTier {
  /** The last unit this tier covers; null for the open-ended last tier. */
  upTo: number | null;
  /** Minor units per unit, possibly fractional. */
  amount: number;
}

export interface CatalogPlan {
  key: string;
  name: string;
  description?: string;
  features: string[];
  prices: CatalogPrice[];
}

export interface Catalog {
  currency: string;
  free: Omit<CatalogPlan, "prices">;
  plans: CatalogPlan[];
}

type PlansFile = {
  currency: string;
  free?: Partial<Omit<CatalogPlan, "prices">>;
  products: (Omit<CatalogPlan, "features"> & { features?: string[] })[];
};

const file = plans as unknown as PlansFile;

export const catalog: Catalog = {
  currency: file.currency,
  free: {
    key: file.free?.key ?? "free",
    name: file.free?.name ?? "Free",
    description: file.free?.description,
    features: file.free?.features ?? [],
  },
  plans: file.products.map((product) => ({
    key: product.key,
    name: product.name,
    description: product.description,
    features: product.features ?? [],
    prices: product.prices,
  })),
};

/** The plan a price belongs to, by the price's key (its Stripe lookup_key). */
export function planForPriceKey(priceKey: string | null | undefined): CatalogPlan | null {
  if (!priceKey) return null;
  return catalog.plans.find((plan) => plan.prices.some((price) => price.key === priceKey)) ?? null;
}

export function findPrice(priceKey: string): { plan: CatalogPlan; price: CatalogPrice } | null {
  for (const plan of catalog.plans) {
    const price = plan.prices.find((p) => p.key === priceKey);
    if (price) return { plan, price };
  }
  return null;
}

/**
 * Where a plan sits in the catalog: later plans outrank earlier ones, and the
 * free plan is below all of them. Used to pick one plan when an organization
 * briefly holds two subscriptions (an upgrade mid-flight, a replacement).
 */
export function planRank(planKey: string | null | undefined): number {
  return planKey ? catalog.plans.findIndex((plan) => plan.key === planKey) : -1;
}

/** The env var that carries a price's Stripe id: `pro-monthly` -> `STRIPE_PRICE_PRO_MONTHLY`. */
export function priceEnvName(priceKey: string): string {
  return `STRIPE_PRICE_${priceKey.toUpperCase().replace(/-/g, "_")}`;
}

export function isMetered(price: CatalogPrice): boolean {
  return price.meter !== undefined;
}

/** The flat price a customer picks for `interval`, or the metered one when the plan is usage-only. */
export function primaryPrice(plan: CatalogPlan, interval: Interval): CatalogPrice {
  return (
    plan.prices.find((p) => p.interval === interval && !isMetered(p)) ??
    plan.prices.find((p) => p.interval === interval) ??
    plan.prices.find((p) => !isMetered(p)) ??
    plan.prices[0]
  );
}

/** The metered prices that ride along with a plan's subscription for `interval`. */
export function meteredPrices(plan: CatalogPlan, interval: Interval | undefined): CatalogPrice[] {
  return plan.prices.filter((p) => isMetered(p) && p.interval === interval);
}

/** "10,000 api_call included, then $0.0005 each", for a pricing card. */
export function describeUsage(price: CatalogPrice): string {
  const unit = (amount: number) => (amount === 0 ? "free" : `${formatUnitAmount(amount)} each`);
  const tiers = price.tiers ?? [{ upTo: null, amount: price.amount }];
  const parts: string[] = [];
  let from = 0;
  for (const tier of tiers) {
    const count = tier.upTo === null ? null : tier.upTo - from;
    if (tier.amount === 0 && from === 0 && count !== null) {
      parts.push(`${count.toLocaleString("en-US")} ${price.meter} included`);
    } else if (tier.upTo === null) {
      parts.push(`${parts.length ? "then " : ""}${unit(tier.amount)}`);
    } else {
      parts.push(
        `${parts.length ? "then " : ""}${unit(tier.amount)} up to ${tier.upTo.toLocaleString("en-US")}`,
      );
    }
    from = tier.upTo ?? from;
  }
  return parts.join(", ");
}

/** A per-unit amount, keeping the fraction of a cent: 0.05 -> "$0.0005". */
export function formatUnitAmount(amount: number, currency = catalog.currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 8,
  }).format(amount / 100);
}

/** 1900, "usd" -> "$19.00"; formatted the same on the server and the client. */
export function formatAmount(amount: number, currency = catalog.currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
