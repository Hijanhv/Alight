import { NextResponse, after } from "next/server";
import { generateProtocol } from "@/lib/protocol-ai";
import { recallSessions, storeSession } from "@/lib/session-memory";
import { logAction } from "@/lib/action-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  userId?: string;
  typeKey?: string;
  regulationScore?: number;
  wired?: number;
  shutdown?: number;
  name?: string;
  context?: { childhood?: string; currentStress?: string; circumstances?: string[] };
}

const TYPES = new Set(["wired", "shutdown", "overloaded", "steady"]);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const typeKey = TYPES.has(String(body.typeKey)) ? String(body.typeKey) : "wired";
  const userId = typeof body.userId === "string" ? body.userId.slice(0, 64) : "";
  const started = Date.now();

  // RAG: pull the most relevant past sessions for this nervous-system type.
  let pastSessions: string[] = [];
  try {
    const query = `Regulation for a ${typeKey} nervous system${
      body.context?.currentStress ? `, stress ${body.context.currentStress}` : ""
    }`;
    pastSessions = await recallSessions(typeKey, query, 4);
  } catch {
    /* RAG is best-effort */
  }

  const { protocol, source, model, provider } = await generateProtocol({
    typeKey,
    regulationScore: body.regulationScore,
    wired: body.wired,
    shutdown: body.shutdown,
    name: body.name,
    context: body.context,
    pastSessions,
  });
  const latencyMs = Date.now() - started;

  // Audit + remember this session after the response is sent.
  after(async () => {
    await logAction({
      userId,
      kind: "protocol",
      model,
      source: source === "ai" ? provider : "fallback",
      input: { typeKey, regulationScore: body.regulationScore, wired: body.wired, shutdown: body.shutdown, context: body.context },
      output: protocol,
      latencyMs,
    });
    await storeSession(
      userId,
      typeKey,
      `Protocol "${protocol.name}" (${protocol.seconds}s): ${protocol.steps.join(" ")}`.slice(0, 1000)
    );
  });

  return NextResponse.json({ protocol, source });
}
