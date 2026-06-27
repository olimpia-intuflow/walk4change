/**
 * SeaSteps — warstwa danych.
 *
 * NA TERAZ: zwraca dane mockowe (demo na hackathon).
 * PÓŹNIEJ: backend Kamila (Rust/Axum) wystawia REST + WebSocket.
 *   Wystarczy ustawić VITE_API_BASE w .env i zamienić ciała funkcji na fetch().
 *   Kształt typów poniżej jest celowo zgodny z trasami backendu:
 *   /auth, /walks, /friends, /leaderboard, /profile, /rewards.
 *
 * Mnożniki punktów (zgodne ze scoring engine backendu):
 *   spacer z kimś ×1.5, strefa natury ×3 — i one się mnożą (stackują).
 */

export const API_BASE = import.meta.env.VITE_API_BASE ?? '' // '' = tryb mock

// ── Typy (kontrakt z backendem) ───────────────────────────
export interface Profile {
  id: string
  name: string
  avatar: string // emoji lub URL
  interests: string[]
  stats: {
    walks: number
    events: number
    ecoReports: number
  }
  badges: { id: string; label: string; icon: string }[]
}

export interface TodayStats {
  steps: number
  points: number
  streakDays: number
  /** procent do następnej nagrody, 0–100 */
  rewardProgress: number
  natureBonusActive: boolean
  togetherBonusActive: boolean
}

export interface CommunityWalk {
  id: string
  who: string
  avatar: string
  where: string
  when: string
  vibe: string
}

export type EventType = 'cleanup' | 'planting' | 'social' | 'baltic'

export interface EventItem {
  id: string
  title: string
  type: EventType
  date: string
  place: string
  peopleCount: number
  points: number
  joined?: boolean
}

export interface Reward {
  id: string
  title: string
  kind: string
  icon: string
  /** 0–100 */
  progress: number
}

export interface EcoReport {
  id: string
  type: string
  description: string
  location: string
  status: 'open' | 'cleaned' | 'reported'
}

export interface LeaderboardRow {
  rank: number
  name: string
  avatar: string
  points: number
  isMe?: boolean
}

// ── Scoring (lokalny, lustro silnika backendu) ────────────
export const MULTIPLIER = { together: 1.5, nature: 3 } as const

export function computeWalkPoints(opts: {
  steps: number
  withSomeone: boolean
  inNature: boolean
}): { base: number; total: number; multiplier: number } {
  const base = Math.round(opts.steps / 20) // ~1 pkt za 20 kroków
  let multiplier = 1
  if (opts.withSomeone) multiplier *= MULTIPLIER.together
  if (opts.inNature) multiplier *= MULTIPLIER.nature
  return { base, total: Math.round(base * multiplier), multiplier }
}

// ── Mocki demo ────────────────────────────────────────────
const me: Profile = {
  id: 'me',
  name: 'Ola',
  avatar: '🌊',
  interests: ['Spacery nad morzem', 'Natura', 'Mindfulness', 'Eko'],
  stats: { walks: 23, events: 4, ecoReports: 6 },
  badges: [
    { id: 'b1', label: 'Pierwszy spacer', icon: '👣' },
    { id: 'b2', label: '7 dni z rzędu', icon: '🔥' },
    { id: 'b3', label: 'Strażniczka brzegu', icon: '🌊' },
    { id: 'b4', label: 'Sadziła drzewo', icon: '🌳' },
  ],
}

const today: TodayStats = {
  steps: 6842,
  points: 148,
  streakDays: 4,
  rewardProgress: 72,
  natureBonusActive: true,
  togetherBonusActive: false,
}

const communityWalks: CommunityWalk[] = [
  { id: 'c1', who: 'Bek', avatar: '🚶', where: 'Bulwar Gdynia', when: 'Dziś 17:30', vibe: 'Spokojnie, nad wodą' },
  { id: 'c2', who: 'Marta', avatar: '🧘', where: 'Park Oliwski', when: 'Jutro 9:00', vibe: 'Poranny reset' },
  { id: 'c3', who: 'Kamil', avatar: '🏃', where: 'Plaża Brzeźno', when: 'Sob 11:00', vibe: 'Żwawo + kawa' },
]

const events: EventItem[] = [
  { id: 'e1', title: 'Sprzątanie plaży Brzeźno', type: 'cleanup', date: 'Sob 28.06 • 10:00', place: 'Molo Brzeźno', peopleCount: 18, points: 120 },
  { id: 'e2', title: 'Sadzenie drzew — Trójmiejski Park', type: 'planting', date: 'Nd 29.06 • 11:00', place: 'TPK, wejście Dolina Radości', peopleCount: 9, points: 200 },
  { id: 'e3', title: 'Spacer społeczny nad Zatoką', type: 'social', date: 'Pt 27.06 • 18:00', place: 'Bulwar Nadmorski', peopleCount: 24, points: 60 },
]

const rewards: Reward[] = [
  { id: 'r1', title: 'Adopcja foki', kind: 'Cel ekologiczny', icon: '🦭', progress: 72 },
  { id: 'r2', title: 'Posadzenie drzewa', kind: 'Cel ekologiczny', icon: '🌳', progress: 45 },
  { id: 'r3', title: 'Voucher partnera', kind: 'Nagroda lokalna', icon: '🎟️', progress: 30 },
]

const ecoReports: EcoReport[] = [
  { id: 'x1', type: 'Śmieci na brzegu', description: 'Worek śmieci przy wejściu na plażę', location: 'Brzeźno, molo', status: 'cleaned' },
  { id: 'x2', type: 'Większe zanieczyszczenie', description: 'Rozlana substancja przy kanale', location: 'Górki Zachodnie', status: 'reported' },
]

const leaderboard: LeaderboardRow[] = [
  { rank: 1, name: 'Marta', avatar: '🧘', points: 312 },
  { rank: 2, name: 'Bek', avatar: '🚶', points: 268 },
  { rank: 3, name: 'Ola', avatar: '🌊', points: 148, isMe: true },
  { rank: 4, name: 'Kamil', avatar: '🏃', points: 134 },
]

// symulacja opóźnienia sieci, żeby UI był „prawdziwy"
const wait = <T>(data: T, ms = 150): Promise<T> =>
  new Promise((res) => setTimeout(() => res(data), ms))

export const api = {
  getProfile: () => wait(me),
  getToday: () => wait(today),
  getCommunityWalks: () => wait(communityWalks),
  getEvents: () => wait(events),
  getRewards: () => wait(rewards),
  getEcoReports: () => wait(ecoReports),
  getLeaderboard: () => wait(leaderboard),
}
