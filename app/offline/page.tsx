"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-950">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">You're Offline</h1>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            It looks like you've lost your internet connection. Some features may be limited until you're back online.
          </p>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Don't worry - any changes you make will be synchronized when your connection is restored.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full bg-coral hover:bg-coral-hover">Go to Dashboard</Button>
          </Link>

          <Button
            variant="outline"
            className="w-full border-black dark:border-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

