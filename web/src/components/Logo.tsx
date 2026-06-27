export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f8b8d" />
          <stop offset="1" stopColor="#58b86c" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#lg)" />
      <ellipse cx="24" cy="30" rx="7" ry="9.5" fill="#fff" fillOpacity="0.92" transform="rotate(-12 24 30)" />
      <circle cx="18.5" cy="20.5" r="2.7" fill="#fff" fillOpacity="0.92" />
      <circle cx="24" cy="18.5" r="2.4" fill="#fff" fillOpacity="0.92" />
      <circle cx="29" cy="20" r="2.1" fill="#fff" fillOpacity="0.92" />
      <ellipse cx="42" cy="42" rx="6" ry="8" fill="#fff" fillOpacity="0.7" transform="rotate(10 42 42)" />
      <circle cx="37.5" cy="34" r="2.2" fill="#fff" fillOpacity="0.7" />
      <circle cx="42.5" cy="32.5" r="2" fill="#fff" fillOpacity="0.7" />
      <circle cx="46.5" cy="34" r="1.8" fill="#fff" fillOpacity="0.7" />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={36} />
      <span className="font-display text-[22px] font-bold tracking-tight text-deep">
        Sea<span className="text-sea">Steps</span>
      </span>
    </div>
  )
}
