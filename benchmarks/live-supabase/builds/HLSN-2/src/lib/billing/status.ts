/**
 * What a subscription status means for access. Pure and client-safe, so the
 * rule is written once and tested on its own (status.test.mjs).
 *
 * Only `active` and `trialing` entitle. `past_due` does not: a failed renewal
 * is the moment access has to stop being granted, and waiting for Stripe's
 * dunning to cancel the subscription days later leaves the app handing out a
 * plan nobody has paid for (Once UI's own site learned this the hard way).
 */

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

const ENTITLING: readonly string[] = ["active", "trialing"];

/**
 * Statuses that are over for good. The mirror table deletes these rows rather
 * than keeping them: it holds live subscriptions only (history is Stripe's),
 * which is also what lets an organization be deleted once nothing is billing.
 */
const TERMINAL: readonly string[] = ["canceled", "incomplete_expired"];

export function isEntitling(status: string): boolean {
  return ENTITLING.includes(status);
}

export function isTerminal(status: string): boolean {
  return TERMINAL.includes(status);
}

export interface MirroredSubscription {
  id: string;
  status: string;
  plan_key: string | null;
  price_key: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * The one subscription that decides an organization's plan: an entitling one
 * over one that is not, then the higher-ranked plan, then the later period.
 * Returns the best non-entitling one when nothing entitles, so the billing
 * page can say "payment failed" instead of quietly showing Free.
 */
export function pickCurrent<T extends MirroredSubscription>(
  subscriptions: readonly T[],
  rank: (planKey: string | null) => number,
): T | null {
  let best: T | null = null;
  for (const sub of subscriptions) {
    if (!best) {
      best = sub;
      continue;
    }
    const a = [
      Number(isEntitling(sub.status)),
      rank(sub.plan_key),
      Date.parse(sub.current_period_end ?? "") || 0,
    ];
    const b = [
      Number(isEntitling(best.status)),
      rank(best.plan_key),
      Date.parse(best.current_period_end ?? "") || 0,
    ];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (a[i] > b[i]) best = sub;
        break;
      }
    }
  }
  return best;
}
