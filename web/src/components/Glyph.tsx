import {
  HandHeart,
  Tree,
  Ticket,
  Sun,
  Confetti,
  FlowerLotus,
  Footprints,
  Flame,
  Waves,
  Star,
} from '@phosphor-icons/react'

const MAP: Record<string, typeof Star> = {
  // nagrody
  seal: HandHeart,
  tree: Tree,
  voucher: Ticket,
  dayoff: Sun,
  integration: Confetti,
  wellbeing: FlowerLotus,
  // odznaki
  firststep: Footprints,
  streak: Flame,
  shore: Waves,
}

export function Glyph({ k, size = 22, className = '' }: { k: string; size?: number; className?: string }) {
  const Ic = MAP[k] ?? Star
  return <Ic size={size} weight="fill" className={className} />
}
