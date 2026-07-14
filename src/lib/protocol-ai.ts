// Generates a personalized nervous-system regulation protocol from a person's
// quiz result, their context, and (RAG) what has helped similar sessions before.
// Falls back to the curated static protocol if the LLM is unavailable.
import { chatCompleteDetailed, type LlmMessage } from "./llm";
import { resultTypes } from "./quiz-data";

export interface AiProtocol {
  name: string;
  why: string;
  seconds: number;
  steps: string[];
}

export interface ProtocolInput {
  typeKey: string;
  regulationScore?: number;
  wired?: number;
  shutdown?: number;
  name?: string;
  context?: { childhood?: string; currentStress?: string; circumstances?: string[] };
  pastSessions?: string[];
}

export interface ProtocolOutput {
  protocol: AiProtocol;
  source: "ai" | "fallback";
  model?: string;
  provider?: string;
}

export async function generateProtocol(input: ProtocolInput): Promise<ProtocolOutput> {
  const base = resultTypes[input.typeKey] ?? resultTypes.wired;
  const fallback: AiProtocol = {
    name: base.protocol.name,
    why: base.what,
    seconds: base.protocol.seconds,
    steps: base.protocol.steps,
  };

  const sys: LlmMessage = {
    role: "system",
    content:
      "You are a somatic nervous-system regulation coach for Alight, an anti-procrastination app grounded in polyvagal ideas. " +
      "Design ONE short, safe, do-it-now regulation protocol personalized to this person's state. " +
      "It must be body-based (breath, movement, orienting, gentle touch, sound), take 60-180 seconds, and need no equipment. " +
      "Warm, plain, encouraging; no medical claims, no diagnosis, no supplements. " +
      'Respond ONLY as compact JSON: {"name":"short evocative title","why":"1-2 sentences on why this fits their state","seconds":90,"steps":["...","..."]}. Use 3-5 steps.',
  };

  const bits: string[] = [];
  bits.push(`Nervous-system type: ${input.typeKey} (${base.name}, ${base.tagline}).`);
  if (typeof input.regulationScore === "number")
    bits.push(`Regulation score: ${input.regulationScore}/100 (higher = more regulated).`);
  if (typeof input.wired === "number" && typeof input.shutdown === "number")
    bits.push(`Arousal profile: wired ${input.wired}%, shutdown ${input.shutdown}%.`);
  if (input.context?.currentStress) bits.push(`Current stress load: ${input.context.currentStress}.`);
  if (input.context?.childhood) bits.push(`Early-life stress / emotional distance: ${input.context.childhood}.`);
  if (input.context?.circumstances?.length)
    bits.push(`Life circumstances right now: ${input.context.circumstances.join(", ")}.`);
  if (input.pastSessions?.length)
    bits.push(`What has helped similar sessions before: ${input.pastSessions.slice(0, 4).join(" | ")}.`);
  if (input.name) bits.push(`Their first name is ${input.name}.`);

  const user: LlmMessage = { role: "user", content: bits.join("\n") };

  const r = await chatCompleteDetailed([sys, user]);
  if (!r) return { protocol: fallback, source: "fallback" };
  const parsed = parseProtocol(r.text);
  if (!parsed) return { protocol: fallback, source: "fallback", model: r.model, provider: r.provider };
  return { protocol: parsed, source: "ai", model: r.model, provider: r.provider };
}

function parseProtocol(raw: string): AiProtocol | null {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as {
      name?: unknown;
      why?: unknown;
      seconds?: unknown;
      steps?: unknown;
    };
    const name = typeof o.name === "string" ? o.name.slice(0, 80) : "";
    const why = typeof o.why === "string" ? o.why.slice(0, 400) : "";
    const seconds =
      typeof o.seconds === "number" && Number.isFinite(o.seconds)
        ? Math.min(300, Math.max(45, Math.round(o.seconds)))
        : 90;
    const steps = Array.isArray(o.steps)
      ? o.steps
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.slice(0, 240))
          .slice(0, 6)
      : [];
    if (!name || steps.length < 2) return null;
    return { name, why, seconds, steps };
  } catch {
    return null;
  }
}
