// Alight quiz: statements scored on a nervous-system model.
// Each statement loads onto one axis:
//   "wired"    = sympathetic / hyperarousal (racing, tense, restless)
//   "shutdown" = dorsal-vagal / hypoarousal (numb, foggy, avoidant, flat)
// Answers: 2 = "Yes, often", 1 = "Sometimes", 0 = "Rarely".

export type Axis = "wired" | "shutdown";

export interface Question {
  id: string;
  text: string;
  axis: Axis;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export const sections: Section[] = [
  {
    id: "body",
    title: "Your body",
    questions: [
      { id: "b1", text: "My heart races or my chest feels tight, even when nothing is wrong.", axis: "wired" },
      { id: "b2", text: "I carry tension in my jaw, neck, or shoulders.", axis: "wired" },
      { id: "b3", text: "My breathing is shallow, or I catch myself holding my breath.", axis: "wired" },
      { id: "b4", text: "I feel restless and on edge — I can't quite sit still.", axis: "wired" },
      { id: "b5", text: "My stomach is often unsettled: knots, bloating, or nausea.", axis: "wired" },
      { id: "b6", text: "My body feels heavy and drained, like it wants to shut down.", axis: "shutdown" },
    ],
  },
  {
    id: "mind",
    title: "Your mind",
    questions: [
      { id: "m1", text: "My mind races with thoughts I can't switch off.", axis: "wired" },
      { id: "m2", text: "Even simple tasks feel overwhelming before I begin.", axis: "shutdown" },
      { id: "m3", text: "I look at my to-do list and feel a wave of dread.", axis: "shutdown" },
      { id: "m4", text: "My inner voice is harsh — I am hard on myself.", axis: "wired" },
      { id: "m5", text: "I feel guilty when I rest or do nothing.", axis: "wired" },
      { id: "m6", text: "I feel foggy or blank, like I can't think clearly.", axis: "shutdown" },
    ],
  },
  {
    id: "patterns",
    title: "Your patterns",
    questions: [
      { id: "p1", text: "I reach for my phone to escape a feeling or a task.", axis: "shutdown" },
      { id: "p2", text: "Under pressure I freeze or go blank.", axis: "shutdown" },
      { id: "p3", text: "I put things off until panic finally forces me to act.", axis: "wired" },
      { id: "p4", text: "I avoid opening important messages or emails.", axis: "shutdown" },
      { id: "p5", text: "I feel numb or disconnected — just going through the motions.", axis: "shutdown" },
      { id: "p6", text: "My drive and motivation have quietly dropped off.", axis: "shutdown" },
    ],
  },
];

export const allQuestions: Question[] = sections.flatMap((s) => s.questions);

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
    "Breathe out for six — a longer exhale keeps you calm and steady.",
    "Repeat four times to protect the regulated state you are already in.",
  ],
};

export const resultTypes: Record<string, ResultType> = {
  wired: {
    key: "wired",
    name: "The Wired Freezer",
    tagline: "Your survival mode runs hot.",
    what:
      "Your nervous system is stuck in high sympathetic arousal — racing thoughts, tension, restlessness. Tasks feel like threats, so you spin, avoid, then crash. You don't need more pressure. You need to discharge the charge first.",
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
      "Your nervous system has dropped into dorsal-vagal shutdown — numb, foggy, heavy, disconnected. This isn't laziness; it's a protective freeze. The way out is gentle activation, not force: small cues of safety and movement that lift you back up.",
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
      "You swing between racing and numb — revved up and running on empty at the same time. Your system is carrying too much load to regulate on its own. The move is to discharge the charge, then gently orient, before asking anything of yourself.",
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
    tagline: "Mostly regulated — let's protect it.",
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

  for (const q of allQuestions) {
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
