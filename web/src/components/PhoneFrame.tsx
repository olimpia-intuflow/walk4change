import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

/**
 * Rama „telefonu": na desktopie wyśrodkowana kolumna ~430px z miękką ramką,
 * na telefonie pełny ekran. Treść scrolluje się wewnątrz, bottom-nav przyklejony.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center sm:p-6">
      <div className="relative flex h-[100svh] w-full max-w-[440px] flex-col overflow-hidden bg-gradient-to-b from-bg-2 to-bg shadow-[0_40px_120px_rgba(12,90,113,0.22)] sm:h-[920px] sm:max-h-[94svh] sm:rounded-[40px] sm:ring-1 sm:ring-white/60">
        {/* ambient sea glow */}
        <div className="pointer-events-none absolute -top-24 right-[-20%] h-72 w-72 rounded-full bg-sea/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-[-15%] h-56 w-56 rounded-full bg-leaf/20 blur-3xl" />

        {/* scrollable content */}
        <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto pb-28">{children}</main>

        <BottomNav />
      </div>
    </div>
  )
}
