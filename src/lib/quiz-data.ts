// Alight quiz: statements scored on a nervous-system model.
// Each statement loads onto one axis:
//   "wired"    = sympathetic / hyperarousal (racing, tense, restless)
//   "shutdown" = dorsal-vagal / hypoarousal (numb, foggy, avoidant, flat)
// Answers: 2 = "Yes, often", 1 = "Sometimes", 0 = "Rarely".

export type Axis = "wired" | "shutdown";

export interface Statement {
  id: string;
  text: string;
  axis: Axis;
}

// The agree-scale statements (answered "Yes, often" / "Sometimes" / "Rarely").
// Each loads onto one axis so we can tell a wired system from a shut-down one.
export const statements: Statement[] = [
  { id: "w1", text: "My body feels tense and I can't fully switch off.", axis: "wired" },
  { id: "w2", text: "My heart races or my breathing turns shallow.", axis: "wired" },
  { id: "w3", text: "I feel on edge, restless, wired, or easily agitated.", axis: "wired" },
  { id: "w4", text: "I overthink and replay things long after they're over.", axis: "wired" },
  { id: "w5", text: "My reactions jump from 0 to 100, small things hit hard.", axis: "wired" },
  { id: "w6", text: "After something stressful, it takes me ages to calm back down.", axis: "wired" },
  { id: "w7", text: "I push through until my body forces me to stop.", axis: "wired" },
  { id: "w8", text: "I clench my jaw or grind my teeth.", axis: "wired" },
  { id: "w9", text: "Stress stays stuck in my body for hours, sometimes a whole day.", axis: "wired" },
  { id: "w10", text: "Even with free time, I can't actually let myself rest.", axis: "wired" },
  { id: "w11", text: "I feel guilty whenever I rest or slow down.", axis: "wired" },
  { id: "w12", text: "I wake up stiff, tense, or restless rather than refreshed.", axis: "wired" },
  { id: "w13", text: "I crave sugar or carbs even when I'm not hungry.", axis: "wired" },
  { id: "s1", text: "Tasks that used to feel easy now feel overwhelming.", axis: "shutdown" },
  { id: "s2", text: "My mind feels exhausted or completely overloaded.", axis: "shutdown" },
  { id: "s3", text: "I hold everything together, but I have no one to lean on.", axis: "shutdown" },
  { id: "s4", text: "I find it hard to focus for any length of time.", axis: "shutdown" },
  { id: "s5", text: "I have no motivation for the things that are good for me.", axis: "shutdown" },
  { id: "s6", text: "I feel emotionally flat, numb, or drained.", axis: "shutdown" },
  { id: "s7", text: "My libido has dropped noticeably.", axis: "shutdown" },
  { id: "s8", text: "I feel stuck, not working, not resting, not even really procrastinating.", axis: "shutdown" },
  { id: "s9", text: "I scroll my phone for hours to avoid my own thoughts.", axis: "shutdown" },
  { id: "s10", text: "I feel most at ease when I'm distracted or a little checked-out.", axis: "shutdown" },
  { id: "s11", text: "I feel bloated or heavy after eating.", axis: "shutdown" },
  { id: "s12", text: "My digestion feels unpredictable.", axis: "shutdown" },
  { id: "s13", text: "I need more sleep but never wake up rested.", axis: "shutdown" },
  { id: "s14", text: "I'm tired and low on energy because my mind is worn out.", axis: "shutdown" },
  { id: "s15", text: "I feel like I look older or more worn-down than I should.", axis: "shutdown" },
  { id: "s16", text: "When I'm overwhelmed, I withdraw and isolate myself.", axis: "shutdown" },
  { id: "s17", text: "I have no drive left. I'm running on survival mode.", axis: "shutdown" },
];

// Context questions (not scored; they personalize the result and lead)

export interface Choice {
  value: string;
  label: string;
}

export const genderQuestion = {
  id: "gender",
  text: "Which best describes you?",
  options: [
    { value: "woman", label: "Woman" },
    { value: "man", label: "Man" },
  ] as Choice[],
};

const scaleFour: Choice[] = [
  { value: "yes", label: "Yes" },
  { value: "sometimes", label: "Sometimes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Hard to say" },
];

export const childhoodQuestion = {
  id: "childhood",
  text: "Growing up, did you go through ongoing stress or emotional distance?",
  help: "This shapes how your nervous system first learned to respond. There is no wrong answer.",
  options: scaleFour,
};

export const currentStressQuestion = {
  id: "currentStress",
  text: "Is there extra stress weighing on you right now?",
  help: "Money, work, relationships, health, anything adding load.",
  options: scaleFour,
};

export const circumstanceQuestion = {
  id: "circumstances",
  text: "Is any of this part of your life at the moment?",
  help: "Select all that apply. It helps us understand the load you're carrying.",
  options: [
    { value: "trauma", label: "Healing from trauma" },
    { value: "finances", label: "Financial difficulties" },
    { value: "loneliness", label: "Loneliness or isolation" },
    { value: "relationship", label: "Relationship issues" },
    { value: "parenthood", label: "Parenthood" },
    { value: "health", label: "Health issues" },
    { value: "caregiving", label: "Caring for aging parents" },
    { value: "none", label: "None of the above" },
  ] as Choice[],
};

export interface Protocol {
  name: string;
  seconds: number;
  steps: string[];
}

export interface ResultType {
  key: string;
  name: string;
  tagline: string;
  what: string; // what's happening in the nervous system
  protocol: Protocol;
  planFocus: string[]; // teaser of the locked full plan
}

const SIGH: Protocol = {
  name: "The Physiological Sigh",
  seconds: 90,
  steps: [
    "Inhale slowly through your nose until your lungs feel full.",
    "At the top, sip in one more short breath through your nose.",
    "Let a long, slow breath out through your mouth.",
    "Repeat five times. This is the fastest known way to downshift a wired system.",
  ],
};

const ORIENT: Protocol = {
  name: "Orient & Rise",
  seconds: 120,
  steps: [
    "Slowly turn your head and let your eyes wander the room.",
    "Name five things you can see, out loud if you can.",
    "Stand up and gently shake out your hands, arms, and legs for 30 seconds.",
    "Take one warm breath. You have nudged your system up out of shutdown.",
  ],
};

const COMBINE: Protocol = {
  name: "Sigh, then Orient",
  seconds: 120,
  steps: [
    "Do two physiological sighs: double inhale through the nose, long exhale through the mouth.",
    "Then slowly look around and name five things you can see.",
    "Roll your shoulders and shake out your hands for 20 seconds.",
    "One task. One small first step. Begin.",
  ],
};

const ANCHOR: Protocol = {
  name: "The Anchor Breath",
  seconds: 60,
  steps: [
    "Breathe in for a count of four.",
    "Hold gently for four.",
    "Breathe out for six. A longer exhale keeps you calm and steady.",
    "Repeat four times to protect the regulated state you are already in.",
  ],
};

export const resultTypes: Record<string, ResultType> = {
  wired: {
    key: "wired",
    name: "The Wired Freezer",
    tagline: "Your survival mode runs hot.",
    what:
      "Your nervous system is stuck in high sympathetic arousal: racing thoughts, tension, restlessness. Tasks feel like threats, so you spin, avoid, then crash. You don't need more pressure. You need to discharge the charge first.",
    protocol: SIGH,
    planFocus: [
      "Fast downshift resets for the moments before a task",
      "An evening wind-down so tomorrow doesn't start in overdrive",
      "Tiny starts that feel safe to a revved-up system",
    ],
  },
  shutdown: {
    key: "shutdown",
    name: "The Shutdown Freezer",
    tagline: "Your survival mode goes quiet.",
    what:
      "Your nervous system has dropped into dorsal-vagal shutdown: numb, foggy, heavy, disconnected. This isn't laziness; it's a protective freeze. The way out is gentle activation, not force: small cues of safety and movement that lift you back up.",
    protocol: ORIENT,
    planFocus: [
      "Gentle activation resets that lift you out of the fog",
      "Micro-starts small enough to bypass the freeze",
      "Reconnection practices to bring drive and feeling back online",
    ],
  },
  overloaded: {
    key: "overloaded",
    name: "The Overloaded Freezer",
    tagline: "Wired and shut down at once.",
    what:
      "You swing between racing and numb, revved up and running on empty at the same time. Your system is carrying too much load to regulate on its own. The move is to discharge the charge, then gently orient, before asking anything of yourself.",
    protocol: COMBINE,
    planFocus: [
      "A two-step reset for when you're wired and drained together",
      "Load-shedding routines to stop the swing",
      "One-thing-at-a-time starts to rebuild capacity",
    ],
  },
  steady: {
    key: "steady",
    name: "The Steady Starter",
    tagline: "Mostly regulated. Let's protect it.",
    what:
      "Your nervous system is regulated more often than not. Procrastination, when it shows up, is more habit than freeze. Alight helps you guard this calm and turn it into consistent, easy starts.",
    protocol: ANCHOR,
    planFocus: [
      "Anchor practices to protect your regulated baseline",
      "Frictionless starts that turn calm into momentum",
      "Early-warning check-ins to catch stress before it stacks",
    ],
  },
};

export interface ScoreResult {
  regulationScore: number; // 0-100, higher = more regulated
  type: ResultType;
  wired: number;
  shutdown: number;
}

export function scoreQuiz(answers: Record<string, number>): ScoreResult {
  let total = 0;
  let maxTotal = 0;
  let wired = 0;
  let wiredMax = 0;
  let shutdown = 0;
  let shutdownMax = 0;

  for (const q of statements) {
    const v = answers[q.id] ?? 0;
    total += v;
    maxTotal += 2;
    if (q.axis === "wired") {
      wired += v;
      wiredMax += 2;
    } else {
      shutdown += v;
      shutdownMax += 2;
    }
  }

  // higher score = more dysregulation, so regulation is the inverse
  const regulationScore = Math.round(100 * (1 - total / maxTotal));

  const wiredNorm = wiredMax ? wired / wiredMax : 0;
  const shutdownNorm = shutdownMax ? shutdown / shutdownMax : 0;
  const load = total / maxTotal;

  let key: string;
  if (load < 0.28) {
    key = "steady";
  } else if (wiredNorm >= 0.5 && shutdownNorm >= 0.5) {
    key = "overloaded";
  } else if (wiredNorm >= shutdownNorm) {
    key = "wired";
  } else {
    key = "shutdown";
  }

  return {
    regulationScore,
    type: resultTypes[key],
    wired: Math.round(wiredNorm * 100),
    shutdown: Math.round(shutdownNorm * 100),
  };
}
