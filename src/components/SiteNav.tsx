import Link from "next/link";
import BrandMark from "./BrandMark";

export default function SiteNav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Alight home">
          <BrandMark />
          Alight
        </Link>
        <nav className="nav-links">
          <a className="nav-link" href="/#science">The science</a>
          <a className="nav-link" href="/#how">How it works</a>
          <Link className="nav-link" href="/app">Open app</Link>
          <Link href="/quiz" className="btn btn-glow">
            Take the 2-min quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}
