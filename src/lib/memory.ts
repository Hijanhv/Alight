// Memory layer for Lily & John.
//
// Provider-agnostic on purpose: `recall` + `remember` are exactly the two verbs
// Cognee (our chosen memory engine) exposes, so when a Cognee host is picked we
// swap the implementation behind this same interface (set MEMORY_PROVIDER=cognee)
// and nothing else in the app changes.
//
// Default engine ("supabase") keeps a small, private memory profile per person in
// your existing Supabase — $0, on your current serverless stack, no extra service.

import { getSupabaseAdmin } from "./supabase";
import { chatComplete, type LlmMessage } from "./llm";

export interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface MemoryStore {
  /** Return short memory snippets relevant to the current conversation. */
  recall(userId: string, query: string): Promise<string[]>;
  /** Fold a recent exchange into the person's long-term memory (best-effort). */
  remember(userId: string, turns: MemoryTurn[]): Promise<void>;
}

interface MemoryRow {
  summary: string | null;
  facts: string[] | null;
  recent: string[] | null;
}

// ---------- Supabase-backed memory (default) ----------
class SupabaseMemory implements MemoryStore {
  async recall(userId: string): Promise<string[]> {
    const sb = getSupabaseAdmin();
    if (!sb || !userId) return [];
    const { data, error } = await sb
      .from("user_memory")
      .select("summary,facts,recent")
      .eq("user_id", userId)
      .maybeSingle<MemoryRow>();
    if (error || !data) return [];

    const out: string[] = [];
    if (data.summary) out.push(data.summary);
    if (Array.isArray(data.facts) && data.facts.length) {
      out.push("Things you know about them: " + data.facts.slice(0, 10).join("; "));
    }
    if (!out.length && Array.isArray(data.recent) && data.recent.length) {
      out.push("Recently they mentioned: " + data.recent.slice(-5).join(" | "));
    }
    return out;
  }

  async remember(userId: string, turns: MemoryTurn[]): Promise<void> {
    const sb = getSupabaseAdmin();
    if (!sb || !userId || !turns.length) return;

    const { data } = await sb
      .from("user_memory")
      .select("summary,facts,recent")
      .eq("user_id", userId)
      .maybeSingle<MemoryRow>();

    const prevSummary = data?.summary ?? "";
    const prevFacts = Array.isArray(data?.facts) ? data!.facts! : [];
    const prevRecent = Array.isArray(data?.recent) ? data!.recent! : [];

    // Cheap, always-on continuity: a bounded log of the person's own lines.
    const userLines = turns
      .filter((t) => t.role === "user")
      .map((t) => t.content.slice(0, 240));
    const recent = [...prevRecent, ...userLines].slice(-12);

    // Richer memory only when a free LLM is configured; otherwise keep prior notes.
    let summary = prevSummary;
    let facts = prevFacts;
    const distilled = await distill(prevSummary, prevFacts, turns);
    if (distilled) {
      summary = distilled.summary || prevSummary;
      facts = distilled.facts.length ? distilled.facts : prevFacts;
    }

    await sb.from("user_memory").upsert({
      user_id: userId,
      summary: summary || null,
      facts: facts.slice(0, 12),
      recent,
      updated_at: new Date().toISOString(),
    });
  }
}

// Ask the free LLM to fold the new exchange into updated notes.
async function distill(
  prevSummary: string,
  prevFacts: string[],
  turns: MemoryTurn[]
): Promise<{ summary: string; facts: string[] } | null> {
  const convo = turns
    .map((t) => `${t.role === "user" ? "Them" : "Friend"}: ${t.content}`)
    .join("\n");
  const sys: LlmMessage = {
    role: "system",
    content:
      "You maintain a small, private memory profile of a person so a caring friend can remember them across chats. " +
      "Given the previous notes and a new snippet of conversation, return UPDATED notes. " +
      "Keep only durable, useful things: their name, what they're going through, goals, preferences, and what seems to help them. " +
      "Do not store clinical or sensitive detail beyond what a kind friend would naturally remember. " +
      'Respond ONLY as compact JSON: {"summary":"2-4 sentences, third person","facts":["short fact", ...]}. Max 10 facts.',
  };
  const user: LlmMessage = {
    role: "user",
    content:
      `Previous summary: ${prevSummary || "(none)"}\n` +
      `Previous facts: ${prevFacts.join("; ") || "(none)"}\n\n` +
      `New conversation:\n${convo}`,
  };
  const raw = await chatComplete([sys, user]);
  if (!raw) return null;
  return parseNotes(raw);
}

function parseNotes(raw: string): { summary: string; facts: string[] } | null {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as { summary?: unknown; facts?: unknown };
    const summary = typeof o.summary === "string" ? o.summary.slice(0, 600) : "";
    const facts = Array.isArray(o.facts)
      ? o.facts
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.slice(0, 160))
          .slice(0, 10)
      : [];
    if (!summary && !facts.length) return null;
    return { summary, facts };
  } catch {
    return null;
  }
}

let cached: MemoryStore | undefined;

export function getMemory(): MemoryStore {
  if (cached) return cached;
  // "cognee" is reserved for the Cognee engine once a host is chosen; until then
  // every provider resolves to the Supabase memory so the feature works today.
  cached = new SupabaseMemory();
  return cached;
}
