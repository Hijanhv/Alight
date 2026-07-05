// Vector session memory (RAG). Stores short notes per nervous-system type with
// an embedding, and retrieves the most similar past sessions to ground new AI
// output. Semantic search runs when embeddings are available (GEMINI_API_KEY);
// otherwise it degrades to recency-based recall for that type.
import { getSupabaseAdmin } from "./supabase";
import { embed } from "./llm";

export async function storeSession(
  userId: string,
  nsType: string,
  content: string
): Promise<void> {
  const sb = getSupabaseAdmin();
  const text = content.trim();
  if (!sb || !text) return;
  let embedding: number[] | null = null;
  const e = await embed(text);
  if (e) embedding = e.vector;
  try {
    await sb.from("session_memory").insert({
      user_id: userId || null,
      ns_type: nsType || null,
      content: text.slice(0, 2000),
      embedding,
    });
  } catch {
    /* best-effort */
  }
}

export async function recallSessions(
  nsType: string,
  query: string,
  k = 4
): Promise<string[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  // Semantic retrieval when we can embed the query.
  const e = await embed(query);
  if (e) {
    try {
      const { data, error } = await sb.rpc("match_session_memory", {
        query_embedding: e.vector,
        match_ns_type: nsType || null,
        match_count: k,
      });
      if (!error && Array.isArray(data) && data.length) {
        return (data as { content: string }[]).map((r) => r.content);
      }
    } catch {
      /* fall through to recency */
    }
  }

  // Fallback: most recent notes for this nervous-system type.
  try {
    let q = sb
      .from("session_memory")
      .select("content")
      .order("created_at", { ascending: false })
      .limit(k);
    if (nsType) q = q.eq("ns_type", nsType);
    const { data } = await q;
    return Array.isArray(data) ? (data as { content: string }[]).map((r) => r.content) : [];
  } catch {
    return [];
  }
}
