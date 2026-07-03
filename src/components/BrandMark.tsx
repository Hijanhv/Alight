export default function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className="brand-mark"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C8574" />
          <stop offset="1" stopColor="#0E5A4F" />
        </linearGradient>
        <radialGradient id="bm-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F7D9A6" />
          <stop offset="0.55" stopColor="#E4952F" />
          <stop offset="1" stopColor="#E4952F" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#bm-g)" />
      <circle cx="256" cy="272" r="104" fill="url(#bm-sun)" />
      <rect x="96" y="300" width="320" height="26" rx="13" fill="#FAF6F0" opacity="0.92" />
      <rect x="150" y="348" width="212" height="20" rx="10" fill="#FAF6F0" opacity="0.55" />
    </svg>
  );
}
