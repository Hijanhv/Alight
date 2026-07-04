import { resultTypes, type Protocol } from "./quiz-data";

// Extra guided resets so the daily loop varies across sessions.
// The signature protocol from the quiz result is always first (index 0),
// so a returning user's first app reset matches what they saw in their result.
const EXTRA: Record<string, Protocol[]> = {
  wired: [
    {
      name: "Long-Exhale Breathing",
      seconds: 90,
      steps: [
        "Breathe in through your nose for a slow count of 4.",
        "Breathe out through your mouth for a count of 8.",
        "The long exhale is the signal — it tells your body the threat has passed.",
        "Repeat for six rounds.",
      ],
    },
    {
      name: "Cool the System",
      seconds: 60,
      steps: [
        "Run your wrists under cold water for 20–30 seconds.",
        "Or press a cool, damp cloth over your cheeks and eyes.",
        "Cold on the face triggers the calming dive reflex.",
        "Take three slow breaths as the heat drains out.",
      ],
    },
  ],
  shutdown: [
    {
      name: "Shake It Loose",
      seconds: 90,
      steps: [
        "Stand up and gently bounce on your heels for 20 seconds.",
        "Shake out your hands, then your arms, then your legs.",
        "Let it be a little sloppy — you are discharging stuck energy.",
        "Finish with one big breath and a stretch upward.",
      ],
    },
    {
      name: "Hum & Wake the Vagus",
      seconds: 60,
      steps: [
        "Take a comfortable breath in.",
        "On the exhale, hum a low, steady note until you run out of air.",
        "Feel the buzz in your chest and throat.",
        "Repeat four times — humming tones the vagus nerve.",
      ],
    },
  ],
  overloaded: [
    {
      name: "Feet, Breath, Look",
      seconds: 90,
      steps: [
        "Press both feet flat and feel the floor hold you.",
        "Two long exhales, each slower than the inhale before it.",
        "Slowly look left, then right, letting your eyes lead.",
        "One thing. One small step. That is all for now.",
      ],
    },
  ],
  steady: [
    {
      name: "Coherence Breathing",
      seconds: 90,
      steps: [
        "Breathe in for a slow count of 5.",
        "Breathe out for a slow count of 5.",
        "Keep the rhythm even and unforced.",
        "Six breaths like this keeps your system in its calm, open zone.",
      ],
    },
    {
      name: "Catch a Glimmer",
      seconds: 60,
      steps: [
        "Look around for one small good thing — light, warmth, a sound you like.",
        "Rest your attention on it for a few breaths.",
        "Let yourself actually feel the tiny lift.",
        "Glimmers gently train your system toward safety.",
      ],
    },
  ],
};

export function protocolsFor(state: string): Protocol[] {
  const base = resultTypes[state]?.protocol;
  const extras = EXTRA[state] ?? [];
  if (base) return [base, ...extras];
  return extras.length ? extras : [resultTypes.wired.protocol];
}

export function pickProtocol(state: string, n: number): Protocol {
  const list = protocolsFor(state);
  const i = ((n % list.length) + list.length) % list.length;
  return list[i];
}
