import { motion } from 'motion/react'

function Footprint({ side, color = '#0f8b8d', opacity = 1 }: { side: 'l' | 'r'; color?: string; opacity?: number }) {
  const flip = side === 'r' ? -1 : 1
  return (
    <svg width="20" height="26" viewBox="0 0 20 26" fill="none" style={{ opacity }}>
      <g transform={`scale(${flip} 1) translate(${flip === -1 ? -20 : 0} 0)`}>
        <ellipse cx="9" cy="16" rx="6.5" ry="9" fill={color} transform="rotate(-10 9 16)" />
        <circle cx="4.5" cy="5" r="2.4" fill={color} />
        <circle cx="9.5" cy="3" r="2.1" fill={color} />
        <circle cx="14" cy="4.5" r="1.8" fill={color} />
      </g>
    </svg>
  )
}

/**
 * Ślad stóp pojawiający się krok po kroku (l, r, l, r…),
 * jakby ktoś szedł w górę kadru. Lekki, morski akcent.
 */
export function FootstepTrail({
  count = 6,
  color = '#0f8b8d',
  className = '',
  loop = true,
}: {
  count?: number
  color?: string
  className?: string
  loop?: boolean
}) {
  const steps = Array.from({ length: count })
  return (
    <div className={`flex flex-col-reverse items-center gap-1.5 ${className}`}>
      {steps.map((_, i) => (
        <motion.div
          key={i}
          className={i % 2 === 0 ? 'translate-x-3' : '-translate-x-3'}
          initial={{ opacity: 0, y: 6, scale: 0.6 }}
          animate={{ opacity: [0, 1, 1, 0.25], y: 0, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: i * 0.22,
            repeat: loop ? Infinity : 0,
            repeatDelay: count * 0.22,
          }}
        >
          <Footprint side={i % 2 === 0 ? 'l' : 'r'} color={color} opacity={0.85} />
        </motion.div>
      ))}
    </div>
  )
}

/** Pojedyncza para stópek do dekoracji tła. */
export function FootstepGlyph({ size = 22, color = '#0f8b8d', opacity = 0.5 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <div className="flex gap-0.5 animate-drift" style={{ width: size, opacity }}>
      <Footprint side="l" color={color} />
    </div>
  )
}
