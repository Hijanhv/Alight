"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import { FRIENDS, type FriendKey } from "@/lib/friends";
import { loadChat, saveChat, clearChat, type ChatMsg } from "@/lib/chat-store";
import { loadProfile } from "@/lib/progress";
import { getUid } from "@/lib/uid";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="quiz-shell">
      <header className="nav quiz-topbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Alight home">
            <BrandMark />
            Alight
          </Link>
          <Link href="/app" className="link-btn">Daily loop →</Link>
        </div>
      </header>
      <main className="quiz-main">
        <div className="quiz-card">{children}</div>
      </main>
    </div>
  );
}

export default function Friends() {
  const [mounted, setMounted] = useState(false);
  const [friend, setFriend] = useState<FriendKey | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!friend) return;
    const existing = loadChat(friend);
    setMessages(
      existing.length ? existing : [{ role: "assistant", content: FRIENDS[friend].opener }]
    );
  }, [friend]);

  useEffect(() => {
    if (friend && messages.length) saveChat(friend, messages);
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, friend]);

  async function send() {
    const text = input.trim();
    if (!text || busy || !friend) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const profile = loadProfile();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friend,
          messages: next,
          profile: { name: profile?.name, typeKey: profile?.typeKey },
          userId: getUid(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        typeof data.reply === "string" ? data.reply : "I'm here. Tell me a little more?";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having trouble reaching you right now, but I'm still here. Try again in a moment?",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) {
    return (
      <Shell>
        <div />
      </Shell>
    );
  }

  if (!friend) {
    return (
      <Shell>
        <div className="q-enter">
          <span className="q-section">Your Alight friends</span>
          <h1 className="q-text" style={{ marginTop: 12 }}>Who do you want to talk to?</h1>
          <p className="muted" style={{ marginTop: 10 }}>
            Two friends, always here. Pick whoever fits right now. You can switch anytime.
          </p>
          <div className="friend-pick">
            {(Object.keys(FRIENDS) as FriendKey[]).map((k) => {
              const f = FRIENDS[k];
              return (
                <button key={k} className="friend-card" onClick={() => setFriend(k)}>
                  <span className="friend-av" style={{ background: `var(${f.accentVar})` }}>
                    {f.initial}
                  </span>
                  <span className="friend-meta">
                    <b>{f.name}</b>
                    <span className="friend-tag">{f.tagline}</span>
                    <span className="friend-blurb">{f.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  const f = FRIENDS[friend];
  return (
    <div className="chat-shell">
      <header className="nav quiz-topbar">
        <div className="container nav-inner">
          <button className="chat-back" onClick={() => setFriend(null)} aria-label="Back to friends">
            <span aria-hidden="true">←</span>
            <span className="chat-av" style={{ background: `var(${f.accentVar})` }}>{f.initial}</span>
            {f.name}
          </button>
          <button
            className="link-btn"
            onClick={() => {
              clearChat(friend);
              setMessages([{ role: "assistant", content: f.opener }]);
            }}
          >
            Start over
          </button>
        </div>
      </header>

      <div className="chat-thread" ref={threadRef}>
        <div className="container chat-inner">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="bubble assistant typing" aria-label={`${f.name} is typing`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input">
        <div className="container chat-input-inner">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${f.name}…`}
            aria-label={`Message ${f.name}`}
          />
          <button className="btn btn-primary" onClick={send} disabled={busy || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
