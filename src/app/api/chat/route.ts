import { NextResponse, after } from "next/server";
import { FRIENDS, isFriendKey } from "@/lib/friends";
import { chatCompleteDetailed, type LlmMessage } from "@/lib/llm";
import { getMemory, type MemoryTurn } from "@/lib/memory";
import { logAction } from "@/lib/action-log";
import { storeSession } from "@/lib/session-memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Used when no free AI key is configured yet — keeps the friends usable.
const FALLBACKS: Record<string, string[]> = {
  lily: [
    "I hear you. That sounds like a lot to be holding — let's slow it down together. What feels heaviest right now?",
    "Thank you for telling me. You don't have to have it all figured out. What would feel kind to you in this moment?",
    "That makes so much sense. Take a slow breath with me — in through your nose, longer out through your mouth. I'm right here.",
    "You're allowed to feel this. Nothing's wrong with you. What's one small thing that would make the next hour a little softer?",
  ],
  john: [
    "Okay. Let's not try to fix everything — just the next small step. What's one tiny thing you could start in the next two minutes?",
    "Got it. Overwhelm usually means the task is too big in your head. What's the smallest possible version of it?",
    "Fair enough. Before we plan anything — shake your hands out, take one slow breath. Now: what's the one thing that matters most today?",
    "That's real. You're not behind, you're stuck — different problem. Name the very first move and we'll start there.",
  ],
};

interface Body {
  friend?: string;
  messages?: { role?: string; content?: string }[];
  profile?: { typeKey?: string; name?: string };
  userId?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const friend = isFriendKey(body.friend) ? body.friend : "lily";
  const persona = FRIENDS[friend];
  const userId = typeof body.userId === "string" ? body.userId.slice(0, 64) : "";

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .slice(-16)
    .map<LlmMessage>((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 2000),
    }));

  if (!history.length) {
    return NextResponse.json({ error: "no message" }, { status: 400 });
  }

  // Recall what we already know about this person (best-effort).
  let memorySnippets: string[] = [];
  if (userId) {
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    try {
      memorySnippets = await getMemory().recall(userId, lastUser?.content ?? "");
    } catch {
      /* memory is best-effort — never block a reply */
    }
  }

  let ctx = "";
  if (body.profile?.name) ctx += `The person's name is ${body.profile.name}. `;
  if (body.profile?.typeKey)
    ctx += `Their nervous-system pattern from the Alight quiz is "${body.profile.typeKey}". `;
  if (memorySnippets.length)
    ctx += `What you remember about them from past chats: ${memorySnippets.join(" ")} `;

  const messages: LlmMessage[] = [
    { role: "system", content: persona.system + (ctx ? `\n\nContext: ${ctx}` : "") },
    ...history,
  ];

  const started = Date.now();
  const detail = await chatCompleteDetailed(messages);
  const latencyMs = Date.now() - started;
  const pool = FALLBACKS[friend];
  const reply = detail?.text ?? pool[Math.floor(Math.random() * pool.length)];
  const source = detail ? "ai" : "fallback";
  const lastUserContent =
    [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  // After the reply is sent (so the person never waits): audit-log the
  // interaction, fold it into long-term memory, and store it in the vector
  // session memory. Cognee plugs in behind remember() when a host is chosen.
  after(async () => {
    await logAction({
      userId,
      kind: "chat",
      model: detail?.model,
      source: detail ? detail.provider : "fallback",
      input: { friend, message: lastUserContent },
      output: reply,
      latencyMs,
    });
    if (userId) {
      const turns: MemoryTurn[] = [
        ...history.map(
          (m): MemoryTurn => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })
        ),
        { role: "assistant" as const, content: reply },
      ].slice(-8);
      await getMemory().remember(userId, turns).catch(() => {});
      if (lastUserContent && body.profile?.typeKey) {
        await storeSession(userId, String(body.profile.typeKey), lastUserContent);
      }
    }
  });

  return NextResponse.json({ reply, source });
}
