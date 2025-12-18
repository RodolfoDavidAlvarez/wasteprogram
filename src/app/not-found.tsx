"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen app-background flex items-center justify-center p-6">
      <div className="text-center max-w-md rounded-xl border border-border bg-card/80 backdrop-blur p-8 shadow-sm">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
