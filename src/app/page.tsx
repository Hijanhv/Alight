import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroScene from "@/components/HeroScene";

const symptoms = [
  "My mind races and won't switch off",
  "Tight chest, clenched jaw",
  "I scroll to avoid the task",
  "I dread opening my laptop",
  "I feel guilty when I rest",
  "Wired, but exhausted",
];

const loop = [
  {
    step: "1",
    title: "Regulate",
    body: "A 2-minute somatic reset matched to your state: a physiological sigh to downshift, or orienting and movement to lift you out of shutdown. You leave survival mode first.",
  },
  {
    step: "2",
    title: "Initiate",
    body: "With your body calm, Alight gives you one tiny, genuinely doable first action, small enough that starting feels safe instead of threatening.",
  },
  {
    step: "3",
    title: "Win",
    body: "You log the win and watch your Regulation Score climb. Safety compounds: a regulated nervous system finds the next start far easier than the last.",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Nervous-system-first</span>
            <h1 className="display">
              You are not lazy. Your nervous system is stuck in{" "}
              <span className="serif-em">survival mode.</span>
            </h1>
            <p className="lede">
              Procrastination is a freeze response, not a willpower gap. Alight
              treats the real cause, a dysregulated nervous system, with
              2-minute somatic resets, not another to-do list.
            </p>
            <div className="hero-cta">
              <Link href="/quiz" className="btn btn-primary btn-lg">
                Take the 2-minute quiz
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                See how it works
              </a>
            </div>
            <div className="hero-trust">
              <span><i className="dot" /> Free to start</span>
              <span><i className="dot glow" /> Built on polyvagal science</span>
              <span><i className="dot support" /> iPhone &amp; Android</span>
            </div>
          </div>

          <HeroScene />
        </div>
      </section>

      {/* CREDIBILITY STRIP */}
      <div className="cred">
        <div className="container cred-inner">
          <span>Built on <b>polyvagal theory</b></span>
          <span className="sep">·</span>
          <span><b>Somatic</b> resets, not meditation timers</span>
          <span className="sep">·</span>
          <span><b>2 minutes</b> a day</span>
          <span className="sep">·</span>
          <span>Works on <b>iPhone &amp; Android</b></span>
        </div>
      </div>

      {/* THESIS / MANIFESTO */}
      <section className="section thesis band" id="thesis">
        <div className="container">
          <span className="eyebrow">The thesis</span>
          <h2 className="display">You were never lazy. You were overloaded.</h2>
          <div className="inner">
            <p>
              If you have downloaded every planner, tried the 5am routine, and
              still cannot start, the problem was never your discipline.
            </p>
            <p>
              Procrastination is what a stressed nervous system does. Under enough
              pressure (anxiety, burnout, a chaotic home, money worries, old
              wounds, simply too much on your plate) your brain stops seeing a
              task and starts seeing a threat. And when something feels like a
              threat, the oldest part of you does the safest thing it knows: it
              avoids.
            </p>
          </div>
          <ul className="relatable">
            <li>It is why you can show up for everyone else, but freeze on your own goals.</li>
            <li>It is why rest leaves you guilty instead of restored.</li>
            <li>It is why the important message sits unopened for a week.</li>
            <li>It is why you feel exhausted and wired, busy and stuck, all at once.</li>
          </ul>
          <div className="inner">
            <p className="close">
              None of that is a character flaw. It is your mental health, your
              circumstances, and a nervous system that has been carrying too much
              for too long. Once you see procrastination for what it really is,
              everything you have been blaming yourself for finally makes sense.
            </p>
          </div>
          <Link href="/quiz" className="btn btn-ghost thesis-cta">
            See what is really going on →
          </Link>
        </div>
      </section>

      {/* REFRAME / SCIENCE */}
      <section className="section" id="science">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">The real reason</span>
            <h2 className="display">The freeze you have been calling procrastination.</h2>
            <p className="measure">
              Under chronic stress, your body reads an ordinary task the way it
              would read a threat. It doesn&apos;t fight or flee. It{" "}
              <strong>freezes</strong>. That is the pit in your stomach when you
              open the laptop, the fog, the scroll. It is physiology, not
              character. And physiology is something you can actually change.
            </p>
          </div>
          <div className="chips">
            {symptoms.map((s) => (
              <span className="chip" key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section band" id="how">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">The daily loop</span>
            <h2 className="display">Regulate, then get moving.</h2>
            <p className="measure">
              Every day in Alight follows one honest loop. No 40-minute
              meditations, no guilt streaks, just enough to get your system
              safe and your next action started.
            </p>
          </div>
          <div className="loop">
            {loop.map((c) => (
              <article className="loop-card" key={c.step}>
                <span className="loop-step">{c.step}</span>
                <h3 className="display">{c.title}</h3>
                <p>{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">Why Alight is different</span>
            <h2 className="display">Not another meditation app. Not another to-do list.</h2>
          </div>
          <div className="compare">
            <div className="compare-item">
              <h4>Meditation apps</h4>
              <p>Calm you down, then leave you sitting there, still not started.</p>
            </div>
            <div className="compare-item">
              <h4>Productivity apps</h4>
              <p>Push you to act while your body is still in threat. So you avoid them too.</p>
            </div>
            <div className="compare-item us">
              <h4>Alight</h4>
              <p>Regulates your state <em>and</em> moves you, the two things procrastination needs, in the right order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section band" id="pricing">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">Early access</span>
            <h2 className="display">Free while we are in early access.</h2>
            <p className="measure">
              Alight is free right now. Take the quiz, learn your nervous-system
              type, and start regulating today. No card, no catch. Paid plans will
              come later, once the full daily loop is ready.
            </p>
          </div>
          <div className="hero-cta" style={{ marginTop: 28 }}>
            <Link href="/quiz" className="btn btn-primary btn-lg">
              Start free, take the quiz
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section cta-band">
        <div className="container">
          <span className="eyebrow">2 minutes, honest questions</span>
          <h2 className="display" style={{ marginTop: 14 }}>
            Find out what is really behind your procrastination.
          </h2>
          <div className="hero-cta" style={{ justifyContent: "center", marginTop: 28 }}>
            <Link href="/quiz" className="btn btn-primary btn-lg">
              Take the free quiz
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
