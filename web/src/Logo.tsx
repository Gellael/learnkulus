export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#14213d" />
      <path d="M10 50 Q32 -2 54 50" fill="none" stroke="#7a9bff" strokeWidth="5" strokeLinecap="round" />
      <line x1="8" y1="42.5" x2="40" y2="12.3" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="23.2" cy="28.2" r="5" fill="#ffd84d" stroke="#14213d" strokeWidth="2" />
    </svg>
  )
}
