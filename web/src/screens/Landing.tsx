import { Link } from 'react-router-dom'
import {
  Footprints,
  Leaf,
  UsersThree,
  Waves,
  Trophy,
  HandHeart,
  Buildings,
  Storefront,
  Recycle,
  Heart,
  ChartLineUp,
  MapTrifold,
} from '@phosphor-icons/react'
import { Logo } from '../components/Logo'
import { FootstepTrail } from '../components/Footsteps'
import { MagicLinkForm } from '../components/MagicLinkForm'

function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-b from-bg-2 to-bg p-4 shadow-[0_40px_100px_rgba(12,90,113,0.28)] ring-1 ring-white/60">
        <div className="pointer-events-none absolute -top-16 right-[-20%] h-44 w-44 rounded-full bg-sea/20 blur-3xl" />
        <Logo />
        <div className="relative mt-4 glass rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-sea to-leaf font-display text-lg font-bold text-white">6842</div>
            <div>
              <div className="font-display text-3xl font-bold text-sea">148 <span className="text-sm text-muted">pkt</span></div>
              <div className="text-xs font-bold text-[#c8761b]">4 dni z rzędu</div>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-bold text-[#2f7a45]">natura ×3</span>
            <span className="rounded-full bg-sea/10 px-2.5 py-1 text-xs font-bold text-deep">z kimś ×1.5</span>
          </div>
        </div>
        <div className="relative mt-3 glass rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sand/25 text-[#c8761b]"><HandHeart size={20} weight="fill" /></span>
            <div className="flex-1">
              <div className="text-sm font-bold text-ink">Adopcja foki</div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sea/10">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-sea to-leaf" />
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-3 flex justify-center"><FootstepTrail count={4} color="#0f8b8d" /></div>
      </div>
    </div>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</section>
}

export function Landing() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-gradient-to-b from-sea/10 to-transparent" />

      {/* nav */}
      <Section className="flex items-center justify-between py-5">
        <Logo />
        <Link to="/login" className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-deep ring-1 ring-white/60 transition hover:bg-white">
          Zaloguj się
        </Link>
      </Section>

      {/* hero */}
      <Section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-deep ring-1 ring-white/60">
            <Waves size={14} weight="fill" /> Trójmiasto • Bałtyk • razem
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Wyjdź nad morze — <span className="text-sea">nie sam</span>, <span className="text-leaf">nie bez sensu</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            SeaSteps zamienia spacer w grę, która łączy Cię z ludźmi i naturą. Zbierasz punkty za ruch — więcej,
            gdy idziesz z kimś i blisko wody. Mniej scrollowania, więcej życia.
          </p>
          <div className="mt-7 max-w-md">
            <MagicLinkForm />
            <p className="mt-2 text-xs font-semibold text-muted">Za darmo • bez hasła • wejdź jednym klikiem</p>
          </div>
        </div>
        <PhoneMock />
      </Section>

      {/* problem */}
      <Section className="py-12">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Znasz to uczucie?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { t: 'Siedzisz cały dzień', d: 'Praca, ekran, kanapa. Wiesz, że ruch by pomógł — ale samemu jakoś się nie chce.' },
            { t: '„Poszłabym, ale nie sama"', d: 'Najczęstszy powód, dla którego nie wychodzimy nad wodę, to brak kompana — nie brak chęci.' },
            { t: 'Rozregulowany układ nerwowy', d: 'Brak kontaktu z naturą i ludźmi to stres i przebodźcowanie. Morze realnie to wycisza.' },
          ].map((p) => (
            <div key={p.t} className="glass rounded-[26px] p-5">
              <h3 className="font-display text-lg font-bold text-ink">{p.t}</h3>
              <p className="mt-1.5 text-sm leading-snug text-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* solution + mnożniki */}
      <Section className="py-8">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-sea/10 to-leaf/10 p-7 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Rozwiązanie: spacer, który się opłaca</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Nie mówimy „idź nad morze, bo zdrowe". Po prostu nagroda jest większa tam, gdzie chcemy, żebyś był —
            z ludźmi i w naturze. To steruje zachowaniem bez kazania.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { x: '×1', l: 'sam', icon: <Footprints size={22} weight="fill" /> },
              { x: '×1.5', l: 'z kimś', icon: <UsersThree size={22} weight="fill" /> },
              { x: '×2', l: 'w grupie', icon: <UsersThree size={22} weight="fill" /> },
              { x: '×3', l: 'w naturze', icon: <Leaf size={22} weight="fill" /> },
            ].map((m) => (
              <div key={m.l} className="rounded-2xl bg-white/70 p-4 text-center">
                <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-sea/10 text-sea">{m.icon}</span>
                <div className="font-display text-2xl font-bold text-sea">{m.x}</div>
                <div className="text-xs font-bold text-muted">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* korzyści */}
      <Section className="py-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-ink sm:text-3xl">Co dostajesz</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <UsersThree size={22} weight="fill" />, t: 'Ludzie obok', d: 'Profil i zainteresowania łączą Cię z osobami na wspólny spacer, bieganie czy rozmowę.' },
            { icon: <Trophy size={22} weight="fill" />, t: 'Gra, nie obowiązek', d: 'Kroki, punkty, streak i cele. Ruch staje się lekki i wciągający.' },
            { icon: <HandHeart size={22} weight="fill" />, t: 'Nagrody eko', d: 'Zamieniaj punkty na realne dobro: posadź drzewo, adoptuj fokę, voucher od partnera.' },
            { icon: <Recycle size={22} weight="fill" />, t: 'Wspólne akcje', d: 'Sprzątanie plaży, sadzenie drzew, akcje pro-Bałtyk — razem i z sensem.' },
          ].map((f) => (
            <div key={f.t} className="glass rounded-[26px] p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sea/12 to-leaf/15 text-sea">{f.icon}</span>
              <h3 className="font-display text-lg font-bold text-ink">{f.t}</h3>
              <p className="mt-1 text-sm leading-snug text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* dowód naukowy */}
      <Section className="py-8">
        <div className="rounded-[32px] bg-deep p-7 text-white sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
            <ChartLineUp size={14} weight="fill" /> Oparte na badaniach
          </span>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="font-display text-3xl font-bold">r = 0,42</div>
              <p className="mt-1 text-sm text-white/80">Więź z naturą realnie przekłada się na zachowania prośrodowiskowe (meta-analiza, 13 tys. osób).</p>
            </div>
            <div>
              <div className="font-display text-3xl font-bold">38 badań</div>
              <p className="mt-1 text-sm text-white/80">Przywiązanie do konkretnego miejsca zwiększa troskę o nie. Bliskość rodzi troskę — nie moralizowanie.</p>
            </div>
            <div>
              <div className="font-display text-3xl font-bold">powroty &gt; wyjścia</div>
              <p className="mt-1 text-sm text-white/80">Regularny, powtarzalny kontakt z naturą buduje trwałą więź. Dlatego nagradzamy powroty na tę samą plażę.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* dla kogo + B2B + partnerzy */}
      <Section className="grid gap-4 py-8 lg:grid-cols-3">
        <div className="glass rounded-[28px] p-6">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sea/12 to-leaf/15 text-sea"><Heart size={24} weight="fill" /></span>
          <h3 className="font-display text-xl font-bold text-ink">Dla ludzi</h3>
          <p className="mt-2 text-sm text-muted">Mieszkańców Trójmiasta i każdego, kto chce więcej ruchu, natury i kontaktu — bez presji i bez chodzenia samemu.</p>
        </div>
        <div className="glass rounded-[28px] p-6">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sea/12 to-leaf/15 text-sea"><Buildings size={24} weight="fill" /></span>
          <h3 className="font-display text-xl font-bold text-ink">Dla firm</h3>
          <p className="mt-2 text-sm text-muted">Wersja B2B: zespoły zbierają punkty wspólnie, nagrody ustalone z firmą (dzień wolny, gadżety). Wellbeing + integracja + eko w godzinach pracy.</p>
        </div>
        <div className="glass rounded-[28px] p-6">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sea/12 to-leaf/15 text-sea"><Storefront size={24} weight="fill" /></span>
          <h3 className="font-display text-xl font-bold text-ink">Dla lokalnych biznesów</h3>
          <p className="mt-2 text-sm text-muted">Kawiarnie, wypożyczalnie kajaków, food trucki nad wodą — zniżki do odebrania na miejscu ściągają ludzi nad morze.</p>
        </div>
      </Section>

      {/* final CTA */}
      <Section className="py-10">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sea to-deep p-8 text-center text-white sm:p-14">
          <div className="pointer-events-none absolute -bottom-16 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[50%] bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-xl">
            <MapTrifold size={40} weight="fill" className="mx-auto text-white/90" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Zrób pierwszy krok nad wodę</h2>
            <p className="mt-3 text-white/85">Dołącz jednym klikiem — bez hasła. Resztą zajmie się Bałtyk.</p>
            <div className="mx-auto mt-6 max-w-md [&_input]:text-ink">
              <MagicLinkForm />
            </div>
          </div>
        </div>
      </Section>

      <footer className="py-8 text-center text-sm text-muted">SeaSteps — Hack4Change 2026 · Gdańsk 🌊</footer>
    </div>
  )
}
