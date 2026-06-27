import { Boat, Waves, Bicycle, Coffee, Sailboat, Storefront } from '@phosphor-icons/react'
import type { SponsorIconKey } from '../lib/api'

const map: Record<SponsorIconKey, typeof Boat> = {
  boat: Boat,
  sup: Waves,
  bike: Bicycle,
  coffee: Coffee,
  sail: Sailboat,
}

export function SponsorIcon({ keyName, size = 26 }: { keyName: SponsorIconKey; size?: number }) {
  const Ic = map[keyName] ?? Storefront
  return <Ic size={size} weight="fill" />
}
