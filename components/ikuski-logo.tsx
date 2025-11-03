export function IkuskiLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Eye icon representing vision/inspection */}
      <circle cx="20" cy="25" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="20" cy="25" r="6" fill="currentColor" />
      <path
        d="M8 25C8 25 12 17 20 17C28 17 32 25 32 25C32 25 28 33 20 33C12 33 8 25 8 25Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* IKUSKI text */}
      <text
        x="45"
        y="35"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        IKUSKI
      </text>

      {/* Drone path line */}
      <path d="M45 42 L185 42" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
    </svg>
  )
}
