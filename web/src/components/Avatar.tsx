const grads = [
  'from-sea to-leaf',
  'from-deep to-sea',
  'from-leaf to-sea',
  'from-sea to-deep',
]

/** Awatar = inicjał na morskim gradiencie (czysto, bez kolorowych emoji). */
export function Avatar({ name, size = 44, className = '' }: { name: string; size?: number; className?: string }) {
  const letter = (name.trim().charAt(0) || '?').toUpperCase()
  const idx = (name.charCodeAt(0) || 0) % grads.length
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${grads[idx]} font-display font-bold text-white ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.42) }}>{letter}</span>
    </div>
  )
}
