"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import {
  allQuestions,
  sections,
  scoreQuiz,
  type ScoreResult,
} from "@/lib/quiz-data";

type Phase = "intro" | "quiz" | "email" | "result";

const OPTIONS = [
  { v: 2, label: "Yes, often", mark: "●" },
  { v: 1, label: "Sometimes", mark: "◐" },
  { v: 0, label: "Rarely", mark: "○" },
];

// Fire-and-forget lead capture — never blocks or breaks the quiz UI.
function saveLead(payload: Record<string, unknown>) {
  try {
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

function sectionOf(index: number) {
  let n = 0;
  for (const s of sections) {
    if (index < n + s.questions.length) return s.title;
    n += s.questions.length;
  }
  return sections[sections.length - 1].title;
}

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [chosenPlan, setChosenPlan] = useState("annual");
  const advancing = useRef(false);

  const total = allQuestions.length;
  const current = allQuestions[index];

  function pick(v: number) {
    if (advancing.current) return;
    advancing.current = true;
    setAnswers((a) => ({ ...a, [current.id]: v }));
    const last = index === total - 1;
    window.setTimeout(() => {
      if (last) setPhase("email");
      else setIndex((i) => i + 1);
      advancing.current = false;
    }, 240);
  }

  function back() {
    if (index === 0) setPhase("intro");
    else setIndex((i) => i - 1);
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const r = scoreQuiz(answers);
    setResult(r);
    saveLead({
      email,
      name,
      stage: "result",
      typeKey: r.type.key,
      regulationScore: r.regulationScore,
      wired: r.wired,
      shutdown: r.shutdown,
    });
    setPhase("result");
  }

  const progress =
    phase === "quiz"
      ? (index / total) * 100
      : phase === "email"
      ? 100
      : phase === "result"
      ? 100
      : 0;

  return (
    <div className="quiz-shell">
      <header className="nav quiz-topbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Alight home">
            <BrandMark />
            Alight
          </Link>
          {phase !== "result" && (
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              2-minute check-in
            </span>
          )}
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-card">
          {phase !== "intro" && (
            <>
              <div className="progress" aria-hidden="true">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-meta">
                <span>
                  {phase === "quiz"
                    ? sectionOf(index)
                    : phase === "email"
                    ? "Almost there"
                    : "Your result"}
                </span>
                <span>
                  {phase === "quiz" ? `${index + 1} of ${total}` : ""}
                </span>
              </div>
            </>
          )}

          {phase === "intro" && (
            <div className="q-enter" style={{ textAlign: "center", paddingTop: 24 }}>
              <div className="orb-wrap" style={{ maxWidth: 200 }} aria-hidden="true">
                <div className="orb-ring" />
                <div className="orb" />
              </div>
              <h1 className="display" style={{ fontSize: "clamp(1.9rem,5vw,2.6rem)", marginTop: 8 }}>
                What is really behind your procrastination?
              </h1>
              <p className="lede" style={{ margin: "18px auto 0", textAlign: "center" }}>
                18 quick statements about your body, mind, and habits. In two
                minutes you will get your nervous-system type and a reset you can
                use right now — free.
              </p>
              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: 30 }}
                onClick={() => {
                  setPhase("quiz");
                  setIndex(0);
                }}
              >
                Start the check-in
              </button>
              <p className="fineprint">Private · No account needed to see your result</p>
            </div>
          )}

          {phase === "quiz" && current && (
            <div className="q-enter" key={current.id} style={{ marginTop: 30 }}>
              <span className="q-section">{sectionOf(index)}</span>
              <p className="q-text">{current.text}</p>
              <div className="answers">
                {OPTIONS.map((o) => (
                  <button
                    key={o.v}
                    className={`answer${answers[current.id] === o.v ? " sel" : ""}`}
                    data-v={o.v}
                    onClick={() => pick(o.v)}
                  >
                    <span className="ico" aria-hidden="true">{o.mark}</span>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="q-nav">
                <button className="link-btn" onClick={back}>
                  ← Back
                </button>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  Answer honestly — there are no wrong answers
                </span>
              </div>
            </div>
          )}

          {phase === "email" && (
            <form className="q-enter" style={{ marginTop: 30 }} onSubmit={submitEmail}>
              <span className="q-section">Last step</span>
              <p className="q-text">Where should we send your results?</p>
              <p className="muted" style={{ marginTop: 12 }}>
                See your nervous-system type and first reset instantly. We will
                also email your results and early access to your full plan.
              </p>
              <div className="field">
                <label htmlFor="name">First name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jamie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} type="submit">
                Show my result
              </button>
              <p className="fineprint">
                No spam. Unsubscribe anytime. Alight is a wellbeing tool, not
                medical advice.
              </p>
            </form>
          )}

          {phase === "result" && result && (
            <Result
              result={result}
              name={name}
              submitted={submitted}
              onEarlyAccess={() => {
                setSubmitted(true);
                saveLead({
                  email,
                  name,
                  stage: "early_access",
                  planInterest: chosenPlan,
                  typeKey: result?.type.key,
                  regulationScore: result?.regulationScore,
                });
              }}
              chosenPlan={chosenPlan}
              setChosenPlan={setChosenPlan}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Result({
  result,
  name,
  submitted,
  onEarlyAccess,
  chosenPlan,
  setChosenPlan,
}: {
  result: ScoreResult;
  name: string;
  submitted: boolean;
  onEarlyAccess: () => void;
  chosenPlan: string;
  setChosenPlan: (p: string) => void;
}) {
  const [shown, setShown] = useState(0);
  const target = result.regulationScore;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const t = result.type;
  const circ = 2 * Math.PI * 52;
  const dash = (shown / 100) * circ;

  const plans = [
    { key: "monthly", t: "Monthly", p: "$6.99" },
    { key: "annual", t: "Annual", p: "$49" },
    { key: "lifetime", t: "Lifetime", p: "$99" },
  ];

  return (
    <div className="q-enter" style={{ marginTop: 26 }}>
      <div className="result-type">
        <div className="score-ring">
          <svg width="168" height="168" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div className="score-num">
              {shown}
              <small>/100</small>
            </div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>Regulation Score</div>
          </div>
        </div>

        <h1 className="display" style={{ fontSize: "clamp(1.8rem,4.6vw,2.5rem)", marginTop: 22 }}>
          {name ? `${name}, you are ` : "You are "}
          <span className="serif-em">{t.name}.</span>
        </h1>
        <p className="muted" style={{ marginTop: 8, fontSize: "1.05rem" }}>{t.tagline}</p>
      </div>

      <p className="measure" style={{ margin: "22px auto 0", color: "var(--ink-soft)" }}>
        {t.what}
      </p>

      <div className="protocol">
        <span className="kicker">Your first reset · free · {t.protocol.seconds}s</span>
        <h3 className="display" style={{ marginTop: 8 }}>{t.protocol.name}</h3>
        <ol>
          {t.protocol.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="locked">
        <h4>Unlock your full Alight plan</h4>
        <ul>
          {t.planFocus.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
          <li>Daily Regulate → Initiate → Win loop, matched to your state</li>
        </ul>

        <div className="plan-mini">
          {plans.map((p) => (
            <button
              key={p.key}
              className={chosenPlan === p.key ? "best" : ""}
              onClick={() => setChosenPlan(p.key)}
              type="button"
            >
              <div className="t">{p.t}</div>
              <div className="p">{p.p}</div>
            </button>
          ))}
        </div>

        {submitted ? (
          <p style={{ marginTop: 20, color: "var(--primary-strong)", fontWeight: 600 }}>
            You are on the early-access list. We will email your plan link the
            moment it opens. ✦
          </p>
        ) : (
          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 20 }}
            onClick={onEarlyAccess}
            type="button"
          >
            Get early access
          </button>
        )}
        <p className="fineprint">
          Alight is in early access — reserve your spot now, pay nothing today.
        </p>
      </div>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/" className="link-btn">← Back to home</Link>
      </p>
    </div>
  );
}
