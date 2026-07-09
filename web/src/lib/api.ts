/**
 * SeaSteps — warstwa danych.
 *
 * Mnożniki punktów (zgodne ze scoring engine backendu):
 *   spacer z kimś ×1.5, strefa natury ×3 — i one się mnożą (stackują).
 */

import { apiRequest, API_BASE, hasBackend } from './http'
import { currentUserId, setCurrentUserId } from './auth'

export { API_BASE }

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
  badges: { id: string; label: string; iconKey: string }[]
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
  iconKey: string
  /** 0–100 */
  progress: number
}

export interface EcoReport {
  id: string
  /** 'report' (problem) | 'cleanup' (pochwała) */
  kind?: 'report' | 'cleanup'
  type: string
  description: string
  location: string
  status: 'open' | 'cleaned' | 'reported'
  photoUrl?: string | null
  photoBeforeUrl?: string | null
  photoAfterUrl?: string | null
  createdAt?: string
}

export interface CreateEcoInput {
  kind: 'report' | 'cleanup'
  category?: string
  description?: string
  location?: string
  photoUrl?: string | null
  photoBeforeUrl?: string | null
  photoAfterUrl?: string | null
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

const ecoReports: EcoReport[] = [
  { id: 'x1', type: 'Śmieci na brzegu', description: 'Worek śmieci przy wejściu na plażę', location: 'Brzeźno, molo', status: 'cleaned' },
  { id: 'x2', type: 'Większe zanieczyszczenie', description: 'Rozlana substancja przy kanale', location: 'Górki Zachodnie', status: 'reported' },
]


// ── Ludzie do dopasowania (matching-lite) ─────────────────
export interface MatchPerson {
  id: string
  name: string
  avatar: string
  interests: string[]
  bio: string
  distance: string
}

export const INTEREST_OPTIONS = [
  'Spacery nad morzem',
  'Natura',
  'Mindfulness',
  'Eko',
  'Bieganie',
  'Joga',
  'Fotografia',
  'Pies',
  'Kawa i rozmowy',
  'Sprzątanie plaż',
  'Rower',
  'Medytacja',
]

const people: MatchPerson[] = [
  { id: 'p1', name: 'Marta', avatar: '🧘', interests: ['Mindfulness', 'Natura', 'Joga', 'Kawa i rozmowy'], bio: 'Poranne spacery dla resetu głowy.', distance: '1,2 km' },
  { id: 'p2', name: 'Bek', avatar: '🚶', interests: ['Spacery nad morzem', 'Eko', 'Pies', 'Sprzątanie plaż'], bio: 'Chodzę z psem, sprzątam przy okazji.', distance: '800 m' },
  { id: 'p3', name: 'Igor', avatar: '📷', interests: ['Fotografia', 'Natura', 'Spacery nad morzem'], bio: 'Łapię światło o wschodzie nad Zatoką.', distance: '2,4 km' },
  { id: 'p4', name: 'Hania', avatar: '🌿', interests: ['Eko', 'Mindfulness', 'Medytacja', 'Natura'], bio: 'Wolne tempo, dużo zieleni.', distance: '600 m' },
]

// ── Lokalni partnerzy / sponsorzy ─────────────────────────
export type SponsorIconKey = 'boat' | 'sup' | 'bike' | 'coffee' | 'sail' | 'food' | 'icecream'

export interface Sponsor {
  id: string
  name: string
  category: string
  offer: string
  pointsCost: number
  iconKey: SponsorIconKey
  place: string
}

const sponsors: Sponsor[] = [
  { id: 'sp1', name: 'Kajaki Zatoka', category: 'Wypożyczalnia kajaków', offer: '−20% na spływ', pointsCost: 120, iconKey: 'boat', place: 'Marina Gdynia' },
  { id: 'sp2', name: 'SUP Sopot', category: 'Deski SUP', offer: '1h gratis przy 2h', pointsCost: 150, iconKey: 'sup', place: 'Molo Sopot' },
  { id: 'sp3', name: 'Rowery Nadmorskie', category: 'Wypożyczalnia rowerów', offer: '−15% na dzień', pointsCost: 80, iconKey: 'bike', place: 'Bulwar Nadmorski' },
  { id: 'sp4', name: 'Przystań Kawa', category: 'Kawiarnia nad wodą', offer: 'Kawa −50%', pointsCost: 60, iconKey: 'coffee', place: 'Brzeźno' },
  { id: 'sp5', name: 'Szkoła Żeglarstwa', category: 'Rejsy i lekcje', offer: 'Lekcja próbna −30%', pointsCost: 200, iconKey: 'sail', place: 'Górki Zachodnie' },
  { id: 'sp6', name: 'Bar Przystań', category: 'Smażalnia ryb nad wodą', offer: '−15% na obiad', pointsCost: 100, iconKey: 'food', place: 'Sopot, molo' },
  { id: 'sp7', name: 'Lody Bałtyk', category: 'Lodziarnia rzemieślnicza', offer: '2 gałki w cenie 1', pointsCost: 50, iconKey: 'icecream', place: 'Gdynia, bulwar' },
]

// ── Wariant korporacyjny (B2B) ────────────────────────────
export interface TeamToday {
  company: string
  teamName: string
  members: number
  steps: number
  points: number
  rewardTitle: string
  rewardProgress: number
  teamMultiplier: number
}

export interface TeamRow {
  rank: number
  team: string
  points: number
  members: number
  isMine?: boolean
}

const teamToday: TeamToday = {
  company: 'Northwind',
  teamName: 'Zespół Marketing',
  members: 8,
  steps: 48210,
  points: 1240,
  rewardTitle: 'Dzień wolny dla zespołu',
  rewardProgress: 64,
  teamMultiplier: 2,
}

const teamLeaderboard: TeamRow[] = [
  { rank: 1, team: 'Sprzedaż', points: 1880, members: 11 },
  { rank: 2, team: 'Marketing', points: 1240, members: 8, isMine: true },
  { rank: 3, team: 'IT', points: 1120, members: 14 },
  { rank: 4, team: 'HR', points: 760, members: 5 },
]

const corporateEvents: EventItem[] = [
  { id: 'ce1', title: 'Spacer integracyjny działu', type: 'social', date: 'Śr 02.07 • 15:00', place: 'Bulwar Nadmorski', peopleCount: 8, points: 160 },
  { id: 'ce2', title: 'Firmowe sprzątanie plaży (CSR)', type: 'cleanup', date: 'Sob 05.07 • 10:00', place: 'Plaża Stogi', peopleCount: 22, points: 300 },
  { id: 'ce3', title: 'Sadzenie drzew — las firmowy', type: 'planting', date: 'Nd 13.07 • 11:00', place: 'TPK Dolina Radości', peopleCount: 16, points: 400 },
]

const teamRewards: Reward[] = [
  { id: 'tr1', title: 'Dzień wolny dla zespołu', kind: 'Nagroda firmowa', iconKey: 'dayoff', progress: 64 },
  { id: 'tr2', title: 'Budżet na integrację', kind: 'Nagroda firmowa', iconKey: 'integration', progress: 40 },
  { id: 'tr3', title: 'Dzień wellbeing', kind: 'Nagroda firmowa', iconKey: 'wellbeing', progress: 28 },
]

const wait = <T>(data: T, ms = 150): Promise<T> =>
  new Promise((res) => setTimeout(() => res(data), ms))

interface BackendProfile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  interests: string[]
  created_at: string
}

interface BackendReward {
  id: string
  title: string
  description: string | null
  cost_points: string
  partner_name: string | null
  type: string
  stock: number | null
  image_url: string | null
}

interface BackendLeaderRow {
  user_id: string
  display_name: string
  total_points: string
}

function mapProfile(p: BackendProfile): Profile {
  return {
    id: p.id,
    name: p.display_name,
    // backend trzyma URL/null; UI używa emoji — fallback gdy brak URL-a
    avatar: p.avatar_url ?? '🌊',
    interests: p.interests ?? [],
    // /me nie zwraca liczników ani odznak — wypełnia je wołający
    // (Profile.tsx) przez getProfileCounters() + getMyEcoReports().
    stats: { walks: 0, events: 0, ecoReports: 0 },
    badges: [],
  }
}

/**
 * Ikona nagrody na podstawie backendowego `type` (discount/eco/sponsor).
 * `eco` pokrywa i sadzenie drzew, i adopcję fok — rozróżniamy po tytule/opisie.
 * Nieznany typ => 'voucher'.
 */
function iconKeyForReward(r: BackendReward): string {
  const text = `${r.title} ${r.description ?? ''}`.toLowerCase()
  switch (r.type) {
    case 'eco':
      return text.includes('seal') || text.includes('foka') ? 'seal' : 'tree'
    case 'discount':
    case 'sponsor':
      return 'voucher'
    default:
      return 'voucher'
  }
}

function mapReward(r: BackendReward, totalPoints: number): Reward {
  const cost = parseFloat(r.cost_points)
  const progress = cost > 0 ? Math.min(100, Math.max(0, Math.round((totalPoints / cost) * 100))) : 0
  return {
    id: r.id,
    title: r.title,
    kind: r.partner_name ?? r.type,
    iconKey: iconKeyForReward(r),
    progress,
  }
}

function mapLeaderRow(row: BackendLeaderRow, index: number, myId: string | null): LeaderboardRow {
  return {
    rank: index + 1,
    name: row.display_name,
    avatar: '🚶',
    points: Math.round(parseFloat(row.total_points)), // rust_decimal => string
    isMe: myId != null && row.user_id === myId,
  }
}

interface BackendStats {
  today_steps: string
  today_points: string
  today_meters: string
  total_points: string
  total_walks: number
  streak_days: number
}

async function fetchProfile(): Promise<Profile> {
  const res = await apiRequest<BackendProfile>('/me')
  const p = res.data
  if (!p) throw new Error('Brak danych profilu')
  setCurrentUserId(p.id)
  return mapProfile(p)
}

export interface PatchProfileInput {
  display_name?: string
  interests?: string[]
}

async function patchProfile(input: PatchProfileInput): Promise<Profile> {
  const res = await apiRequest<BackendProfile>('/me', { method: 'PATCH', body: input })
  const p = res.data
  if (!p) throw new Error('Brak danych profilu')
  return mapProfile(p)
}

async function fetchStats(): Promise<TodayStats> {
  const res = await apiRequest<BackendStats>('/me/stats')
  const s = res.data
  if (!s) return today // fallback to mock when no data yet
  return {
    steps: Math.round(parseFloat(s.today_steps)),
    points: Math.round(parseFloat(s.today_points)),
    streakDays: s.streak_days,
    rewardProgress: Math.min(100, Math.round(parseFloat(s.total_points) / 10)),
    natureBonusActive: false,
    togetherBonusActive: false,
  }
}

export interface ProfileCounters {
  totalWalks: number
  streakDays: number
}

/**
 * Liczniki profilu (spacery, seria dni) z GET /me/stats — używane przez
 * Profile.tsx do realnych statystyk i odznak. Best-effort: przy błędzie
 * zwraca zera zamiast rzucać, żeby ekran profilu wciąż się wyrenderował.
 */
async function fetchProfileCounters(): Promise<ProfileCounters> {
  try {
    const res = await apiRequest<BackendStats>('/me/stats')
    const s = res.data
    return { totalWalks: s?.total_walks ?? 0, streakDays: s?.streak_days ?? 0 }
  } catch {
    return { totalWalks: 0, streakDays: 0 }
  }
}

interface BackendEcoReport {
  id: string
  kind: 'report' | 'cleanup'
  category: string
  description: string
  location: string
  status: 'open' | 'cleaned' | 'reported'
  photo_url: string | null
  photo_before_url: string | null
  photo_after_url: string | null
  created_at: string
}

function mapEcoReport(r: BackendEcoReport): EcoReport {
  return {
    id: r.id,
    kind: r.kind,
    type: r.category || (r.kind === 'cleanup' ? 'Posprzątane' : 'Zgłoszenie'),
    description: r.description,
    location: r.location,
    status: r.status,
    photoUrl: r.photo_url,
    photoBeforeUrl: r.photo_before_url,
    photoAfterUrl: r.photo_after_url,
    createdAt: r.created_at,
  }
}

/** Upload a photo to Supabase Storage (`eco-photos`); returns its public URL. */
export async function uploadEcoPhoto(file: File): Promise<string | null> {
  try {
    const { supabase, hasSupabase } = await import('./supabase')
    if (!hasSupabase()) return null
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const id = (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const path = `${id}.${ext}`
    const { error } = await supabase.storage.from('eco-photos').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })
    if (error) return null
    const { data } = supabase.storage.from('eco-photos').getPublicUrl(path)
    return data.publicUrl ?? null
  } catch {
    return null
  }
}

async function createEcoReport(input: CreateEcoInput): Promise<EcoReport | null> {
  if (!hasBackend()) return null
  const res = await apiRequest<BackendEcoReport>('/eco/reports', {
    method: 'POST',
    body: {
      kind: input.kind,
      category: input.category ?? '',
      description: input.description ?? '',
      location: input.location ?? '',
      photo_url: input.photoUrl ?? null,
      photo_before_url: input.photoBeforeUrl ?? null,
      photo_after_url: input.photoAfterUrl ?? null,
    },
  })
  return res.data ? mapEcoReport(res.data) : null
}

async function fetchEcoReports(): Promise<EcoReport[]> {
  if (!hasBackend()) return ecoReports
  try {
    const res = await apiRequest<BackendEcoReport[]>('/eco/reports')
    return (res.data ?? []).map(mapEcoReport)
  } catch {
    return ecoReports
  }
}

async function fetchMyEcoReports(): Promise<EcoReport[]> {
  if (!hasBackend()) return []
  try {
    const res = await apiRequest<BackendEcoReport[]>('/me/eco-reports')
    return (res.data ?? []).map(mapEcoReport)
  } catch {
    return []
  }
}

async function fetchRewards(): Promise<Reward[]> {
  const res = await apiRequest<BackendReward[]>('/rewards')
  // Postęp = ile % kosztu nagrody user już uzbierał. Best-effort: gdy /me/stats
  // nie odpowie, liczymy z 0 pkt zamiast wywalać cały ekran nagród.
  let totalPoints = 0
  try {
    const statsRes = await apiRequest<BackendStats>('/me/stats')
    totalPoints = statsRes.data ? parseFloat(statsRes.data.total_points) : 0
  } catch {
    totalPoints = 0
  }
  return (res.data ?? []).map((r) => mapReward(r, totalPoints))
}

async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const res = await apiRequest<BackendLeaderRow[]>('/leaderboard?per_page=20')
  const myId = currentUserId()
  return (res.data ?? []).map((row, i) => mapLeaderRow(row, i, myId))
}

export const api = {
  getProfile: fetchProfile,
  patchProfile,
  getProfileCounters: fetchProfileCounters,
  getToday: fetchStats,
  getCommunityWalks: () => wait(communityWalks),
  getEvents: () => wait(events),
  getRewards: fetchRewards,
  getEcoReports: fetchEcoReports,
  getMyEcoReports: fetchMyEcoReports,
  createEcoReport,
  uploadEcoPhoto,
  getLeaderboard: fetchLeaderboard,
  getMatches: () => wait(people),
  getSponsors: () => wait(sponsors),
  getTeamToday: () => wait(teamToday),
  getTeamLeaderboard: () => wait(teamLeaderboard),
  getCorporateEvents: () => wait(corporateEvents),
  getTeamRewards: () => wait(teamRewards),
}
