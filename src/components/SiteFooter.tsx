import Link from "next/link";
import BrandMark from "./BrandMark";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div style={{ maxWidth: "34ch" }}>
            <Link href="/" className="brand" style={{ fontSize: "1.25rem" }}>
              <BrandMark size={22} />
              Alight
            </Link>
            <p style={{ marginTop: 12 }}>
              Regulate your nervous system, then get moving. The anti-procrastination
              app that treats the cause, not the symptom.
            </p>
          </div>
          <nav className="stack" style={{ gap: 10 }} aria-label="Footer">
            <a href="/#science">The science</a>
            <a href="/#how">How it works</a>
            <Link href="/app">Open the app</Link>
            <Link href="/friends">Talk to Lily &amp; John</Link>
            <Link href="/quiz">Take the quiz</Link>
          </nav>
        </div>
        <p className="footer-note">
          Alight is a wellbeing tool, not a medical device. It does not diagnose, treat,
          or cure any condition and is not a substitute for professional mental-health
          care. If you are in crisis, please contact your local emergency services.
          <br />© {new Date().getFullYear()} Alight.
        </p>
      </div>
    </footer>
  );
}
