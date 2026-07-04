// Free, swappable LLM layer. Uses whichever key is configured:
//   GROQ_API_KEY   -> Groq (fast, free tier)   [recommended]
//   GEMINI_API_KEY -> Google Gemini (free tier)
// Returns null when nothing is configured or on error, so callers fall back
// to on-brand template replies and the app never hard-breaks.

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatComplete(messages: LlmMessage[]): Promise<string | null> {
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

async function callGroq(messages: LlmMessage[], key: string): Promise<string | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      temperature: 0.85,
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(messages: LlmMessage[], key: string): Promise<string | null> {
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
        generationConfig: { temperature: 0.85, maxOutputTokens: 300 },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}
