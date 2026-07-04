import { NextResponse } from "next/server";
import { getDodo, PLANS, isPlanKey } from "@/lib/dodo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { plan?: string; email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  if (!isPlanKey(body.plan)) {
    return NextResponse.json({ ok: false, reason: "bad_plan" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, reason: "bad_email" }, { status: 400 });
  }

  const dodo = getDodo();
  const cfg = PLANS[body.plan];
  if (!dodo || !cfg.productId) {
    // Payments not configured yet — the client falls back to early-access capture.
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  const params: Record<string, unknown> = {
    product_cart: [{ product_id: cfg.productId, quantity: 1 }],
    customer: body.name ? { email, name: body.name } : { email },
    return_url: `${origin}/checkout/success`,
  };
  if (cfg.recurring) {
    params.subscription_data = { trial_period_days: cfg.trialDays };
  }

  try {
    // Cast: the SDK owns the request type; shape is per Dodo's docs.
    const session = await dodo.checkoutSessions.create(params as never);
    return NextResponse.json({ ok: true, url: (session as { checkout_url: string }).checkout_url });
  } catch (e) {
    console.error("[checkout] error:", (e as Error).message);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
