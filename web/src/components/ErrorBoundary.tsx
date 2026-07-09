import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card, PrimaryButton } from './ui'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

// Górny error boundary — łapie błędy renderowania, żeby jeden wyjątek
// nie wygaszał całej aplikacji bez możliwości powrotu.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary złapał błąd:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-5">
          <Card className="max-w-sm p-6 text-center">
            <h1 className="font-display text-xl font-bold text-ink">Coś poszło nie tak</h1>
            <p className="mt-2 text-sm leading-snug text-muted">
              Aplikacja napotkała nieoczekiwany błąd. Spróbuj odświeżyć stronę.
            </p>
            <PrimaryButton className="mt-5 w-full" onClick={() => location.reload()}>
              Odśwież
            </PrimaryButton>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
