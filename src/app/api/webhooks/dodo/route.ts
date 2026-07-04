import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { getSupabaseAdmin } from "@/lib/supabase";
import { productToPlan } from "@/lib/dodo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.DODO_WEBHOOK_KEY;
  const raw = await req.text();

  if (!secret) {
    console.log("[dodo webhook] no DODO_WEBHOOK_KEY set; ignoring event");
    return NextResponse.json({ received: false, reason: "not_configured" });
  }

  const wh = new Webhook(secret);
  const webhookHeaders = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  try {
    await wh.verify(raw, webhookHeaders);
  } catch {
    return NextResponse.json({ received: false, reason: "bad_signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const type: string = event?.type || "";
  const data = event?.data || {};

  if (type === "payment.succeeded" || type === "subscription.active") {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const productId = data?.product_id || data?.product_cart?.[0]?.product_id || null;
      const { error } = await supabase.from("purchases").insert({
        email: (data?.customer?.email || "").toLowerCase() || null,
        plan: productToPlan(productId),
        product_id: productId,
        dodo_payment_id: data?.payment_id || null,
        dodo_subscription_id: data?.subscription_id || null,
        status: data?.status || type,
        amount: data?.total_amount ?? data?.amount ?? null,
        raw: event,
      });
      if (error) console.error("[dodo webhook] purchase insert error:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}
