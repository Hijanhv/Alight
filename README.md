# Alight

**Stop procrastinating by regulating your nervous system.**

Alight reframes procrastination as a *freeze response* from a dysregulated nervous
system — not a willpower problem. It uses 2-minute, state-matched somatic resets to
help you leave survival mode and take one small first action.

- **Landing + quiz funnel** → an 18-statement nervous-system check-in that returns your
  type (Wired / Shutdown / Overloaded / Steady), a Regulation Score, and a free first reset.
- **Daily loop:** Regulate → Initiate → Win.
- Built to ship on free tiers and installable as a PWA on iPhone & Android.

## Stack

- **Next.js** (App Router, TypeScript) — landing, quiz, PWA, serverless API — deploys free on Vercel
- Custom CSS design system (no framework) — warm "first light" palette, light + dark
- _Planned:_ Supabase (auth + leads), Dodo Payments (Merchant of Record), Gemini free tier for AI narrative

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Structure

```
src/
  app/
    layout.tsx         # fonts, SEO metadata, PWA hooks
    page.tsx           # landing page
    quiz/page.tsx      # the funnel quiz
    globals.css        # design system (tokens, both themes)
    icon.svg           # favicon
  components/
    SiteNav / SiteFooter / BrandMark
    Quiz.tsx           # interactive quiz (scoring, result, protocol, lead capture)
  lib/
    quiz-data.ts       # questions, scoring model, nervous-system types, protocols
public/
  manifest.webmanifest # PWA manifest
  icon.svg
```

> Alight is a wellbeing tool, not a medical device. It does not diagnose, treat, or cure
> any condition and is not a substitute for professional care.
