import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LeadBody {
  email?: string;
  name?: string;
  typeKey?: string;
  regulationScore?: number;
  wired?: number;
  shutdown?: number;
  planInterest?: string;
  stage?: string;
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // No Supabase configured yet — log so nothing is silently lost, and let the UI continue.
    console.log("[lead] (no Supabase configured)", {
      email,
      name: body.name,
      stage: body.stage,
    });
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("leads").insert({
    email,
    name: body.name ?? null,
    type_key: body.typeKey ?? null,
    regulation_score: body.regulationScore ?? null,
    wired: body.wired ?? null,
    shutdown: body.shutdown ?? null,
    plan_interest: body.planInterest ?? null,
    stage: body.stage ?? null,
    source: "quiz",
  });

  if (error) {
    console.error("[lead] insert error:", error.message);
    return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
