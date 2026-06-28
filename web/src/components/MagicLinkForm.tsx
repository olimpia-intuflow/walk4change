import { useState } from 'react'
import { Envelope, CheckCircle, Sparkle, Warning } from '@phosphor-icons/react'
import { requestMagicLink } from '../lib/auth'

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (sent) {
    return (
      <div className="rounded-2xl bg-white/85 p-4 text-left ring-1 ring-white/60">
        <div className="flex items-center gap-2 font-bold text-deep">
          <CheckCircle size={20} weight="fill" className="text-leaf" /> Sprawdź skrzynkę!
        </div>
        <p className="mt-1 text-sm text-muted">
          Wysłaliśmy magiczny link na <b className="text-ink">{email}</b>. Kliknij go, żeby wejść — bez hasła.
        </p>
      </div>
    )
  }

  const send = async () => {
    if (!email.includes('@')) return
    setError(null)
    setLoading(true)
    try {
      await requestMagicLink(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się wysłać linku.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-white/60">
          <Envelope size={18} className="text-muted" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            type="email"
            placeholder="twój@email.pl"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
          />
        </div>
        <button
          onClick={send}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sea to-deep px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(12,90,113,0.25)] transition active:scale-95 disabled:opacity-60"
        >
          <Sparkle size={16} weight="fill" /> {loading ? 'Wysyłanie…' : 'Wyślij magiczny link'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          <Warning size={15} weight="fill" /> {error}
        </div>
      )}
    </div>
  )
}
