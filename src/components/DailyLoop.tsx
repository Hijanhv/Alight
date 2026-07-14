"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import BreathTimer from "./BreathTimer";
import { pickProtocol } from "@/lib/protocols";
import {
  loadProfile,
  loadProgress,
  completedToday,
  recordWin,
  type Profile,
  type Progress,
} from "@/lib/progress";

type Phase = "today" | "checkin" | "regulate" | "initiate" | "win" | "done";

const STATES = [
  { key: "wired", label: "Wired / racing", desc: "Tense, restless, can’t switch off", mark: "●" },
  { key: "shutdown", label: "Shut down / foggy", desc: "Numb, heavy, unmotivated", mark: "●" },
  { key: "overloaded", label: "Both at once", desc: "Wired and drained together", mark: "◑" },
  { key: "steady", label: "Fairly steady", desc: "Calm-ish, just need a nudge", mark: "○" },
];

const SUGGESTIONS = [
  "Open the doc and write one sentence",
  "Reply to one message",
  "Put on shoes and step outside",
  "Clear one thing off my desk",
  "Set a 5-minute timer and begin",
];

function AppBar({ streak }: { streak?: number }) {
  return (
    <header className="nav quiz-topbar">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Alight home">
          <BrandMark />
          Alight
        </Link>
        {typeof streak === "number" && streak > 0 && (
          <span className="muted" style={{ fontSize: "0.9rem" }}>🔥 {streak}-day streak</span>
        )}
      </div>
    </header>
  );
}

export default function DailyLoop() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("today");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [state, setState] = useState<string>("wired");
  const [task, setTask] = useState("");

  useEffect(() => {
    setProfile(loadProfile());
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  if (!mounted || !progress) {
    return (
      <div className="quiz-shell">
        <AppBar />
        <main className="quiz-main">
          <div className="quiz-card" />
        </main>
      </div>
    );
  }

  const doneToday = completedToday(progress);
  const proto = pickProtocol(state, progress.totalSessions);
  const greetName = profile?.name ? `, ${profile.name}` : "";

  function finishWin() {
    const { progress: np, profile: npf } = recordWin(state, task.trim() || "one small step");
    setProgress(np);
    if (npf) setProfile(npf);
    setPhase("done");
  }

  return (
    <div className="quiz-shell">
      <AppBar streak={progress.streak} />
      <main className="quiz-main">
        <div className="quiz-card">
          {phase === "today" && (
            <div className="q-enter">
              <span className="q-section">Today</span>
              <h1 className="q-text" style={{ marginTop: 12 }}>
                {doneToday ? `Loop complete${greetName}. Nice.` : `Ready when you are${greetName}.`}
              </h1>
              <div className="stat-row">
                <div className="stat"><div className="n">{progress.streak}</div><div className="l">day streak</div></div>
                <div className="stat"><div className="n">{progress.totalSessions}</div><div className="l">resets done</div></div>
                <div className="stat"><div className="n">{profile?.regulationScore ?? "·"}</div><div className="l">regulation</div></div>
              </div>
              {doneToday ? (
                <>
                  <p className="muted" style={{ marginTop: 24 }}>
                    You regulated and took a step today. That is the whole game. Come
                    back tomorrow to keep the streak alive.
                  </p>
                  <button className="btn btn-ghost btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => setPhase("checkin")}>
                    Do another reset
                  </button>
                </>
              ) : (
                <>
                  {!profile && (
                    <p className="muted" style={{ marginTop: 20 }}>
                      Tip:{" "}
                      <Link href="/quiz" style={{ color: "var(--primary)", fontWeight: 600 }}>
                        take the 2-minute quiz
                      </Link>{" "}
                      to personalize your loop, or just start now.
                    </p>
                  )}
                  <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }} onClick={() => setPhase("checkin")}>
                    Start today’s loop
                  </button>
                </>
              )}
              <p style={{ marginTop: 22, textAlign: "center" }}>
                <Link href="/friends" className="chat-friend-link">
                  Need to talk? Chat with Lily or John →
                </Link>
              </p>
            </div>
          )}

          {phase === "checkin" && (
            <div className="q-enter">
              <span className="q-section">Regulate · step 1 of 3</span>
              <h2 className="q-text">How does your system feel right now?</h2>
              <div className="answers">
                {STATES.map((s) => (
                  <button
                    key={s.key}
                    className={`answer${state === s.key ? " sel" : ""}`}
                    onClick={() => {
                      setState(s.key);
                      setPhase("regulate");
                    }}
                  >
                    <span className="ico" aria-hidden="true">{s.mark}</span>
                    <span>
                      <strong>{s.label}</strong>
                      <br />
                      <span className="muted" style={{ fontSize: "0.9rem" }}>{s.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="q-nav">
                <button className="link-btn" onClick={() => setPhase("today")}>← Back</button>
              </div>
            </div>
          )}

          {phase === "regulate" && (
            <div className="q-enter">
              <span className="q-section">Regulate · your reset</span>
              <h2 className="q-text" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)" }}>{proto.name}</h2>
              <ol className="step-list">
                {proto.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <div style={{ marginTop: 22 }}>
                <BreathTimer seconds={proto.seconds} onDone={() => setPhase("initiate")} />
              </div>
            </div>
          )}

          {phase === "initiate" && (
            <div className="q-enter">
              <span className="q-section">Initiate · step 2 of 3</span>
              <h2 className="q-text">Now, one tiny first step.</h2>
              <p className="muted" style={{ marginTop: 10 }}>
                Small enough that starting feels easy. Your system is calmer now. Use it.
              </p>
              <div className="field">
                <input
                  type="text"
                  placeholder="e.g. open the doc and write one sentence"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </div>
              <div className="suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setTask(s)}>{s}</button>
                ))}
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 24 }}
                onClick={() => setPhase("win")}
                disabled={!task.trim()}
              >
                I am ready →
              </button>
            </div>
          )}

          {phase === "win" && (
            <div className="q-enter" style={{ textAlign: "center" }}>
              <span className="q-section">Win · step 3 of 3</span>
              <h2 className="q-text">{task.trim() || "Your first step"}</h2>
              <p className="muted" style={{ marginTop: 12 }}>
                Go do just the first step now. Then come back and mark it.
              </p>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 26 }} onClick={finishWin}>
                I did it ✓
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="q-enter" style={{ textAlign: "center" }}>
              <div className="orb-wrap" style={{ maxWidth: 160 }} aria-hidden="true">
                <div className="orb" />
              </div>
              <h2 className="q-text" style={{ marginTop: 8 }}>That is a win.</h2>
              <p className="lede" style={{ margin: "14px auto 0" }}>
                You regulated, then you started. {progress.streak}-day streak.
              </p>
              <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={() => setPhase("today")}>
                Back to today
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
