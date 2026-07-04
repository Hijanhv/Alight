"use client";

import { useEffect, useState } from "react";

// A gentle guided reset: a breathing orb that scales with an inhale/exhale
// cue, plus a soft countdown. The continue button is always available —
// the timer is guidance, not a gate.
export default function BreathTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setRemaining(Math.max(0, seconds - elapsed));
      if (!r) setPhase(Math.floor(elapsed / 4) % 2 === 0 ? "in" : "out");
    }, 250);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <div style={{ textAlign: "center" }}>
      <div className="orb-wrap" style={{ maxWidth: 200 }} aria-hidden="true">
        <div className="orb-ring" />
        <div
          className="orb"
          style={{
            animation: "none",
            transform: reduce
              ? "scale(1)"
              : phase === "in"
              ? "scale(1.12)"
              : "scale(0.82)",
            transition: "transform 3.8s ease-in-out",
          }}
        />
      </div>
      <p className="q-section" style={{ marginTop: 12 }}>
        {reduce ? "Breathe slowly" : phase === "in" ? "Breathe in…" : "Breathe out…"}
      </p>
      <div className="score-num" style={{ fontSize: "1.8rem", marginTop: 6 }}>
        {mm}:{String(ss).padStart(2, "0")}
      </div>
      <button
        className="btn btn-primary btn-lg"
        style={{ marginTop: 18 }}
        onClick={onDone}
        type="button"
      >
        {remaining > 0 ? "I feel steadier →" : "Continue →"}
      </button>
    </div>
  );
}
