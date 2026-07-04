import DodoPayments from "dodopayments";

export type PlanKey = "monthly" | "annual" | "lifetime";

export interface PlanConfig {
  label: string;
  productId: string | undefined;
  recurring: boolean;
  trialDays: number;
}

// Product IDs come from your Dodo dashboard (or are created via the API).
export const PLANS: Record<PlanKey, PlanConfig> = {
  monthly: { label: "Monthly", productId: process.env.DODO_PRODUCT_MONTHLY, recurring: true, trialDays: 7 },
  annual: { label: "Annual", productId: process.env.DODO_PRODUCT_ANNUAL, recurring: true, trialDays: 7 },
  lifetime: { label: "Lifetime", productId: process.env.DODO_PRODUCT_LIFETIME, recurring: false, trialDays: 0 },
};

export function isPlanKey(v: unknown): v is PlanKey {
  return v === "monthly" || v === "annual" || v === "lifetime";
}

// Returns null when Dodo is not configured yet, so callers degrade gracefully.
export function getDodo(): DodoPayments | null {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) return null;
  return new DodoPayments({
    bearerToken: key,
    environment: process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}

export function productToPlan(productId: string | undefined | null): PlanKey | null {
  if (!productId) return null;
  for (const k of Object.keys(PLANS) as PlanKey[]) {
    if (PLANS[k].productId && PLANS[k].productId === productId) return k;
  }
  return null;
}
