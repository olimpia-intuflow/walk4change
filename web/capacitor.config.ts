import type { CapacitorConfig } from '@capacitor/cli'

// Natywna apka Android (spec 2026-07-13). Bundlujemy build webowy (webDir) —
// NIE server.url: zdalny URL kłóci się z pluginami i polityką Google Play.
// PWA na seasteps.pl zostaje bez zmian (ścieżka dla iPhone'ów).
const config: CapacitorConfig = {
  appId: 'pl.seasteps.app',
  appName: 'SeaSteps',
  webDir: 'dist',
}

export default config
