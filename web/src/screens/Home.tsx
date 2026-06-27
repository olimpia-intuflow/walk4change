import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Footprints, Flame, Leaf, Users, CalendarHeart, AlertTriangle, Sparkles } from 'lucide-react'
import { Logo } from '../components/Logo'
import { FootstepTrail } from '../components/Footsteps'
import { Card, Pill, ProgressBar } from '../components/ui'
import { api, type TodayStats, type Reward } from '../lib/api'

function Ring({ value }: { value: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
      <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(15,139,141,0.12)" strokeWidth="12" />
      <motion.circle
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="132" y2="132">
          <stop stopColor="#0f8b8d" />
          <stop offset="1" stopColor="#58b86c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.08 },
})

export function Home() {
  const nav = useNavigate()
  const [today, setToday] = useState<TodayStats | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])

  useEffect(() => {
    api.getToday().then(setToday)
    api.getRewards().then(setRewards)
  }, [])

  const topReward = rewards[0]

  return (
    <div className="px-5 pt-5">
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <Logo />
        <div className="flex h-10 w-10 items-center justify-center rounded-full glass text-xl">🌊</div>
      </motion.div>

      <motion.p {...fade(1)} className="mt-5 font-display text-[26px] font-semibold leading-tight text-ink">
        Cześć Ola 👋<br />
        <span className="text-muted text-base font-body">Dobry dzień na spacer nad wodą.</span>
      </motion.p>

      {/* hero stat */}
      <motion.div {...fade(2)} className="mt-4">
        <Card className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 top-2 opacity-40">
            <FootstepTrail count={5} color="#58b86c" />
          </div>
          <div className="flex items-center gap-5">
            <div className="relative grid place-items-center">
              <Ring value={today?.rewardProgress ?? 0} />
              <div className="absolute text-center">
                <div className="font-display text-2xl font-bold leading-none text-deep">
                  {today ? today.steps.toLocaleString('pl-PL') : '—'}
                </div>
                <div className="text-[11px] font-bold text-muted">kroków dziś</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-sea">{today?.points ?? '—'}</span>
                <span className="text-sm font-bold text-muted">pkt</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[#c8761b]">
                <Flame size={16} /> {today?.streakDays ?? 0} dni z rzędu
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {today?.natureBonusActive && (
                  <Pill tone="leaf">
                    <Leaf size={12} /> natura ×3
                  </Pill>
                )}
                <Pill tone={today?.togetherBonusActive ? 'sea' : 'muted'}>
                  <Users size={12} /> z kimś ×1.5
                </Pill>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* progress to reward */}
      {topReward && (
        <motion.div {...fade(3)} className="mt-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sand/25 text-2xl">{topReward.icon}</div>
              <div className="flex-1">
                <div className="font-display text-lg font-bold text-ink">{topReward.title}</div>
                <div className="text-xs font-bold text-muted">{topReward.kind}</div>
              </div>
              <Pill tone="sand">
                <Sparkles size={12} /> blisko!
              </Pill>
            </div>
            <ProgressBar value={topReward.progress} label="Postęp do nagrody" />
          </Card>
        </motion.div>
      )}

      {/* quick actions */}
      <motion.div {...fade(4)} className="mt-5">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Co robimy?</h2>
        <div className="grid grid-cols-3 gap-3">
          <ActionTile onClick={() => nav('/walk')} icon={<Footprints size={22} />} label="Spacer" primary />
          <ActionTile onClick={() => nav('/events')} icon={<CalendarHeart size={22} />} label="Event" />
          <ActionTile onClick={() => nav('/eco')} icon={<AlertTriangle size={22} />} label="Zgłoś" />
        </div>
      </motion.div>

      <motion.p {...fade(5)} className="mt-6 text-center text-xs leading-relaxed text-muted">
        Każdy krok liczy się podwójnie, gdy idziesz nad wodą 🌊
      </motion.p>
    </div>
  )
}

function ActionTile({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-3xl px-2 py-4 text-sm font-bold transition active:scale-95 ${
        primary
          ? 'bg-gradient-to-br from-sea to-deep text-white shadow-[0_16px_30px_rgba(12,90,113,0.25)]'
          : 'glass text-deep'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
