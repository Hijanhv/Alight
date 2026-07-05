// Free, swappable LLM layer. Uses whichever key is configured:
//   GROQ_API_KEY   -> Groq (fast, free tier)   [recommended for chat]
//   GEMINI_API_KEY -> Google Gemini (free tier; also powers embeddings)
// Returns null when nothing is configured or on error, so callers fall back
// to on-brand template replies and the app never hard-breaks.

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmResult {
  text: string;
  provider: "groq" | "gemini";
  model: string;
}

// Detailed variant — returns which provider/model answered (for the audit log).
export async function chatCompleteDetailed(
  messages: LlmMessage[]
): Promise<LlmResult | null> {
  const groq = process.env.GROQ_API_KEY;
  const gemini = process.env.GEMINI_API_KEY;
  try {
    if (groq) return await callGroq(messages, groq);
    if (gemini) return await callGemini(messages, gemini);
  } catch (e) {
    console.error("[llm] error:", (e as Error).message);
  }
  return null;
}

// Text-only convenience wrapper (backwards compatible).
export async function chatComplete(messages: LlmMessage[]): Promise<string | null> {
  const r = await chatCompleteDetailed(messages);
  return r ? r.text : null;
}

async function callGroq(messages: LlmMessage[], key: string): Promise<LlmResult | null> {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.85, max_tokens: 500 }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text ? { text, provider: "groq", model } : null;
}

async function callGemini(messages: LlmMessage[], key: string): Promise<LlmResult | null> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: { temperature: 0.85, maxOutputTokens: 500 },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text ? { text, provider: "gemini", model } : null;
}

// ---------- Embeddings (for pgvector session memory) ----------
// Groq has no embeddings endpoint, so this uses Google's free text-embedding-004
// (768-dim) when GEMINI_API_KEY is set. Returns null otherwise, and the vector
// memory degrades to recency-based recall until a key is present.
export interface EmbedResult {
  vector: number[];
  model: string;
}

export async function embed(text: string): Promise<EmbedResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !text.trim()) return null;
  const model = process.env.EMBEDDING_MODEL || "text-embedding-004";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: text.slice(0, 8000) }] },
        }),
      }
    );
    if (!res.ok) throw new Error(`embed ${res.status}`);
    const data = (await res.json()) as { embedding?: { values?: number[] } };
    const vector = data.embedding?.values;
    return Array.isArray(vector) && vector.length ? { vector, model } : null;
  } catch (e) {
    console.error("[embed] error:", (e as Error).message);
    return null;
  }
}
