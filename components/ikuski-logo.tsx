export function IkuskiLogo({ className = "h-8", variant = "full" }: { className?: string; variant?: "full" | "icon" }) {
  if (variant === "icon") {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M24 4L40 14V34L24 44L8 34V14L24 4Z" stroke="url(#gradient1)" strokeWidth="2.5" fill="none" />

        {/* Eye/Vision element */}
        <ellipse cx="24" cy="24" rx="14" ry="10" stroke="url(#gradient1)" strokeWidth="2" fill="none" />
        <circle cx="24" cy="24" r="5" fill="url(#gradient1)" />

        {/* Scan lines */}
        <line x1="10" y1="24" x2="18" y2="24" stroke="url(#gradient2)" strokeWidth="1.5" opacity="0.6" />
        <line x1="30" y1="24" x2="38" y2="24" stroke="url(#gradient2)" strokeWidth="1.5" opacity="0.6" />

        {/* Corner markers */}
        <path d="M12 12L12 16M12 12L16 12" stroke="url(#gradient2)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 12L36 16M36 12L32 12" stroke="url(#gradient2)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 36L12 32M12 36L16 36" stroke="url(#gradient2)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 36L36 32M36 36L32 36" stroke="url(#gradient2)" strokeWidth="1.5" strokeLinecap="round" />

        <defs>
          <linearGradient id="gradient1" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="1" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 6L32 12V28L20 34L8 28V12L20 6Z" stroke="url(#logoGradient1)" strokeWidth="2" fill="none" />

      {/* Eye/Vision element */}
      <ellipse cx="20" cy="20" rx="10" ry="7" stroke="url(#logoGradient1)" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="20" r="3.5" fill="url(#logoGradient1)" />

      {/* Scan lines */}
      <line x1="10" y1="20" x2="14" y2="20" stroke="url(#logoGradient2)" strokeWidth="1.2" opacity="0.6" />
      <line x1="26" y1="20" x2="30" y2="20" stroke="url(#logoGradient2)" strokeWidth="1.2" opacity="0.6" />

      {/* IKUSKI text */}
      <text
        x="48"
        y="32"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        IKUSKI
      </text>

      {/* Tagline */}
      <text
        x="48"
        y="42"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="8"
        fontWeight="500"
        fill="currentColor"
        opacity="0.6"
        letterSpacing="1"
      >
        AI RUST DETECTION
      </text>

      <defs>
        <linearGradient id="logoGradient1" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  )
}
