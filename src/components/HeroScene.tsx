"use client";

import dynamic from "next/dynamic";

// three.js only runs in the browser — load the canvas client-side.
const LifeScene = dynamic(() => import("./LifeScene"), {
  ssr: false,
  loading: () => <div className="hero-canvas-fallback" aria-hidden="true" />,
});

/**
 * Hero visual: a slow 3D wheel of a life being lived — work, friends, travel,
 * dancing, nights out — revolving through a warm sunset glow. The opposite of
 * being frozen. This is what you get up for.
 */
export default function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <span className="hero-scene-glow" />
      <div className="hero-canvas">
        <LifeScene />
      </div>
      <span className="orb-label">this is what you get up for</span>
    </div>
  );
}
