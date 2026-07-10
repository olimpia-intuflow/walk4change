/**
 * Realna mapka spaceru (czysty Leaflet, bez react-leaflet).
 *
 * Rysuje trasę z realnych punktów GPS {lat,lng} na kafelkach OSM.
 * - live=true: ślad na żywo — polyline się rozrasta, mapa "goni" ostatni punkt.
 * - live=false: podgląd zapisanej trasy — fitBounds na całość.
 *
 * Uwaga (Vite/PWA): domyślne ikony markerów Leaflet ciągną assety po ścieżkach,
 * które się psują w bundlerze — używamy tylko polyline + circleMarker, bez L.marker.
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface RealMapPoint {
  lat: number
  lng: number
}

interface RealMapProps {
  points: RealMapPoint[]
  live?: boolean
  className?: string
}

const ROUTE_COLOR = '#0f8b8d'
// Trójmiasto — widok startowy, gdy jeszcze nie ma żadnego punktu.
const DEFAULT_CENTER: L.LatLngTuple = [54.44, 18.57]
const DEFAULT_ZOOM = 11
const LIVE_ZOOM = 16

export function RealMap({ points, live = false, className = '' }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)

  // Inicjalizacja mapy — raz, przy montażu.
  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    // Bug ucięcia kafelków: kontener bywa 0×0 w momencie montażu (animacje/PWA).
    window.setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
      polylineRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aktualizacja trasy przy zmianie punktów.
  useEffect(() => {
    const map = mapRef.current
    if (!map || points.length === 0) return

    const latlngs: L.LatLngTuple[] = points.map((p) => [p.lat, p.lng])
    const last = latlngs[latlngs.length - 1]

    if (!polylineRef.current) {
      polylineRef.current = L.polyline(latlngs, { color: ROUTE_COLOR, weight: 4 }).addTo(map)
    } else {
      polylineRef.current.setLatLngs(latlngs)
    }

    if (!markerRef.current) {
      markerRef.current = L.circleMarker(last, {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: ROUTE_COLOR,
        fillOpacity: 1,
      }).addTo(map)
    } else {
      markerRef.current.setLatLng(last)
    }

    if (live) {
      if (points.length === 1) map.setView(last, LIVE_ZOOM)
      else map.panTo(last)
    } else if (points.length >= 2) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [24, 24] })
    } else {
      map.setView(last, LIVE_ZOOM)
    }
  }, [points, live])

  const emptyLabel = live ? 'Czekam na sygnał GPS…' : 'Brak zapisanej trasy'

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className || 'h-56'}`}>
      <div ref={containerRef} className="h-full w-full" />
      {points.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/70 px-4 text-center text-sm font-bold text-muted">
          {emptyLabel}
        </div>
      )}
    </div>
  )
}
