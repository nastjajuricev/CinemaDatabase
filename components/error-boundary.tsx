"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="relative w-32 h-32 mb-8">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)`,
                  opacity: 0.6,
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full bg-red-600"
                  style={{
                    boxShadow: `0 0 20px rgba(255,0,0,0.6)`,
                  }}
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Something went wrong</h1>

            <p className="text-xl md:text-2xl mb-8 text-center text-red-500">I'm afraid I can't do this.</p>

            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg"
            >
              Return to Dashboard
            </Button>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-gray-900 rounded-lg max-w-2xl overflow-auto">
                <p className="text-red-400 font-mono mb-2">{this.state.error?.toString()}</p>
                <p className="text-gray-400 font-mono whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
              </div>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

