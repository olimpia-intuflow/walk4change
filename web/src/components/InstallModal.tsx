import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DownloadSimple, X, Export, DotsThreeVertical } from '@phosphor-icons/react'
import { LogoMark } from './Logo'

const DISMISS_KEY = 'ss-install-dismissed-v2'

// Capture beforeinstallprompt at module load — before React mounts — so we never miss it
let _earlyPip: any = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); _earlyPip = e }, { once: true })
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  )
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
/** True only for real Safari on iOS — the ONLY iOS browser that can install a PWA. */
function isIOSSafari() {
  const ua = navigator.userAgent
  return (
    isIOS() &&
    /safari/i.test(ua) &&
    // Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Google app (GSA) → not Safari
    !/crios|fxios|edgios|gsa|fban|fbav|instagram|line/i.test(ua)
  )
}

/** Małe, nienachalne okienko instalacji w rogu — pojawia się zawsze (poza trybem standalone). */
export function InstallModal() {
  const [open, setOpen] = useState(false)
  const [deferred, setDeferred] = useState<any>(null)
  const ios = isIOS()

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    const capture = (e: any) => {
      e.preventDefault()
      setDeferred(e)
      setOpen(true)
    }

    // pick up any event captured before React mounted
    if (_earlyPip) {
      capture(_earlyPip)
      _earlyPip = null
    } else {
      window.addEventListener('beforeinstallprompt', capture)
    }

    window.addEventListener('appinstalled', () => setOpen(false))

    // Fallback: even WITHOUT a native prompt (iOS, Firefox, or Chrome that
    // already swallowed beforeinstallprompt), show the card after a short delay
    // so there is always a visible install affordance with instructions.
    const fallback = window.setTimeout(() => setOpen(true), 3500)

    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.clearTimeout(fallback)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setOpen(false)
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="glass fixed left-4 right-4 z-[60] rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(12,90,113,0.22)] sm:left-auto sm:right-6 sm:w-[330px] bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] sm:bottom-6"
        >
          <button onClick={dismiss} aria-label="Zamknij" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-sea/8 text-muted">
            <X size={14} weight="bold" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="shrink-0 drop-shadow-[0_8px_18px_rgba(15,139,141,0.3)]">
              <LogoMark size={44} />
            </div>
            <div>
              <div className="font-display text-base font-bold text-ink">Zainstaluj SeaSteps</div>
              <p className="mt-0.5 text-xs leading-snug text-muted">Pełny ekran, szybki dostęp, działa offline — bez sklepu.</p>
            </div>
          </div>

          {deferred ? (
            // Native install prompt available (Chrome/Edge/Android) → one tap.
            <button
              onClick={install}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sea to-deep py-2.5 text-sm font-bold text-white transition active:scale-95"
            >
              <DownloadSimple size={16} weight="fill" /> Zainstaluj
            </button>
          ) : ios && !isIOSSafari() ? (
            // iOS but NOT Safari (Chrome/Google app/in-app) — install is impossible
            // here; only Safari can add to home screen. Tap to copy the URL + hint.
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}) }}
              className="mt-3 w-full rounded-2xl bg-sea/8 px-3 py-2 text-left text-xs font-semibold text-deep transition active:scale-[0.98]"
            >
              Na iPhonie instalacja działa tylko w <b>Safari</b>.<br />
              Otwórz tam <b>seasteps.pl/app</b> → <Export size={14} weight="fill" className="inline align-text-bottom text-sea" /> <b>Udostępnij</b> → <b>„Do ekranu początkowego"</b>.
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-sea">Dotknij, aby skopiować adres</span>
            </button>
          ) : ios ? (
            // iOS Safari — no native prompt, show Share-sheet instructions.
            <p className="mt-3 rounded-2xl bg-sea/8 px-3 py-2 text-xs font-semibold text-deep">
              Dotknij <Export size={14} weight="fill" className="inline align-text-bottom text-sea" /> <b>Udostępnij</b> → <b>„Do ekranu początkowego"</b>
            </p>
          ) : (
            // Desktop/other browsers — menu instructions fallback.
            <p className="mt-3 rounded-2xl bg-sea/8 px-3 py-2 text-xs font-semibold text-deep">
              Otwórz menu przeglądarki <DotsThreeVertical size={14} weight="bold" className="inline align-text-bottom text-sea" /> → <b>„Zainstaluj aplikację"</b>
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
