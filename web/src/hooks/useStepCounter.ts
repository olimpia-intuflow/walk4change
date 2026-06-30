import { useCallback, useRef, useState } from 'react'

const STRIDE_M = 0.75 // meters per step (average adult stride)

type StepSource = 'gps'

export interface StepCounterResult {
  steps: number
  source: StepSource
  permissionNeeded: boolean
  requestPermission: () => Promise<void>
  addMeters: (m: number) => void
  reset: () => void
}

/**
 * GPS-primary step counter.
 *
 * Steps are derived purely from server-credited GPS distance
 * (`steps = round(meters / stride)`). This is robust across devices:
 * Android browsers frequently expose `devicemotion` but never trip a reliable
 * step peak (or the sensor is absent), which previously left the accelerometer
 * "active" while counting zero steps AND suppressing the GPS fallback.
 *
 * Because the backend already speed-caps + jitter-deadbands distance, GPS steps
 * are stationary-safe for free: standing still credits 0 m → 0 steps.
 */
export function useStepCounter(): StepCounterResult {
  const [steps, setSteps] = useState(0)
  const gpsAccumRef = useRef(0)

  const addMeters = useCallback((m: number) => {
    if (m <= 0) return
    gpsAccumRef.current += m / STRIDE_M
    setSteps(Math.round(gpsAccumRef.current))
  }, [])

  const reset = useCallback(() => {
    setSteps(0)
    gpsAccumRef.current = 0
  }, [])

  // Accelerometer permission is no longer used; keep the interface stable.
  const requestPermission = useCallback(async () => {}, [])

  return { steps, source: 'gps', permissionNeeded: false, requestPermission, addMeters, reset }
}
