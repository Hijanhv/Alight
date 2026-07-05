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

// ---------- Cognee Cloud memory (knowledge-graph engine; opt-in) ----------
// Runs on Cognee's managed API (free tier, 1M tokens/mo) — Vercel just calls it
// over HTTPS, so nothing extra is self-hosted. Every call falls back to the
// Supabase memory on error so the app never hard-breaks.
function datasetFor(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 48) || "anon";
  return `alight_${safe}`;
}

function extractSearchText(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data
      .map((d) => extractSearchText(d))
      .filter(Boolean)
      .join(" ")
      .slice(0, 1200);
  }
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["search_result", "search_results", "result", "results", "answer", "text", "completion"]) {
      if (o[k]) return extractSearchText(o[k]);
    }
  }
  return "";
}

class CogneeMemory implements MemoryStore {
  private fallback: MemoryStore = new SupabaseMemory();
  constructor(private base: string, private key: string) {}

  private headers() {
    return { "Content-Type": "application/json", "X-Api-Key": this.key };
  }

  async recall(userId: string, query: string): Promise<string[]> {
    try {
      const res = await fetch(`${this.base}/api/v1/search`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          query: query || "Summarize what you know about this person.",
          search_type: process.env.COGNEE_SEARCH_TYPE || "GRAPH_COMPLETION",
          datasets: [datasetFor(userId)],
        }),
      });
      if (!res.ok) throw new Error(`cognee search ${res.status}`);
      const text = extractSearchText(await res.json());
      return text ? [text] : [];
    } catch (e) {
      console.error("[cognee] recall -> supabase fallback:", (e as Error).message);
      return this.fallback.recall(userId, query);
    }
  }

  async remember(userId: string, turns: MemoryTurn[]): Promise<void> {
    const text = turns
      .map((t) => `${t.role === "user" ? "Them" : "Friend"}: ${t.content}`)
      .join("\n")
      .slice(0, 6000);
    const dataset = datasetFor(userId);
    try {
      // /remember ingests + builds the knowledge graph in one call (multipart).
      const form = new FormData();
      form.append("data", new Blob([text], { type: "text/plain" }), "memory.txt");
      form.append("datasetName", dataset);
      const res = await fetch(`${this.base}/api/v1/remember`, {
        method: "POST",
        headers: { "X-Api-Key": this.key }, // let fetch set the multipart boundary
        body: form,
      });
      if (!res.ok) throw new Error(`cognee remember ${res.status}`);
    } catch (e) {
      console.error("[cognee] remember -> supabase fallback:", (e as Error).message);
      await this.fallback.remember(userId, turns);
    }
  }
}

// Hybrid: live chat reads from the fast primary store (instant), while every
// write ALSO flows into the graph store so Cognee's knowledge graph keeps
// building in the background — best of both, with no recall latency tax.
class HybridMemory implements MemoryStore {
  constructor(private primary: MemoryStore, private graph: MemoryStore) {}
  recall(userId: string, query: string): Promise<string[]> {
    return this.primary.recall(userId, query);
  }
  async remember(userId: string, turns: MemoryTurn[]): Promise<void> {
    await Promise.allSettled([
      this.primary.remember(userId, turns),
      this.graph.remember(userId, turns),
    ]);
  }
}

let cached: MemoryStore | undefined;

export function getMemory(): MemoryStore {
  if (cached) return cached;
  const provider = (process.env.MEMORY_PROVIDER || "supabase").toLowerCase();
  const cogKey = process.env.COGNEE_API_KEY;
  if (provider === "cognee" && cogKey) {
    const cognee = new CogneeMemory(
      (process.env.COGNEE_BASE_URL || "https://api.cognee.ai").replace(/\/+$/, ""),
      cogKey
    );
    // Instant Supabase reads for chat; Cognee graph built on writes.
    cached = new HybridMemory(new SupabaseMemory(), cognee);
  } else {
    cached = new SupabaseMemory();
  }
  return cached;
}
