"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getClientConfig } from "@/lib/api-config"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Loader2, LogIn } from "lucide-react"
import { isDropboxKeyConfigured } from "@/lib/dropbox-integration"

// This would be defined elsewhere in your application
interface DropboxAuthState {
  isAuthenticated: boolean
  token?: string
  accountId?: string
  displayName?: string
}

export default function DropboxIntegration() {
  const [authState, setAuthState] = useState<DropboxAuthState>({ isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const config = getClientConfig()
  const isConfigured = isDropboxKeyConfigured()

  // Check if user is already authenticated with Dropbox
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This would be your actual implementation to check auth status
        const storedToken = localStorage.getItem("dropbox_token")
        const storedAccountId = localStorage.getItem("dropbox_account_id")
        const storedName = localStorage.getItem("dropbox_display_name")

        if (storedToken && storedAccountId) {
          setAuthState({
            isAuthenticated: true,
            token: storedToken,
            accountId: storedAccountId,
            displayName: storedName || "Dropbox User",
          })
        }
      } catch (error) {
        console.error("Error checking Dropbox auth:", error)
      }
    }

    if (isConfigured) {
      checkAuth()
    }
  }, [isConfigured])

  const handleConnect = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuration Error",
        description: "Dropbox API key is not configured.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // This would be your actual implementation
      // For demonstration, we'll simulate the OAuth flow

      // 1. Generate the OAuth URL
      const redirectUri = `${window.location.origin}/auth/dropbox/callback`
      const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${config.dropbox.appKey}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`

      // 2. Open the OAuth window
      window.location.href = authUrl

      // Note: The actual flow would continue in your callback page
      // which would handle the token and redirect back to your app
    } catch (error) {
      console.error("Error connecting to Dropbox:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to Dropbox. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsLoading(true)

    try {
      // Clear stored tokens
      localStorage.removeItem("dropbox_token")
      localStorage.removeItem("dropbox_account_id")
      localStorage.removeItem("dropbox_display_name")

      // Update state
      setAuthState({ isAuthenticated: false })

      toast({
        title: "Disconnected",
        description: "Your Dropbox account has been disconnected.",
      })
    } catch (error) {
      console.error("Error disconnecting from Dropbox:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect from Dropbox.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Dropbox integration is not configured. Please add the NEXT_PUBLIC_DROPBOX_APP_KEY environment variable.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dropbox Integration</CardTitle>
        <CardDescription>Connect your Dropbox account to sync and backup your film collection</CardDescription>
      </CardHeader>
      <CardContent>
        {authState.isAuthenticated ? (
          <div className="space-y-2">
            <p className="text-sm">
              Connected as: <span className="font-medium">{authState.displayName}</span>
            </p>
            <p className="text-sm text-muted-foreground">Your film collection will sync with Dropbox automatically.</p>
          </div>
        ) : (
          <p className="text-sm">
            Connect your Dropbox account to enable automatic backup and synchronization of your film collection across
            devices.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {authState.isAuthenticated ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Disconnect
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            Connect Dropbox
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

