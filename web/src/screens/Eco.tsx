import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Camera, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { ScreenHeader, Card, Pill, PrimaryButton } from '../components/ui'
import { api, type EcoReport, type Reward } from '../lib/api'

const statusMeta: Record<EcoReport['status'], { label: string; tone: 'leaf' | 'sand' | 'sea' }> = {
  cleaned: { label: '✓ posprzątane', tone: 'leaf' },
  reported: { label: '⏳ zgłoszone', tone: 'sand' },
  open: { label: 'otwarte', tone: 'sea' },
}

export function Eco() {
  const [reports, setReports] = useState<EcoReport[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [sent, setSent] = useState(false)
  const [desc, setDesc] = useState('')

  useEffect(() => {
    api.getEcoReports().then(setReports)
    api.getRewards().then(setRewards)
  }, [])

  return (
    <div>
      <ScreenHeader title="Eko" emoji="🌊" subtitle="Coś da się posprzątać — sprzątasz. Większy problem — zgłaszasz." />

      <div className="space-y-4 px-5 pt-2">
        {/* form */}
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold text-ink">Zgłoś problem</h2>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex flex-col items-center py-4 text-center"
            >
              <CheckCircle2 size={48} className="text-leaf" />
              <p className="mt-2 font-bold text-deep">Dzięki! Zgłoszenie wysłane.</p>
              <p className="text-sm text-muted">+15 pkt za czujność 🌱</p>
              <button onClick={() => { setSent(false); setDesc('') }} className="mt-3 text-sm font-bold text-sea">
                Zgłoś kolejne
              </button>
            </motion.div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Śmieci', 'Rozlewisko', 'Dzikie wysypisko', 'Inne'].map((t) => (
                  <Pill key={t} tone="muted">
                    {t}
                  </Pill>
                ))}
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Opisz krótko, co widzisz…"
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-sea/30"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-sea/40 bg-white/50 py-3 text-sm font-bold text-deep">
                  <Camera size={18} /> Zdjęcie
                </button>
                <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-sea/40 bg-white/50 py-3 text-sm font-bold text-deep">
                  <MapPin size={18} /> Lokalizacja
                </button>
              </div>
              <PrimaryButton onClick={() => setSent(true)} className="w-full">
                <Send size={18} /> Wyślij zgłoszenie
              </PrimaryButton>
            </div>
          )}
        </Card>

        {/* recent reports */}
        <div>
          <h2 className="mb-2 font-display text-lg font-bold text-ink">Ostatnie zgłoszenia</h2>
          <div className="space-y-2.5">
            {reports.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 p-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sea/10 text-lg">🌊</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink">{r.type}</div>
                  <div className="text-xs text-muted">{r.location}</div>
                </div>
                <Pill tone={statusMeta[r.status].tone}>{statusMeta[r.status].label}</Pill>
              </Card>
            ))}
          </div>
        </div>

        {/* rewards */}
        <div>
          <h2 className="mb-2 font-display text-lg font-bold text-ink">Nagrody</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {rewards.map((rw) => (
              <Card key={rw.id} className="p-3 text-center">
                <div className="text-3xl">{rw.icon}</div>
                <div className="mt-1.5 text-xs font-bold leading-tight text-ink">{rw.title}</div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sea/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sea to-leaf" style={{ width: `${rw.progress}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
