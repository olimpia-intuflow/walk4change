/**
 * SeaSteps — abstrakcja nad GPS (spec 2026-07-13, cz. Android).
 *
 * Przeglądarka/PWA: navigator.geolocation.watchPosition (jak dotąd — ścieżka
 * dla iPhone'ów zostaje bez zmian). Apka natywna (Capacitor Android):
 * @capacitor-community/background-geolocation — śledzenie działa też przy
 * zgaszonym ekranie (foreground service z widoczną notyfikacją), czyli główny
 * brak PWA na spacerze. Logika punktów zostaje w Walk.tsx — tu tylko źródło
 * pozycji.
 */

import { Capacitor, registerPlugin } from '@capacitor/core'

export interface GeoFix {
  lat: number
  lng: number
  /** Promień niepewności w metrach (null gdy nieznany). */
  accuracy: number | null
}

export interface GeoWatch {
  stop: () => void
}

/** Czy działamy w natywnej apce (Capacitor), a nie w przeglądarce/PWA. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

// Typy pluginu (definitions.d.ts @capacitor-community/background-geolocation).
interface BgLocation {
  latitude: number
  longitude: number
  accuracy: number
  simulated: boolean
  time: number | null
}
interface BgError extends Error {
  code?: string
}
interface BgPlugin {
  addWatcher(
    options: {
      backgroundMessage?: string
      backgroundTitle?: string
      requestPermissions?: boolean
      stale?: boolean
      distanceFilter?: number
    },
    callback: (position?: BgLocation, error?: BgError) => void,
  ): Promise<string>
  removeWatcher(options: { id: string }): Promise<void>
  openSettings(): Promise<void>
}

const BackgroundGeolocation = registerPlugin<BgPlugin>('BackgroundGeolocation')

/**
 * Nasłuch pozycji. Zwraca uchwyt ze `stop()` — bezpieczny do wywołania
 * w każdym momencie (w natywnym trybie czeka aż watcher się zarejestruje).
 */
export function watchPosition(
  onFix: (fix: GeoFix) => void,
  onError: (message: string) => void,
): GeoWatch {
  if (isNativeApp()) {
    const idPromise = BackgroundGeolocation.addWatcher(
      {
        backgroundTitle: 'Spacer trwa',
        backgroundMessage: 'SeaSteps liczy Twoją trasę i punkty.',
        requestPermissions: true,
        stale: false,
        // Serwer i tak ma deadband 5 m; filtr 3 m tnie szum bez utraty kroków.
        distanceFilter: 3,
      },
      (position, error) => {
        if (error) {
          onError(
            error.code === 'NOT_AUTHORIZED'
              ? 'Brak zgody na lokalizację. Nadaj uprawnienie w ustawieniach aplikacji.'
              : `GPS niedostępny: ${error.message}`,
          )
          return
        }
        if (!position) return
        // Pozycje symulowane (fake-GPS) odrzucamy — anty-fraud po stronie klienta.
        if (position.simulated) return
        onFix({ lat: position.latitude, lng: position.longitude, accuracy: position.accuracy ?? null })
      },
    )
    idPromise.catch((e: unknown) =>
      onError(`Nie udało się uruchomić GPS: ${e instanceof Error ? e.message : 'nieznany błąd'}`),
    )
    return {
      stop: () => {
        idPromise.then((id) => BackgroundGeolocation.removeWatcher({ id })).catch(() => {})
      },
    }
  }

  if (!('geolocation' in navigator)) {
    onError('Brak GPS w tej przeglądarce.')
    return { stop: () => {} }
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) =>
      onFix({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null,
      }),
    (err) => onError(`GPS niedostępny: ${err.message}. Włącz lokalizację i odśwież.`),
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
  )
  return { stop: () => navigator.geolocation.clearWatch(watchId) }
}

const DISCLOSURE_KEY = 'ss-geo-disclosure'

/**
 * Prominent disclosure (wymóg Google Play przy lokalizacji w tle):
 * dialog w apce PRZED pierwszą prośbą o uprawnienie. Web/PWA nie wymaga.
 */
export function needsLocationDisclosure(): boolean {
  if (!isNativeApp()) return false
  try {
    return localStorage.getItem(DISCLOSURE_KEY) !== '1'
  } catch {
    return false
  }
}

export function markLocationDisclosureAccepted(): void {
  try {
    localStorage.setItem(DISCLOSURE_KEY, '1')
  } catch {
    /* ignore */
  }
}
