"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen app-background flex items-center justify-center p-6">
      <div className="text-center max-w-md rounded-xl border border-border bg-card/80 backdrop-blur p-8 shadow-sm">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground/70 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
