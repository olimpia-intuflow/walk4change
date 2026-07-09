import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Storefront, MapPin, Ticket, HandHeart } from '@phosphor-icons/react'
import { ScreenHeader, Card, Pill, PrimaryButton, SoonBadge, DemoBanner } from '../components/ui'
import { SponsorIcon } from '../components/SponsorIcon'
import { api, type Sponsor } from '../lib/api'

export function Partners() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    api.getSponsors().then(setSponsors)
  }, [])

  return (
    <div>
      <ScreenHeader
        title="Partnerzy"
        icon={<Storefront size={22} />}
        subtitle="Wymieniaj punkty na aktywność w naturze u lokalnych firm."
      />

      <div className="space-y-4 px-5 pt-2">
        <DemoBanner>
          Program partnerski w przygotowaniu. Tu lokalne firmy — kawiarnie, wypożyczalnie — będą nagradzać
          spacerowiczów. Poniżej przykłady, jak to będzie wyglądać. Chcesz być partnerem? Napisz do nas.
        </DemoBanner>

        <Card className="bg-gradient-to-br from-sea/10 to-leaf/10 p-4">
          <p className="text-sm font-semibold leading-snug text-deep">
            🌿 Każda wymiana wspiera lokalny biznes i wyciąga Cię na świeże powietrze — kajak, SUP, rower, rejs.
          </p>
        </Card>

        <div className="space-y-3">
          {sponsors.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sea/12 to-leaf/15 text-sea">
                    <SponsorIcon keyName={s.iconKey} size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold leading-tight text-ink">{s.name}</div>
                    <div className="text-xs font-bold text-muted">{s.category}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-muted">
                      <MapPin size={12} /> {s.place}
                    </div>
                  </div>
                  <SoonBadge />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Pill tone="leaf">
                    <Ticket size={12} /> {s.offer}
                  </Pill>
                  <span className="text-xs font-bold text-deep">{s.pointsCost} pkt</span>
                </div>
                <PrimaryButton disabled className="mt-3 w-full py-2.5 text-sm">
                  Wkrótce
                </PrimaryButton>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* sponsor acquisition */}
        <Card className="p-5 text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-sand/20 text-sea">
            <HandHeart size={26} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">Masz lokalny biznes?</h2>
          <p className="mx-auto mt-1 max-w-[280px] text-sm text-muted">
            Zostań partnerem SeaSteps — docieraj do aktywnych ludzi nad Bałtykiem i wspieraj zdrowy, eko styl życia.
            Napisz do nas, chętnie pogadamy.
          </p>
        </Card>
      </div>
    </div>
  )
}
