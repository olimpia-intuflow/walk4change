import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Footprints, CalendarHeart, Waves, Settings } from 'lucide-react'
import { ScreenHeader, Card, Pill } from '../components/ui'
import { FootstepTrail } from '../components/Footsteps'
import { api, type Profile as ProfileT } from '../lib/api'

export function Profile() {
  const nav = useNavigate()
  const [p, setP] = useState<ProfileT | null>(null)

  useEffect(() => {
    api.getProfile().then(setP)
  }, [])

  if (!p) return null

  return (
    <div>
      <ScreenHeader title="Profil" emoji="🌊" />

      <div className="px-5">
        {/* identity card */}
        <Card className="relative overflow-hidden p-6 text-center">
          <div className="pointer-events-none absolute -right-2 top-2 opacity-30">
            <FootstepTrail count={5} color="#0f8b8d" />
          </div>
          <button onClick={() => nav('/')} className="absolute right-4 top-4 text-muted">
            <Settings size={18} />
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-sea to-leaf text-5xl shadow-[0_16px_30px_rgba(15,139,141,0.3)]"
          >
            {p.avatar}
          </motion.div>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">{p.name}</h2>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {p.interests.map((i) => (
              <Pill key={i} tone="muted">
                {i}
              </Pill>
            ))}
          </div>
        </Card>

        {/* stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard icon={<Footprints size={20} />} value={p.stats.walks} label="spacerów" />
          <StatCard icon={<CalendarHeart size={20} />} value={p.stats.events} label="eventów" />
          <StatCard icon={<Waves size={20} />} value={p.stats.ecoReports} label="eko-zgłoszeń" />
        </div>

        {/* badges */}
        <h2 className="mb-3 mt-6 font-display text-lg font-bold text-ink">Odznaki</h2>
        <div className="grid grid-cols-2 gap-3">
          {p.badges.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="flex items-center gap-3 p-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sand/20 text-2xl">{b.icon}</div>
                <span className="text-sm font-bold leading-tight text-ink">{b.label}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <Card className="p-4 text-center">
      <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-sea/10 text-sea">{icon}</div>
      <div className="font-display text-2xl font-bold text-deep">{value}</div>
      <div className="text-[11px] font-bold text-muted">{label}</div>
    </Card>
  )
}
