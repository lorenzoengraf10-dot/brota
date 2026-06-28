import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <p className="text-4xl mb-4">🌱</p>
          <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
          <p className="text-gray-500 mb-6 text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#059669] text-white rounded-xl text-sm font-medium"
          >
            Recargar app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
