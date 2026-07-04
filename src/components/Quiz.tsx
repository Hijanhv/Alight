"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import {
  statements,
  genderQuestion,
  childhoodQuestion,
  currentStressQuestion,
  circumstanceQuestion,
  scoreQuiz,
  type Choice,
  type ScoreResult,
} from "@/lib/quiz-data";
import { saveProfile } from "@/lib/progress";

type Phase =
  | "intro"
  | "gender"
  | "quiz"
  | "childhood"
  | "current"
  | "circumstances"
  | "details"
  | "result";

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

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [gender, setGender] = useState("");
  const [childhood, setChildhood] = useState("");
  const [currentStress, setCurrentStress] = useState("");
  const [circumstances, setCircumstances] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const advancing = useRef(false);

  const total = statements.length;
  const current = statements[index];

  // Advance a single-select screen after a brief highlight beat.
  function advance(next: () => void) {
    if (advancing.current) return;
    advancing.current = true;
    window.setTimeout(() => {
      next();
      advancing.current = false;
    }, 240);
  }

  function pickStatement(v: number) {
    setAnswers((a) => ({ ...a, [current.id]: v }));
    const last = index === total - 1;
    advance(() => (last ? setPhase("childhood") : setIndex((i) => i + 1)));
  }

  function back() {
    if (phase === "gender") setPhase("intro");
    else if (phase === "quiz") {
      if (index === 0) setPhase("gender");
      else setIndex((i) => i - 1);
    } else if (phase === "childhood") setPhase("quiz");
    else if (phase === "current") setPhase("childhood");
    else if (phase === "circumstances") setPhase("current");
    else if (phase === "details") setPhase("circumstances");
  }

  function toggleCircumstance(value: string) {
    setCircumstances((prev) => {
      if (value === "none") return prev.includes("none") ? [] : ["none"];
      const without = prev.filter((v) => v !== "none");
      return without.includes(value)
        ? without.filter((v) => v !== value)
        : [...without, value];
    });
  }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const r = scoreQuiz(answers);
    setResult(r);
    const ageNum = age.trim() ? Number(age) : undefined;
    const context = { childhood, currentStress, circumstances };
    saveProfile({
      typeKey: r.type.key,
      name,
      regulationScore: r.regulationScore,
      createdAt: new Date().toISOString(),
      gender: gender || undefined,
      age: Number.isFinite(ageNum) ? ageNum : undefined,
      context,
    });
    saveLead({
      email,
      name,
      stage: "result",
      typeKey: r.type.key,
      regulationScore: r.regulationScore,
      wired: r.wired,
      shutdown: r.shutdown,
      gender: gender || undefined,
      age: Number.isFinite(ageNum) ? ageNum : undefined,
      context,
    });
    setPhase("result");
  }

  const progress =
    phase === "gender"
      ? 4
      : phase === "quiz"
      ? 6 + (index / total) * 74
      : phase === "childhood"
      ? 84
      : phase === "current"
      ? 88
      : phase === "circumstances"
      ? 92
      : phase === "details"
      ? 97
      : phase === "result"
      ? 100
      : 0;

  const stepLabel =
    phase === "quiz"
      ? "About you right now"
      : phase === "gender"
      ? "Getting started"
      : phase === "childhood" || phase === "current"
      ? "A little background"
      : phase === "circumstances"
      ? "Your world right now"
      : phase === "details"
      ? "Almost there"
      : "Your result";

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
                <span>{stepLabel}</span>
                <span>{phase === "quiz" ? `${index + 1} of ${total}` : ""}</span>
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
                A short, honest check-in about your body, mind, and daily
                patterns. In about two minutes you will get your nervous-system
                type and a reset you can use right now — free.
              </p>
              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: 30 }}
                onClick={() => setPhase("gender")}
              >
                Start the check-in
              </button>
              <p className="fineprint">Private · No account needed to see your result</p>
            </div>
          )}

          {phase === "gender" && (
            <div className="q-enter" style={{ marginTop: 30 }}>
              <span className="q-section">{stepLabel}</span>
              <p className="q-text">{genderQuestion.text}</p>
              <div className="answers">
                {genderQuestion.options.map((o) => (
                  <button
                    key={o.value}
                    className={`answer${gender === o.value ? " sel" : ""}`}
                    onClick={() => {
                      setGender(o.value);
                      advance(() => setPhase("quiz"));
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="q-nav">
                <button className="link-btn" onClick={back}>← Back</button>
              </div>
            </div>
          )}

          {phase === "quiz" && current && (
            <div className="q-enter" key={current.id} style={{ marginTop: 30 }}>
              <span className="q-section">How true does this feel lately?</span>
              <p className="q-text">{current.text}</p>
              <div className="answers">
                {OPTIONS.map((o) => (
                  <button
                    key={o.v}
                    className={`answer${answers[current.id] === o.v ? " sel" : ""}`}
                    data-v={o.v}
                    onClick={() => pickStatement(o.v)}
                  >
                    <span className="ico" aria-hidden="true">{o.mark}</span>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="q-nav">
                <button className="link-btn" onClick={back}>← Back</button>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  Answer honestly — there are no wrong answers
                </span>
              </div>
            </div>
          )}

          {phase === "childhood" && (
            <ContextSingle
              q={childhoodQuestion}
              value={childhood}
              onPick={(v) => {
                setChildhood(v);
                advance(() => setPhase("current"));
              }}
              onBack={back}
            />
          )}

          {phase === "current" && (
            <ContextSingle
              q={currentStressQuestion}
              value={currentStress}
              onPick={(v) => {
                setCurrentStress(v);
                advance(() => setPhase("circumstances"));
              }}
              onBack={back}
            />
          )}

          {phase === "circumstances" && (
            <div className="q-enter" style={{ marginTop: 30 }}>
              <span className="q-section">{stepLabel}</span>
              <p className="q-text">{circumstanceQuestion.text}</p>
              {circumstanceQuestion.help && (
                <p className="muted" style={{ marginTop: 10 }}>{circumstanceQuestion.help}</p>
              )}
              <div className="answers" style={{ marginTop: 18 }}>
                {circumstanceQuestion.options.map((o) => {
                  const sel = circumstances.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      className={`answer${sel ? " sel" : ""}`}
                      onClick={() => toggleCircumstance(o.value)}
                    >
                      <span className="ico" aria-hidden="true">{sel ? "✓" : "○"}</span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 22 }}
                onClick={() => setPhase("details")}
              >
                Continue
              </button>
              <div className="q-nav">
                <button className="link-btn" onClick={back}>← Back</button>
              </div>
            </div>
          )}

          {phase === "details" && (
            <form className="q-enter" style={{ marginTop: 30 }} onSubmit={submitDetails}>
              <span className="q-section">{stepLabel}</span>
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
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={120}
                  placeholder="Optional"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
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
              <div className="q-nav">
                <button type="button" className="link-btn" onClick={back}>← Back</button>
              </div>
              <p className="fineprint">
                No spam. Unsubscribe anytime. Alight is a wellbeing tool, not
                medical advice.
              </p>
            </form>
          )}

          {phase === "result" && result && (
            <Result result={result} name={name} />
          )}
        </div>
      </main>
    </div>
  );
}

function ContextSingle({
  q,
  value,
  onPick,
  onBack,
}: {
  q: { text: string; help?: string; options: Choice[] };
  value: string;
  onPick: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="q-enter" style={{ marginTop: 30 }}>
      <span className="q-section">A little background</span>
      <p className="q-text">{q.text}</p>
      {q.help && <p className="muted" style={{ marginTop: 10 }}>{q.help}</p>}
      <div className="answers" style={{ marginTop: 18 }}>
        {q.options.map((o) => (
          <button
            key={o.value}
            className={`answer${value === o.value ? " sel" : ""}`}
            onClick={() => onPick(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="q-nav">
        <button className="link-btn" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

function Result({ result, name }: { result: ScoreResult; name: string }) {
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
        <h4>Your daily loop is ready</h4>
        <ul>
          {t.planFocus.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
          <li>Daily Regulate → Initiate → Win, matched to your state</li>
        </ul>
        <Link
          href="/app"
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: 20 }}
        >
          Start my first reset →
        </Link>
        <p className="fineprint">
          Free during early access. Add it to your home screen — no app store needed.
        </p>
      </div>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/" className="link-btn">← Back to home</Link>
      </p>
    </div>
  );
}
