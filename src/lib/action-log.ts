// Governance / audit layer: every AI interaction is recorded — timestamp,
// input, output, model, provider, latency. Best-effort; never throws, never
// blocks a response.
import { getSupabaseAdmin } from "./supabase";

export interface ActionLogEntry {
  userId?: string;
  kind: "chat" | "protocol" | "memory_distill" | string;
  model?: string;
  source?: string; // 'groq' | 'gemini' | 'fallback'
  input?: unknown;
  output?: unknown;
  latencyMs?: number;
}

// Trim any large strings so the audit log stays lean.
function cap(v: unknown): unknown {
  if (typeof v === "string") return v.slice(0, 4000);
  return v;
}

export async function logAction(entry: ActionLogEntry): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb.from("ai_action_log").insert({
      user_id: entry.userId ?? null,
      kind: entry.kind,
      model: entry.model ?? null,
      source: entry.source ?? null,
      input: (cap(entry.input) as object) ?? null,
      output: (cap(entry.output) as object) ?? null,
      latency_ms: typeof entry.latencyMs === "number" ? Math.round(entry.latencyMs) : null,
    });
  } catch {
    /* audit logging is best-effort */
  }
}
