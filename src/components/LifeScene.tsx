"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* the reasons to get up: a revolving wheel of a life being lived */
const MOMENTS = [
  { e: "💻", l: "work", a: "#FF3D8B", b: "#A855F7" },
  { e: "🎉", l: "party", a: "#FFB020", b: "#FF3D8B" },
  { e: "✈️", l: "travel", a: "#7C5CFF", b: "#FF3D8B" },
  { e: "👫", l: "friends", a: "#FF5A6A", b: "#FF3D8B" },
  { e: "🌅", l: "sunrise", a: "#FFC24B", b: "#FF7A59" },
  { e: "💃", l: "dance", a: "#FF3D8B", b: "#C06BFF" },
  { e: "🍹", l: "nights out", a: "#FF7A59", b: "#FF3D8B" },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* draw one glowing "moment" card into a canvas texture */
function makeCardTexture(m: (typeof MOMENTS)[number]) {
  const W = 320;
  const H = 400;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, m.a);
  grad.addColorStop(1, m.b);
  roundRect(ctx, 14, 14, W - 28, H - 28, 46);
  ctx.fillStyle = grad;
  ctx.fill();

  // glossy top highlight
  const hi = ctx.createLinearGradient(0, 14, 0, H * 0.5);
  hi.addColorStop(0, "rgba(255,255,255,0.35)");
  hi.addColorStop(1, "rgba(255,255,255,0)");
  roundRect(ctx, 14, 14, W - 28, H - 28, 46);
  ctx.fillStyle = hi;
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "150px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  ctx.fillText(m.e, W / 2, H * 0.42);

  ctx.font = "600 40px 'Plus Jakarta Sans',system-ui,sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillText(m.l, W / 2, H * 0.82);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function Card({
  m,
  index,
  total,
  radius,
  reduced,
}: {
  m: (typeof MOMENTS)[number];
  index: number;
  total: number;
  radius: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeCardTexture(m), [m]);
  const base = (index / total) * Math.PI * 2;

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    const angle = base + t * 0.32;
    g.position.x = Math.cos(angle) * radius;
    g.position.y = Math.sin(angle) * radius * 0.62;
    g.position.z = Math.sin(angle) * 1.2; // depth so front cards feel closer
    const s = 1 + Math.sin(angle) * 0.16; // front cards a touch bigger
    g.scale.setScalar(s);
    g.rotation.z = Math.sin(t * 0.5 + index) * 0.05;
    (g.children[0] as THREE.Mesh).renderOrder = g.position.z;
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[1.35, 1.68]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Sparkles({ count = 120, reduced }: { count?: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 12;
      a[i * 3 + 1] = (Math.random() - 0.5) * 8;
      a[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
    }
    return a;
  }, [count]);

  useFrame((state) => {
    if (reduced || !ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.004 + (i % 5) * 0.0006;
      arr[i * 3] += Math.sin(t * 0.5 + i) * 0.0018;
      if (arr[i * 3 + 1] > 4.2) arr[i * 3 + 1] = -4.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FFD37A"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Wheel({ reduced }: { reduced: boolean }) {
  return (
    <group rotation={[0.12, 0, 0]}>
      {MOMENTS.map((m, i) => (
        <Card key={m.l} m={m} index={i} total={MOMENTS.length} radius={2.5} reduced={reduced} />
      ))}
    </group>
  );
}

export default function LifeScene() {
  const reduced = useMemo(prefersReducedMotion, []);
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 52 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      frameloop={reduced ? "demand" : "always"}
    >
      <Wheel reduced={reduced} />
      <Sparkles reduced={reduced} />
    </Canvas>
  );
}
