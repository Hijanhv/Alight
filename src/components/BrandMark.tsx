export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className="brand-mark"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-sunset" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB020" />
          <stop offset="0.5" stopColor="#FF3D8B" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="122" fill="url(#bm-sunset)" />
      <g fill="#FFF6EC">
        <path d="M256 208 C 208 150 150 148 124 186 C 102 220 138 260 188 256 C 222 253 246 244 256 234 Z" />
        <path d="M256 256 C 222 260 176 278 172 320 C 169 350 208 356 234 334 C 250 320 256 300 256 286 Z" />
        <path d="M256 208 C 304 150 362 148 388 186 C 410 220 374 260 324 256 C 290 253 266 244 256 234 Z" />
        <path d="M256 256 C 290 260 336 278 340 320 C 343 350 304 356 278 334 C 262 320 256 300 256 286 Z" />
      </g>
      <circle cx="188" cy="206" r="13" fill="#FFB020" />
      <circle cx="324" cy="206" r="13" fill="#FFB020" />
      <rect x="246" y="188" width="20" height="150" rx="10" fill="#3A1140" />
      <circle cx="256" cy="188" r="15" fill="#3A1140" />
      <path d="M256 180 C 250 160 240 152 230 148" stroke="#3A1140" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M256 180 C 262 160 272 152 282 148" stroke="#3A1140" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="229" cy="147" r="8" fill="#FFF6EC" />
      <circle cx="283" cy="147" r="8" fill="#FFF6EC" />
    </svg>
  );
}
